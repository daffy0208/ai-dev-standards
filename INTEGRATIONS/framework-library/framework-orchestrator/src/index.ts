#!/usr/bin/env node

/**
 * Framework Orchestrator MCP Server
 *
 * Analyzes projects, recommends frameworks, and generates project structures
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool
} from '@modelcontextprotocol/sdk/types.js'
import { ProjectAnalyzer } from './tools/project-analyzer.js'
import { FrameworkSelector } from './tools/framework-selector.js'
import { ProjectGenerator } from './tools/project-generator.js'
import { DecisionMatrix } from './utils/decision-matrix.js'

const projectAnalyzer = new ProjectAnalyzer()
const frameworkSelector = new FrameworkSelector()
const projectGenerator = new ProjectGenerator()
const decisionMatrix = new DecisionMatrix()

const server = new Server(
  {
    name: 'framework-orchestrator',
    version: '1.0.0'
  },
  {
    capabilities: {
      tools: {}
    }
  }
)

server.setRequestHandler(ListToolsRequestSchema, async () => {
  const tools: Tool[] = [
    {
      name: 'analyze_project',
      description: 'Analyze project requirements and determine optimal pattern (A, B, or C)',
      inputSchema: {
        type: 'object',
        properties: {
          project_type: {
            type: 'string',
            enum: ['web-app', 'saas', 'ai-native', 'mobile', 'browser-extension', 'api'],
            description: 'Type of project to build'
          },
          complexity: {
            type: 'string',
            enum: ['simple', 'medium', 'complex'],
            description: 'Project complexity level'
          },
          requirements: {
            type: 'object',
            properties: {
              has_ai_features: { type: 'boolean' },
              needs_multi_agent: { type: 'boolean' },
              requires_knowledge_graph: { type: 'boolean' },
              security_critical: { type: 'boolean' },
              real_time: { type: 'boolean' },
              handles_pii: { type: 'boolean' }
            }
          },
          timeline: { type: 'string' },
          team_size: { type: 'number' }
        },
        required: ['project_type', 'complexity']
      }
    },
    {
      name: 'select_frameworks',
      description: 'Recommend optimal framework sequence based on project pattern',
      inputSchema: {
        type: 'object',
        properties: {
          pattern: {
            type: 'string',
            enum: ['A', 'B', 'C'],
            description: 'Implementation pattern'
          },
          requirements: {
            type: 'object',
            description: 'Specific project requirements'
          }
        },
        required: ['pattern']
      }
    },
    {
      name: 'generate_manifest',
      description: 'Generate .framework-manifest.json for project',
      inputSchema: {
        type: 'object',
        properties: {
          project_name: { type: 'string' },
          pattern: { type: 'string', enum: ['A', 'B', 'C'] },
          frameworks: { type: 'array', items: { type: 'string' } },
          tech_stack: { type: 'object' }
        },
        required: ['project_name', 'pattern', 'frameworks']
      }
    },
    {
      name: 'generate_project_structure',
      description: 'Generate complete project directory structure and files',
      inputSchema: {
        type: 'object',
        properties: {
          project_name: { type: 'string' },
          pattern: { type: 'string', enum: ['A', 'B', 'C'] },
          output_path: { type: 'string' }
        },
        required: ['project_name', 'pattern']
      }
    },
    {
      name: 'get_decision_matrix',
      description: 'Generate technology stack decision matrix with scoring',
      inputSchema: {
        type: 'object',
        properties: {
          project_requirements: { type: 'object' },
          constraints: {
            type: 'object',
            properties: {
              budget: { type: 'string' },
              team_size: { type: 'number' },
              timeline: { type: 'string' },
              team_expertise: { type: 'array', items: { type: 'string' } }
            }
          }
        },
        required: ['project_requirements']
      }
    }
  ]

  return { tools }
})

server.setRequestHandler(CallToolRequestSchema, async request => {
  const { name, arguments: args } = request.params

  try {
    if (!args) {
      throw new Error('No arguments provided')
    }

    switch (name) {
      case 'analyze_project': {
        const analysis = await projectAnalyzer.analyze({
          projectType: args.project_type as string,
          complexity: args.complexity as string,
          requirements: args.requirements as any,
          timeline: args.timeline as string,
          teamSize: args.team_size as number
        })

        return {
          content: [{ type: 'text', text: JSON.stringify(analysis, null, 2) }]
        }
      }

      case 'select_frameworks': {
        const selection = await frameworkSelector.select(
          args.pattern as string,
          args.requirements as any
        )

        return {
          content: [{ type: 'text', text: JSON.stringify(selection, null, 2) }]
        }
      }

      case 'generate_manifest': {
        const manifest = await projectGenerator.generateManifest({
          projectName: args.project_name as string,
          pattern: args.pattern as string,
          frameworks: args.frameworks as string[],
          techStack: args.tech_stack as any
        })

        return {
          content: [{ type: 'text', text: JSON.stringify(manifest, null, 2) }]
        }
      }

      case 'generate_project_structure': {
        const structure = await projectGenerator.generateStructure({
          projectName: args.project_name as string,
          pattern: args.pattern as string,
          outputPath: args.output_path as string
        })

        return {
          content: [{ type: 'text', text: JSON.stringify(structure, null, 2) }]
        }
      }

      case 'get_decision_matrix': {
        const matrix = await decisionMatrix.generate(
          args.project_requirements as any,
          args.constraints as any
        )

        return {
          content: [{ type: 'text', text: JSON.stringify(matrix, null, 2) }]
        }
      }

      default:
        throw new Error(`Unknown tool: ${name}`)
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    throw new Error(`Tool execution failed: ${errorMessage}`)
  }
})

async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
  console.error('Framework Orchestrator MCP Server running on stdio')
}

main().catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})
