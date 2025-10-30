#!/usr/bin/env node

/**
 * Brain MCP Server
 *
 * Exposes ai-dev-standards brain and capability graph to Claude Code.
 * Provides intelligent skill/MCP recommendations, graph queries, and orchestration.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { execFileSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

// Get AI Dev Standards root from environment
const AI_DEV_STANDARDS_ROOT = process.env.AI_DEV_STANDARDS_ROOT ||
  path.resolve(process.cwd(), '../..');

const BRAIN_CLI_PATH = path.join(AI_DEV_STANDARDS_ROOT, 'scripts', 'brain');
const GRAPH_QUERY_TOOL = path.join(AI_DEV_STANDARDS_ROOT, 'scripts', 'graph-query-tool.py');
const CAPABILITY_GRAPH = path.join(AI_DEV_STANDARDS_ROOT, 'META', 'capability-graph.json');

// Helper to execute brain CLI commands (FIXED: use execFileSync to prevent shell injection)
function executeBrainCommand(command: string, args: string[] = []): string {
  try {
    const commandArgs = ['-c', 'npx', 'ts-node', 'brain.ts', command, ...args];
    return execFileSync('bash', ['-c', `cd "${BRAIN_CLI_PATH}" && npx ts-node brain.ts ${command} ${args.map(a => `'${a.replace(/'/g, "'\\''")}'`).join(' ')}`], {
      encoding: 'utf-8',
      maxBuffer: 10 * 1024 * 1024, // 10MB
      cwd: BRAIN_CLI_PATH
    });
  } catch (error: any) {
    throw new Error(`Brain CLI error: ${error.message}`);
  }
}

// Helper to execute graph query tool (FIXED: use execFileSync to prevent shell injection)
function executeGraphQuery(queryType: string, query?: string): string {
  try {
    const args = ['python3', GRAPH_QUERY_TOOL, queryType];
    if (query) {
      args.push(query);
    }
    // Safely construct command with proper escaping
    const escapedQuery = query ? `'${query.replace(/'/g, "'\\''")}'` : '';
    const cmd = `python3 "${GRAPH_QUERY_TOOL}" ${queryType} ${escapedQuery}`;
    return execFileSync('bash', ['-c', cmd], {
      encoding: 'utf-8',
      maxBuffer: 10 * 1024 * 1024,
      cwd: AI_DEV_STANDARDS_ROOT
    });
  } catch (error: any) {
    throw new Error(`Graph query error: ${error.message}`);
  }
}

// Helper to load capability graph
function loadCapabilityGraph(): any {
  try {
    const content = fs.readFileSync(CAPABILITY_GRAPH, 'utf-8');
    return JSON.parse(content);
  } catch (error: any) {
    throw new Error(`Failed to load capability graph: ${error.message}`);
  }
}

// Define MCP tools
const tools: Tool[] = [
  {
    name: 'brain_search',
    description: 'Search all skills, MCPs, tools, and components by keyword. Returns matching resources with descriptions.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query (e.g., "authentication", "rag", "testing")'
        }
      },
      required: ['query']
    }
  },
  {
    name: 'brain_select_skills',
    description: 'Get intelligent skill recommendations for a task. Analyzes task description and returns most relevant skills with reasoning.',
    inputSchema: {
      type: 'object',
      properties: {
        taskDescription: {
          type: 'string',
          description: 'Description of the task (e.g., "implement RAG system with authentication")'
        }
      },
      required: ['taskDescription']
    }
  },
  {
    name: 'brain_show_skill',
    description: 'Get detailed information about a specific skill including description, triggers, category, and file location.',
    inputSchema: {
      type: 'object',
      properties: {
        skillName: {
          type: 'string',
          description: 'Name of the skill (e.g., "rag-implementer", "security-engineer")'
        }
      },
      required: ['skillName']
    }
  },
  {
    name: 'brain_relationships',
    description: 'Show all relationships for a skill including required MCPs, tools, components, and integrations.',
    inputSchema: {
      type: 'object',
      properties: {
        skillName: {
          type: 'string',
          description: 'Name of the skill'
        }
      },
      required: ['skillName']
    }
  },
  {
    name: 'graph_query_by_domain',
    description: 'Query capability graph by domain. Returns all capabilities in a specific domain (e.g., ai, security, frontend).',
    inputSchema: {
      type: 'object',
      properties: {
        domain: {
          type: 'string',
          description: 'Domain name (e.g., "ai", "security", "frontend", "backend", "testing")'
        }
      },
      required: ['domain']
    }
  },
  {
    name: 'graph_query_by_effect',
    description: 'Query capability graph by effect. Find capabilities that produce a specific effect (e.g., implements_authentication).',
    inputSchema: {
      type: 'object',
      properties: {
        effect: {
          type: 'string',
          description: 'Effect name (e.g., "implements_authentication", "creates_vector_index", "adds_tests")'
        }
      },
      required: ['effect']
    }
  },
  {
    name: 'graph_get_dependencies',
    description: 'Get dependencies for a capability. Shows both direct and transitive dependencies.',
    inputSchema: {
      type: 'object',
      properties: {
        capabilityId: {
          type: 'string',
          description: 'Capability ID (e.g., "rag-implementer", "security-engineer")'
        }
      },
      required: ['capabilityId']
    }
  },
  {
    name: 'graph_find_path',
    description: 'Find the shortest path between two capabilities in the graph. Useful for understanding how capabilities relate.',
    inputSchema: {
      type: 'object',
      properties: {
        from: {
          type: 'string',
          description: 'Starting capability ID'
        },
        to: {
          type: 'string',
          description: 'Ending capability ID'
        }
      },
      required: ['from', 'to']
    }
  },
  {
    name: 'graph_composition_chains',
    description: 'Get composition chains from a capability. Shows what capabilities work well together in sequence.',
    inputSchema: {
      type: 'object',
      properties: {
        capabilityId: {
          type: 'string',
          description: 'Capability ID to start from'
        },
        maxDepth: {
          type: 'number',
          description: 'Maximum chain depth (default: 10)',
          default: 10
        }
      },
      required: ['capabilityId']
    }
  },
  {
    name: 'graph_stats',
    description: 'Get capability graph statistics including node count, edge count, domains, effects, and top domains.',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'graph_validate',
    description: 'Validate the capability graph for consistency issues like missing nodes, orphaned nodes, and asymmetric relationships.',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'brain_status',
    description: 'Get current repository status including skill count, MCP count, total resources, versions, and health.',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  }
];

// Create MCP server
const server = new Server(
  {
    name: 'brain-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Handle list tools request
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'brain_search': {
        const query = args?.query as string;
        const result = executeBrainCommand('search', [query]);
        return {
          content: [
            {
              type: 'text',
              text: result
            }
          ]
        };
      }

      case 'brain_select_skills': {
        const taskDescription = args?.taskDescription as string;
        const result = executeBrainCommand('select-skills', [taskDescription]);
        return {
          content: [
            {
              type: 'text',
              text: result
            }
          ]
        };
      }

      case 'brain_show_skill': {
        const skillName = args?.skillName as string;
        const result = executeBrainCommand('show skill', [skillName]);
        return {
          content: [
            {
              type: 'text',
              text: result
            }
          ]
        };
      }

      case 'brain_relationships': {
        const skillName = args?.skillName as string;
        const result = executeBrainCommand('relationships', [skillName]);
        return {
          content: [
            {
              type: 'text',
              text: result
            }
          ]
        };
      }

      case 'graph_query_by_domain': {
        const domain = args?.domain as string;
        const result = executeGraphQuery('domain', domain);
        return {
          content: [
            {
              type: 'text',
              text: result
            }
          ]
        };
      }

      case 'graph_query_by_effect': {
        const effect = args?.effect as string;
        const result = executeGraphQuery('effect', effect);
        return {
          content: [
            {
              type: 'text',
              text: result
            }
          ]
        };
      }

      case 'graph_get_dependencies': {
        const capabilityId = args?.capabilityId as string;
        const result = executeGraphQuery('deps', capabilityId);
        return {
          content: [
            {
              type: 'text',
              text: result
            }
          ]
        };
      }

      case 'graph_find_path': {
        const from = args?.from as string;
        const to = args?.to as string;
        const result = executeGraphQuery('path', `${from} ${to}`);
        return {
          content: [
            {
              type: 'text',
              text: result
            }
          ]
        };
      }

      case 'graph_composition_chains': {
        const capabilityId = args?.capabilityId as string;
        const maxDepth = args?.maxDepth as number | undefined;
        const query = maxDepth ? `${capabilityId} ${maxDepth}` : capabilityId;
        const result = executeGraphQuery('chains', query);
        return {
          content: [
            {
              type: 'text',
              text: result
            }
          ]
        };
      }

      case 'graph_stats': {
        const result = executeGraphQuery('stats');
        return {
          content: [
            {
              type: 'text',
              text: result
            }
          ]
        };
      }

      case 'graph_validate': {
        const result = executeGraphQuery('validate');
        return {
          content: [
            {
              type: 'text',
              text: result
            }
          ]
        };
      }

      case 'brain_status': {
        const result = executeBrainCommand('status');
        return {
          content: [
            {
              type: 'text',
              text: result
            }
          ]
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error: any) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error.message}`
        }
      ],
      isError: true
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Brain MCP server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
