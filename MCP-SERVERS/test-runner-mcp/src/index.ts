#!/usr/bin/env node

/**
 * Test Runner MCP Server
 *
 * Provides tools for running tests, parsing results, and generating coverage reports
 * across multiple testing frameworks (Vitest, Jest, Mocha, Playwright).
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { execa } from 'execa';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

// Server configuration
interface TestRunnerConfig {
  framework: 'vitest' | 'jest' | 'mocha' | 'playwright';
  projectPath: string;
  testPattern: string;
}

let config: TestRunnerConfig | null = null;

// Create server instance
const server = new Server(
  {
    name: 'test-runner-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Tool definitions
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'configure',
        description: 'Configure test runner settings (framework, project path, test pattern)',
        inputSchema: {
          type: 'object',
          properties: {
            framework: {
              type: 'string',
              enum: ['vitest', 'jest', 'mocha', 'playwright'],
              description: 'Test framework to use'
            },
            projectPath: {
              type: 'string',
              description: 'Path to project root'
            },
            testPattern: {
              type: 'string',
              description: 'Test file pattern (default: **/*.{test,spec}.{js,ts,tsx})'
            }
          },
          required: ['framework', 'projectPath']
        }
      },
      {
        name: 'run_tests',
        description: 'Run tests and return results with pass/fail status and coverage',
        inputSchema: {
          type: 'object',
          properties: {
            pattern: {
              type: 'string',
              description: 'Specific test files or pattern to run'
            },
            watch: {
              type: 'boolean',
              description: 'Run in watch mode'
            },
            coverage: {
              type: 'boolean',
              description: 'Generate coverage report'
            },
            bail: {
              type: 'boolean',
              description: 'Stop on first failure'
            }
          }
        }
      },
      {
        name: 'discover_tests',
        description: 'Find and list all test files',
        inputSchema: {
          type: 'object',
          properties: {
            pattern: {
              type: 'string',
              description: 'Test file pattern to match'
            }
          }
        }
      },
      {
        name: 'run_single_test',
        description: 'Run a specific test file or test case',
        inputSchema: {
          type: 'object',
          properties: {
            filePath: {
              type: 'string',
              description: 'Path to test file'
            },
            testName: {
              type: 'string',
              description: 'Specific test name within file'
            }
          },
          required: ['filePath']
        }
      },
      {
        name: 'generate_coverage',
        description: 'Generate coverage report in specified format',
        inputSchema: {
          type: 'object',
          properties: {
            format: {
              type: 'string',
              enum: ['json', 'html', 'lcov', 'text'],
              description: 'Coverage report format'
            },
            outputPath: {
              type: 'string',
              description: 'Output path for report'
            }
          }
        }
      }
    ]
  };
});

// Tool implementations
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'configure':
        return await handleConfigure(args);
      case 'run_tests':
        return await handleRunTests(args);
      case 'discover_tests':
        return await handleDiscoverTests(args);
      case 'run_single_test':
        return await handleRunSingleTest(args);
      case 'generate_coverage':
        return await handleGenerateCoverage(args);
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error instanceof Error ? error.message : String(error)}`
        }
      ],
      isError: true
    };
  }
});

// Handler implementations
async function handleConfigure(args: any) {
  config = {
    framework: args.framework,
    projectPath: args.projectPath,
    testPattern: args.testPattern || '**/*.{test,spec}.{js,ts,tsx}'
  };

  return {
    content: [
      {
        type: 'text',
        text: `Configured test runner:\n- Framework: ${config.framework}\n- Project: ${config.projectPath}\n- Pattern: ${config.testPattern}`
      }
    ]
  };
}

async function handleRunTests(args: any) {
  if (!config) {
    throw new Error('Test runner not configured. Call configure first.');
  }

  // Build command based on framework
  const command = buildTestCommand(config, args);

  // Execute tests
  const result = await execa(command.cmd, command.args, {
    cwd: config.projectPath,
    reject: false
  });

  // Parse results
  const parsed = parseTestOutput(config.framework, result);

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(parsed, null, 2)
      }
    ]
  };
}

async function handleDiscoverTests(args: any) {
  if (!config) {
    throw new Error('Test runner not configured. Call configure first.');
  }

  // Implementation for test discovery
  return {
    content: [
      {
        type: 'text',
        text: 'Test discovery not yet implemented'
      }
    ]
  };
}

async function handleRunSingleTest(args: any) {
  if (!config) {
    throw new Error('Test runner not configured. Call configure first.');
  }

  // Implementation for single test execution
  return {
    content: [
      {
        type: 'text',
        text: 'Single test execution not yet implemented'
      }
    ]
  };
}

async function handleGenerateCoverage(args: any) {
  if (!config) {
    throw new Error('Test runner not configured. Call configure first.');
  }

  // Implementation for coverage generation
  return {
    content: [
      {
        type: 'text',
        text: 'Coverage generation not yet implemented'
      }
    ]
  };
}

// Helper functions
function buildTestCommand(config: TestRunnerConfig, options: any) {
  const args: string[] = [];

  switch (config.framework) {
    case 'vitest':
      if (options.coverage) args.push('--coverage');
      if (options.watch) args.push('--watch');
      if (options.bail) args.push('--bail');
      if (options.pattern) args.push(options.pattern);
      return { cmd: 'vitest', args };

    case 'jest':
      if (options.coverage) args.push('--coverage');
      if (options.watch) args.push('--watch');
      if (options.bail) args.push('--bail');
      if (options.pattern) args.push(options.pattern);
      return { cmd: 'jest', args };

    case 'mocha':
      if (options.bail) args.push('--bail');
      if (options.pattern) args.push(options.pattern);
      return { cmd: 'mocha', args };

    case 'playwright':
      if (options.pattern) args.push(options.pattern);
      return { cmd: 'playwright', args: ['test', ...args] };

    default:
      throw new Error(`Unsupported framework: ${config.framework}`);
  }
}

function parseTestOutput(framework: string, result: any) {
  // Basic parsing - implement proper parsing based on framework output
  return {
    framework,
    passed: 0,
    failed: 0,
    skipped: 0,
    duration: 0,
    output: result.stdout + result.stderr
  };
}

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Test Runner MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
