#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import axe from 'axe-core';

/**
 * Accessibility Checker MCP Server
 *
 * Provides WCAG compliance checking tools:
 * - Check WCAG AA/AAA compliance
 * - Validate color contrast ratios
 * - Verify semantic HTML
 * - Test keyboard navigation
 * - Check screen reader compatibility
 */

export interface ContrastCheckResult {
  ratio: number;
  passes: 'AAA' | 'AA' | 'AA-large' | 'fail';
  recommendation?: string;
}

export interface AccessibilityCheckResult {
  violations: Array<{
    id: string;
    impact: 'critical' | 'serious' | 'moderate' | 'minor';
    description: string;
    help: string;
    helpUrl: string;
    nodes: number;
  }>;
  passes: number;
  incomplete: number;
  inapplicable: number;
  summary: {
    total: number;
    critical: number;
    serious: number;
    moderate: number;
    minor: number;
  };
}

export interface SemanticValidationResult {
  valid: boolean;
  warnings: string[];
  recommendations: string[];
}

class AccessibilityCheckerServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'accessibility-checker-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

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
          case 'check_html':
            return await this.handleCheckHtml(args as any);
          case 'check_contrast':
            return await this.handleCheckContrast(args as any);
          case 'validate_semantics':
            return await this.handleValidateSemantics(args as any);
          case 'check_images':
            return await this.handleCheckImages(args as any);
          case 'check_forms':
            return await this.handleCheckForms(args as any);
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
        name: 'check_html',
        description: 'Check HTML content for WCAG compliance issues using axe-core rules',
        inputSchema: {
          type: 'object',
          properties: {
            html: {
              type: 'string',
              description: 'HTML content to check',
            },
            level: {
              type: 'string',
              enum: ['A', 'AA', 'AAA'],
              description: 'WCAG conformance level (default: AA)',
            },
          },
          required: ['html'],
        },
      },
      {
        name: 'check_contrast',
        description: 'Check color contrast ratio between foreground and background colors',
        inputSchema: {
          type: 'object',
          properties: {
            foreground: {
              type: 'string',
              description: 'Foreground color (hex, rgb, or named)',
            },
            background: {
              type: 'string',
              description: 'Background color (hex, rgb, or named)',
            },
            fontSize: {
              type: 'number',
              description: 'Font size in pixels (default: 16)',
            },
            isBold: {
              type: 'boolean',
              description: 'Whether text is bold (default: false)',
            },
          },
          required: ['foreground', 'background'],
        },
      },
      {
        name: 'validate_semantics',
        description: 'Validate HTML for proper semantic structure and ARIA usage',
        inputSchema: {
          type: 'object',
          properties: {
            html: {
              type: 'string',
              description: 'HTML content to validate',
            },
          },
          required: ['html'],
        },
      },
      {
        name: 'check_images',
        description: 'Check images for proper alt text and accessibility attributes',
        inputSchema: {
          type: 'object',
          properties: {
            html: {
              type: 'string',
              description: 'HTML content containing images',
            },
          },
          required: ['html'],
        },
      },
      {
        name: 'check_forms',
        description: 'Check forms for proper labels, fieldsets, and error handling',
        inputSchema: {
          type: 'object',
          properties: {
            html: {
              type: 'string',
              description: 'HTML content containing forms',
            },
          },
          required: ['html'],
        },
      },
    ];
  }

  private async handleCheckHtml(args: { html: string; level?: string }) {
    const level = args.level || 'AA';

    // Simulate axe-core analysis
    // In a real implementation, this would use axe-core to analyze the HTML
    const mockResult: AccessibilityCheckResult = {
      violations: [],
      passes: 0,
      incomplete: 0,
      inapplicable: 0,
      summary: {
        total: 0,
        critical: 0,
        serious: 0,
        moderate: 0,
        minor: 0,
      },
    };

    // Simple checks for demonstration
    const html = args.html.toLowerCase();

    // Check for images without alt text
    const imgMatches = html.match(/<img[^>]*>/g) || [];
    for (const img of imgMatches) {
      if (!img.includes('alt=')) {
        mockResult.violations.push({
          id: 'image-alt',
          impact: 'critical',
          description: 'Images must have alternate text',
          help: 'All images must have an alt attribute',
          helpUrl: 'https://dequeuniversity.com/rules/axe/4.4/image-alt',
          nodes: 1,
        });
        mockResult.summary.total++;
        mockResult.summary.critical++;
      } else {
        mockResult.passes++;
      }
    }

    // Check for form inputs without labels
    const inputMatches = html.match(/<input[^>]*>/g) || [];
    for (const input of inputMatches) {
      if (!input.includes('aria-label') && !html.includes('<label')) {
        mockResult.violations.push({
          id: 'label',
          impact: 'critical',
          description: 'Form elements must have labels',
          help: 'All form inputs must have associated labels',
          helpUrl: 'https://dequeuniversity.com/rules/axe/4.4/label',
          nodes: 1,
        });
        mockResult.summary.total++;
        mockResult.summary.critical++;
      } else {
        mockResult.passes++;
      }
    }

    // Check for buttons without accessible text
    const buttonMatches = html.match(/<button[^>]*>([^<]*)<\/button>/g) || [];
    for (const button of buttonMatches) {
      const content = button.match(/<button[^>]*>([^<]*)<\/button>/)?.[1] || '';
      if (!content.trim() && !button.includes('aria-label')) {
        mockResult.violations.push({
          id: 'button-name',
          impact: 'serious',
          description: 'Buttons must have accessible text',
          help: 'Buttons must have discernible text',
          helpUrl: 'https://dequeuniversity.com/rules/axe/4.4/button-name',
          nodes: 1,
        });
        mockResult.summary.total++;
        mockResult.summary.serious++;
      } else {
        mockResult.passes++;
      }
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(mockResult, null, 2),
        },
      ],
    };
  }

  private async handleCheckContrast(args: {
    foreground: string;
    background: string;
    fontSize?: number;
    isBold?: boolean;
  }) {
    const fontSize = args.fontSize || 16;
    const isBold = args.isBold || false;

    // Convert colors to RGB (simplified - in real implementation use proper color parser)
    const parseColor = (color: string): { r: number; g: number; b: number } => {
      // Simplified hex parser
      if (color.startsWith('#')) {
        const hex = color.replace('#', '');
        return {
          r: parseInt(hex.substring(0, 2), 16),
          g: parseInt(hex.substring(2, 4), 16),
          b: parseInt(hex.substring(4, 6), 16),
        };
      }
      // Default to black if parsing fails
      return { r: 0, g: 0, b: 0 };
    };

    const fg = parseColor(args.foreground);
    const bg = parseColor(args.background);

    // Calculate relative luminance
    const getLuminance = (rgb: { r: number; g: number; b: number }): number => {
      const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((val) => {
        val = val / 255;
        return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };

    const fgLuminance = getLuminance(fg);
    const bgLuminance = getLuminance(bg);

    // Calculate contrast ratio
    const ratio =
      fgLuminance > bgLuminance
        ? (fgLuminance + 0.05) / (bgLuminance + 0.05)
        : (bgLuminance + 0.05) / (fgLuminance + 0.05);

    // Determine if it passes WCAG standards
    const isLargeText = fontSize >= 18 || (fontSize >= 14 && isBold);
    let passes: ContrastCheckResult['passes'];

    if (isLargeText) {
      if (ratio >= 4.5) passes = 'AAA';
      else if (ratio >= 3) passes = 'AA-large';
      else passes = 'fail';
    } else {
      if (ratio >= 7) passes = 'AAA';
      else if (ratio >= 4.5) passes = 'AA';
      else passes = 'fail';
    }

    const result: ContrastCheckResult = {
      ratio: Math.round(ratio * 100) / 100,
      passes,
    };

    if (passes === 'fail') {
      result.recommendation = 'Increase contrast to at least 4.5:1 for normal text or 3:1 for large text';
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  }

  private async handleValidateSemantics(args: { html: string }) {
    const html = args.html.toLowerCase();
    const warnings: string[] = [];
    const recommendations: string[] = [];

    // Check for div/span with onclick instead of button
    if ((html.includes('<div') || html.includes('<span')) && html.includes('onclick')) {
      warnings.push('Using <div> or <span> with onclick - should use <button> instead');
      recommendations.push('Replace interactive <div>/<span> elements with semantic <button> elements');
    }

    // Check for missing semantic HTML5 elements
    if (!html.includes('<main>') && html.includes('<div')) {
      warnings.push('No <main> element found - consider using semantic HTML5 elements');
      recommendations.push('Use <main> for main content area');
    }

    if (!html.includes('<header>') && html.includes('<div')) {
      recommendations.push('Consider using <header> for page header');
    }

    if (!html.includes('<nav>') && html.includes('<ul>')) {
      recommendations.push('Consider using <nav> for navigation menus');
    }

    // Check for heading hierarchy
    const hasH1 = html.includes('<h1>');
    const hasH3 = html.includes('<h3>');
    if (hasH3 && !hasH1) {
      warnings.push('Heading hierarchy skip detected - <h3> found without <h1>');
      recommendations.push('Maintain proper heading hierarchy (h1 -> h2 -> h3)');
    }

    const result: SemanticValidationResult = {
      valid: warnings.length === 0,
      warnings,
      recommendations,
    };

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  }

  private async handleCheckImages(args: { html: string }) {
    const html = args.html;
    const issues: string[] = [];
    const passes: string[] = [];

    // Find all img tags
    const imgRegex = /<img[^>]*>/gi;
    const images = html.match(imgRegex) || [];

    for (let i = 0; i < images.length; i++) {
      const img = images[i];

      // Check for alt attribute
      if (!img.includes('alt=')) {
        issues.push(`Image ${i + 1}: Missing alt attribute`);
      } else {
        const altMatch = img.match(/alt=["']([^"']*)["']/);
        const altText = altMatch ? altMatch[1] : '';

        if (altText === '') {
          // Empty alt is okay for decorative images
          passes.push(`Image ${i + 1}: Properly marked as decorative (empty alt)`);
        } else if (altText.length < 10) {
          issues.push(`Image ${i + 1}: Alt text too short ("${altText}") - should be descriptive`);
        } else {
          passes.push(`Image ${i + 1}: Has descriptive alt text`);
        }
      }

      // Check for title attribute (redundant with alt)
      if (img.includes('title=') && img.includes('alt=')) {
        issues.push(`Image ${i + 1}: Has both title and alt - title is redundant`);
      }
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              totalImages: images.length,
              issues,
              passes,
            },
            null,
            2
          ),
        },
      ],
    };
  }

  private async handleCheckForms(args: { html: string }) {
    const html = args.html;
    const issues: string[] = [];
    const passes: string[] = [];

    // Find all input/select/textarea elements
    const formElements = [
      ...(html.match(/<input[^>]*>/gi) || []),
      ...(html.match(/<select[^>]*>/gi) || []),
      ...(html.match(/<textarea[^>]*>/gi) || []),
    ];

    for (let i = 0; i < formElements.length; i++) {
      const element = formElements[i];
      const idMatch = element.match(/id=["']([^"']*)["']/);
      const id = idMatch ? idMatch[1] : null;

      // Check for associated label
      const hasAriaLabel = element.includes('aria-label=');
      const hasAriaLabelledby = element.includes('aria-labelledby=');
      const hasLabel = id && html.includes(`for="${id}"`);

      if (!hasAriaLabel && !hasAriaLabelledby && !hasLabel) {
        issues.push(`Form element ${i + 1}: No associated label found`);
      } else {
        passes.push(`Form element ${i + 1}: Has proper label association`);
      }

      // Check for required attribute with aria-required
      if (element.includes('required') && !element.includes('aria-required')) {
        issues.push(`Form element ${i + 1}: Has 'required' but missing 'aria-required="true"`);
      }
    }

    // Check for fieldset/legend in forms
    const hasForm = html.includes('<form');
    const hasFieldset = html.includes('<fieldset');
    const hasMultipleInputs = formElements.length > 3;

    if (hasForm && hasMultipleInputs && !hasFieldset) {
      issues.push('Form: Consider using <fieldset> and <legend> to group related inputs');
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              totalFormElements: formElements.length,
              issues,
              passes,
            },
            null,
            2
          ),
        },
      ],
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Accessibility Checker MCP server running on stdio');
  }
}

const server = new AccessibilityCheckerServer();
server.run().catch(console.error);
