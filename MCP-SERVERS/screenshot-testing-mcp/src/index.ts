#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { chromium, Browser, Page } from 'playwright';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Screenshot Testing MCP Server
 *
 * Provides visual regression testing tools:
 * - Capture component screenshots
 * - Detect visual regressions
 * - Compare against baseline images
 * - Test responsive layouts
 * - Validate dark mode
 */

export interface ViewportSize {
  width: number;
  height: number;
  name?: string;
}

export interface CaptureOptions {
  url: string;
  name: string;
  viewport?: ViewportSize;
  selector?: string;
  theme?: 'light' | 'dark';
}

export interface ComparisonResult {
  pixelDifference: number;
  percentageDifference: number;
  passed: boolean;
  threshold: number;
  diffImagePath?: string;
}

export interface ScreenshotTestResult {
  name: string;
  baseline: string;
  current: string;
  comparison: ComparisonResult;
}

class ScreenshotTestingServer {
  private server: Server;
  private browser: Browser | null = null;
  private baselineDir: string;
  private currentDir: string;
  private diffDir: string;
  private threshold: number;

  constructor() {
    this.server = new Server(
      {
        name: 'screenshot-testing-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // Configure directories from environment or use defaults
    this.baselineDir = process.env.BASELINE_DIR || './.screenshots/baseline';
    this.currentDir = process.env.CURRENT_DIR || './.screenshots/current';
    this.diffDir = process.env.DIFF_DIR || './.screenshots/diff';
    this.threshold = parseFloat(process.env.THRESHOLD || '0.1');

    this.setupHandlers();
  }

  private setupHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: this.getTools(),
    }));

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'capture_screenshot':
            return await this.handleCaptureScreenshot(args as any);
          case 'compare_screenshots':
            return await this.handleCompareScreenshots(args as any);
          case 'capture_responsive':
            return await this.handleCaptureResponsive(args as any);
          case 'capture_themes':
            return await this.handleCaptureThemes(args as any);
          case 'run_visual_tests':
            return await this.handleRunVisualTests(args as any);
          case 'update_baseline':
            return await this.handleUpdateBaseline(args as any);
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          content: [{ type: 'text', text: `Error: ${errorMessage}` }],
          isError: true,
        };
      }
    });
  }

  private getTools(): Tool[] {
    return [
      {
        name: 'capture_screenshot',
        description: 'Capture a screenshot of a URL or component',
        inputSchema: {
          type: 'object',
          properties: {
            url: {
              type: 'string',
              description: 'URL to capture',
            },
            name: {
              type: 'string',
              description: 'Screenshot name (without extension)',
            },
            viewport: {
              type: 'object',
              description: 'Viewport size',
              properties: {
                width: { type: 'number' },
                height: { type: 'number' },
              },
            },
            selector: {
              type: 'string',
              description: 'CSS selector to capture (optional, captures full page if omitted)',
            },
            theme: {
              type: 'string',
              enum: ['light', 'dark'],
              description: 'Theme to use (default: light)',
            },
          },
          required: ['url', 'name'],
        },
      },
      {
        name: 'compare_screenshots',
        description: 'Compare current screenshot with baseline',
        inputSchema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Screenshot name to compare',
            },
            threshold: {
              type: 'number',
              description: 'Difference threshold percentage (default: 0.1)',
            },
          },
          required: ['name'],
        },
      },
      {
        name: 'capture_responsive',
        description: 'Capture screenshots at multiple viewport sizes',
        inputSchema: {
          type: 'object',
          properties: {
            url: {
              type: 'string',
              description: 'URL to capture',
            },
            name: {
              type: 'string',
              description: 'Base screenshot name',
            },
            viewports: {
              type: 'array',
              description: 'Viewport sizes to test',
              items: {
                type: 'object',
                properties: {
                  width: { type: 'number' },
                  height: { type: 'number' },
                  name: { type: 'string' },
                },
              },
            },
          },
          required: ['url', 'name'],
        },
      },
      {
        name: 'capture_themes',
        description: 'Capture screenshots for light and dark themes',
        inputSchema: {
          type: 'object',
          properties: {
            url: {
              type: 'string',
              description: 'URL to capture',
            },
            name: {
              type: 'string',
              description: 'Base screenshot name',
            },
            themes: {
              type: 'array',
              description: 'Themes to test (default: ["light", "dark"])',
              items: {
                type: 'string',
                enum: ['light', 'dark'],
              },
            },
          },
          required: ['url', 'name'],
        },
      },
      {
        name: 'run_visual_tests',
        description: 'Run visual regression tests on all screenshots in baseline',
        inputSchema: {
          type: 'object',
          properties: {
            pattern: {
              type: 'string',
              description: 'Screenshot name pattern (optional, tests all if omitted)',
            },
          },
        },
      },
      {
        name: 'update_baseline',
        description: 'Update baseline screenshot with current version',
        inputSchema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Screenshot name to update',
            },
          },
          required: ['name'],
        },
      },
    ];
  }

  private async getBrowser(): Promise<Browser> {
    if (!this.browser) {
      this.browser = await chromium.launch();
    }
    return this.browser;
  }

  private async handleCaptureScreenshot(args: CaptureOptions) {
    const browser = await this.getBrowser();
    const page = await browser.newPage();

    try {
      // Set viewport if provided
      if (args.viewport) {
        await page.setViewportSize({
          width: args.viewport.width,
          height: args.viewport.height,
        });
      }

      // Set theme
      if (args.theme === 'dark') {
        await page.emulateMedia({ colorScheme: 'dark' });
      }

      // Navigate to URL
      await page.goto(args.url, { waitUntil: 'networkidle' });

      // Ensure directories exist
      await fs.mkdir(this.currentDir, { recursive: true });

      // Take screenshot
      const screenshotPath = path.join(this.currentDir, `${args.name}.png`);

      if (args.selector) {
        await page.locator(args.selector).screenshot({ path: screenshotPath });
      } else {
        await page.screenshot({ path: screenshotPath, fullPage: true });
      }

      return {
        content: [
          {
            type: 'text',
            text: `✅ Screenshot captured: ${args.name}.png\nPath: ${screenshotPath}`,
          },
        ],
      };
    } finally {
      await page.close();
    }
  }

  private async handleCompareScreenshots(args: { name: string; threshold?: number }) {
    const threshold = args.threshold || this.threshold;

    const baselinePath = path.join(this.baselineDir, `${args.name}.png`);
    const currentPath = path.join(this.currentDir, `${args.name}.png`);
    const diffPath = path.join(this.diffDir, `${args.name}-diff.png`);

    // Check if files exist
    try {
      await fs.access(baselinePath);
    } catch {
      // Baseline doesn't exist, create it
      await fs.mkdir(this.baselineDir, { recursive: true });
      await fs.copyFile(currentPath, baselinePath);

      return {
        content: [
          {
            type: 'text',
            text: `✅ Baseline created for ${args.name}\nNo previous baseline found, using current as baseline.`,
          },
        ],
      };
    }

    // Load images
    const baselineImg = PNG.sync.read(await fs.readFile(baselinePath));
    const currentImg = PNG.sync.read(await fs.readFile(currentPath));

    // Ensure images are same size
    if (baselineImg.width !== currentImg.width || baselineImg.height !== currentImg.height) {
      throw new Error(
        `Image dimensions don't match: baseline ${baselineImg.width}x${baselineImg.height}, current ${currentImg.width}x${currentImg.height}`
      );
    }

    // Create diff image
    const diff = new PNG({ width: baselineImg.width, height: baselineImg.height });

    // Compare images
    const pixelDifference = pixelmatch(
      baselineImg.data,
      currentImg.data,
      diff.data,
      baselineImg.width,
      baselineImg.height,
      { threshold: 0.1 }
    );

    const totalPixels = baselineImg.width * baselineImg.height;
    const percentageDifference = (pixelDifference / totalPixels) * 100;

    // Save diff image if there are differences
    if (pixelDifference > 0) {
      await fs.mkdir(this.diffDir, { recursive: true });
      await fs.writeFile(diffPath, PNG.sync.write(diff));
    }

    const passed = percentageDifference <= threshold;

    const result: ComparisonResult = {
      pixelDifference,
      percentageDifference: Math.round(percentageDifference * 100) / 100,
      passed,
      threshold,
      diffImagePath: pixelDifference > 0 ? diffPath : undefined,
    };

    const status = passed ? '✅' : '❌';
    const message = passed
      ? `${status} Visual test passed for ${args.name}`
      : `${status} Visual regression detected in ${args.name}!`;

    return {
      content: [
        {
          type: 'text',
          text: `${message}\n\n${JSON.stringify(result, null, 2)}`,
        },
      ],
    };
  }

  private async handleCaptureResponsive(args: {
    url: string;
    name: string;
    viewports?: ViewportSize[];
  }) {
    const defaultViewports: ViewportSize[] = [
      { width: 375, height: 667, name: 'mobile' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 1920, height: 1080, name: 'desktop' },
    ];

    const viewports = args.viewports || defaultViewports;
    const results: string[] = [];

    for (const viewport of viewports) {
      const name = `${args.name}-${viewport.name || `${viewport.width}x${viewport.height}`}`;
      await this.handleCaptureScreenshot({
        url: args.url,
        name,
        viewport,
      });
      results.push(name);
    }

    return {
      content: [
        {
          type: 'text',
          text: `✅ Captured ${results.length} responsive screenshots:\n${results.map((r) => `  - ${r}.png`).join('\n')}`,
        },
      ],
    };
  }

  private async handleCaptureThemes(args: {
    url: string;
    name: string;
    themes?: ('light' | 'dark')[];
  }) {
    const themes = args.themes || ['light', 'dark'];
    const results: string[] = [];

    for (const theme of themes) {
      const name = `${args.name}-${theme}`;
      await this.handleCaptureScreenshot({
        url: args.url,
        name,
        theme,
      });
      results.push(name);
    }

    return {
      content: [
        {
          type: 'text',
          text: `✅ Captured ${results.length} theme screenshots:\n${results.map((r) => `  - ${r}.png`).join('\n')}`,
        },
      ],
    };
  }

  private async handleRunVisualTests(args: { pattern?: string }) {
    // Get all baseline screenshots
    const files = await fs.readdir(this.baselineDir);
    const screenshots = files.filter((f) => f.endsWith('.png'));

    const filteredScreenshots = args.pattern
      ? screenshots.filter((s) => s.includes(args.pattern!))
      : screenshots;

    const results: ScreenshotTestResult[] = [];
    let passed = 0;
    let failed = 0;

    for (const screenshot of filteredScreenshots) {
      const name = screenshot.replace('.png', '');

      try {
        const result = await this.handleCompareScreenshots({ name });
        const comparison = JSON.parse(
          result.content[0].text.split('\n\n')[1]
        ) as ComparisonResult;

        results.push({
          name,
          baseline: path.join(this.baselineDir, screenshot),
          current: path.join(this.currentDir, screenshot),
          comparison,
        });

        if (comparison.passed) {
          passed++;
        } else {
          failed++;
        }
      } catch (error) {
        failed++;
        results.push({
          name,
          baseline: path.join(this.baselineDir, screenshot),
          current: path.join(this.currentDir, screenshot),
          comparison: {
            pixelDifference: 0,
            percentageDifference: 0,
            passed: false,
            threshold: this.threshold,
          },
        });
      }
    }

    const summary = `
Visual Regression Test Results:
================================
Total: ${results.length}
✅ Passed: ${passed}
❌ Failed: ${failed}

${results
  .map((r) => {
    const status = r.comparison.passed ? '✅' : '❌';
    return `${status} ${r.name} - ${r.comparison.percentageDifference}% difference`;
  })
  .join('\n')}
`;

    return {
      content: [
        {
          type: 'text',
          text: summary,
        },
      ],
    };
  }

  private async handleUpdateBaseline(args: { name: string }) {
    const currentPath = path.join(this.currentDir, `${args.name}.png`);
    const baselinePath = path.join(this.baselineDir, `${args.name}.png`);

    await fs.mkdir(this.baselineDir, { recursive: true });
    await fs.copyFile(currentPath, baselinePath);

    return {
      content: [
        {
          type: 'text',
          text: `✅ Updated baseline for ${args.name}`,
        },
      ],
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Screenshot Testing MCP server running on stdio');
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

const server = new ScreenshotTestingServer();
server.run().catch(console.error);

// Cleanup on exit
process.on('SIGINT', async () => {
  await server.cleanup();
  process.exit(0);
});
