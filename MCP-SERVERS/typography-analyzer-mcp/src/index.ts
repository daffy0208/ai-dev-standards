#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js'
import * as fs from 'fs'
import * as path from 'path'

const server = new Server(
  { name: 'typography-analyzer-mcp', version: '1.0.0' },
  { capabilities: { tools: {}, resources: {} } }
)

const typographyBestPractices = {
  typeScales: {
    modularScale: {
      name: 'Modular Scale',
      ratios: {
        minorSecond: 1.067,
        majorSecond: 1.125,
        minorThird: 1.2,
        majorThird: 1.25,
        perfectFourth: 1.333,
        augmentedFourth: 1.414,
        perfectFifth: 1.5,
        goldenRatio: 1.618,
      },
    },
    tailwindScale: ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl', '7xl', '8xl', '9xl'],
  },
  readability: {
    lineHeight: {
      body: { min: 1.5, ideal: 1.6, max: 1.8 },
      headings: { min: 1.2, ideal: 1.3, max: 1.5 },
    },
    lineLength: {
      min: 45,
      ideal: 66,
      max: 75,
    },
    paragraphSpacing: {
      min: '1em',
      ideal: '1.5em',
    },
  },
  fontStacks: {
    system: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    transitional: 'Charter, "Bitstream Charter", "Sitka Text", Cambria, serif',
    oldStyle: '"Iowan Old Style", "Palatino Linotype", "URW Palladio L", P052, serif',
    humanist: 'Seravek, "Gill Sans Nova", Ubuntu, Calibri, sans-serif',
    geometric: 'Avenir, Montserrat, Corbel, sans-serif',
    monospace: '"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", monospace',
  },
}

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'analyze_typography',
      description: 'Analyze typography usage in CSS files',
      inputSchema: {
        type: 'object',
        properties: {
          cssFiles: {
            type: 'array',
            items: { type: 'string' },
            description: 'Array of CSS file paths to analyze',
          },
        },
        required: ['cssFiles'],
      },
    },
    {
      name: 'detect_font_usage',
      description: 'Detect all font families used in a project',
      inputSchema: {
        type: 'object',
        properties: {
          projectPath: {
            type: 'string',
            description: 'Root path of the project',
          },
        },
        required: ['projectPath'],
      },
    },
    {
      name: 'suggest_type_scale',
      description: 'Suggest harmonious type scale from current sizes',
      inputSchema: {
        type: 'object',
        properties: {
          currentSizes: {
            type: 'array',
            items: { type: 'number' },
            description: 'Array of font sizes currently used (in px)',
          },
          ratio: {
            type: 'string',
            description: 'Type scale ratio (e.g., "majorThird", "perfectFourth")',
          },
        },
        required: ['currentSizes'],
      },
    },
    {
      name: 'check_readability',
      description: 'Check text readability metrics',
      inputSchema: {
        type: 'object',
        properties: {
          fontSize: {
            type: 'number',
            description: 'Font size in pixels',
          },
          lineHeight: {
            type: 'number',
            description: 'Line height value',
          },
          lineLength: {
            type: 'number',
            description: 'Line length in characters',
          },
        },
        required: ['fontSize'],
      },
    },
  ],
}))

server.setRequestHandler(ListResourcesRequestSchema, async () => ({
  resources: [
    {
      uri: 'typography://best-practices',
      name: 'Typography Best Practices',
      description: 'Typography guidelines and best practices',
      mimeType: 'application/json',
    },
  ],
}))

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  if (request.params.uri === 'typography://best-practices') {
    return {
      contents: [
        {
          uri: request.params.uri,
          mimeType: 'application/json',
          text: JSON.stringify(typographyBestPractices, null, 2),
        },
      ],
    }
  }
  throw new Error(`Unknown resource: ${request.params.uri}`)
})

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params

  try {
    switch (name) {
      case 'analyze_typography':
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(analyzeTypography((args as any).cssFiles), null, 2),
            },
          ],
        }

      case 'detect_font_usage':
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(detectFontUsage((args as any).projectPath), null, 2),
            },
          ],
        }

      case 'suggest_type_scale':
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                suggestTypeScale((args as any).currentSizes, (args as any).ratio),
                null,
                2
              ),
            },
          ],
        }

      case 'check_readability':
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(checkReadability(args as any), null, 2),
            },
          ],
        }

      default:
        throw new Error(`Unknown tool: ${name}`)
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    }
  }
})

function analyzeTypography(cssFiles: string[]) {
  const analysis: any = {
    fontFamilies: new Set(),
    fontSizes: new Set(),
    lineHeights: new Set(),
    fontWeights: new Set(),
    issues: [],
  }

  for (const file of cssFiles) {
    if (!fs.existsSync(file)) continue

    const content = fs.readFileSync(file, 'utf-8')

    // Extract font families
    const familyMatches = content.matchAll(/font-family:\s*([^;]+);/g)
    for (const match of familyMatches) {
      analysis.fontFamilies.add(match[1].trim())
    }

    // Extract font sizes
    const sizeMatches = content.matchAll(/font-size:\s*(\d+(?:\.\d+)?)(px|rem|em)/g)
    for (const match of sizeMatches) {
      analysis.fontSizes.add(`${match[1]}${match[2]}`)
    }

    // Extract line heights
    const lineHeightMatches = content.matchAll(/line-height:\s*([^;]+);/g)
    for (const match of lineHeightMatches) {
      analysis.lineHeights.add(match[1].trim())
    }

    // Extract font weights
    const weightMatches = content.matchAll(/font-weight:\s*(\d+|normal|bold)/g)
    for (const match of weightMatches) {
      analysis.fontWeights.add(match[1])
    }
  }

  // Check for issues
  if (analysis.fontFamilies.size > 3) {
    analysis.issues.push(`Too many font families (${analysis.fontFamilies.size}). Recommend 1-3.`)
  }

  if (analysis.fontSizes.size > 8) {
    analysis.issues.push(`Too many font sizes (${analysis.fontSizes.size}). Recommend using a type scale.`)
  }

  return {
    success: true,
    fontFamilies: Array.from(analysis.fontFamilies),
    fontSizes: Array.from(analysis.fontSizes),
    lineHeights: Array.from(analysis.lineHeights),
    fontWeights: Array.from(analysis.fontWeights),
    issues: analysis.issues,
    recommendations: generateRecommendations(analysis),
  }
}

function detectFontUsage(projectPath: string) {
  const fonts = new Set<string>()
  const files: string[] = []

  function scanDirectory(dir: string) {
    if (!fs.existsSync(dir)) return

    const items = fs.readdirSync(dir)
    for (const item of items) {
      const fullPath = path.join(dir, item)
      const stat = fs.statSync(fullPath)

      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        scanDirectory(fullPath)
      } else if (item.endsWith('.css') || item.endsWith('.scss') || item.endsWith('.tsx') || item.endsWith('.jsx')) {
        const content = fs.readFileSync(fullPath, 'utf-8')
        const matches = content.matchAll(/font-family:\s*([^;]+);/g)
        for (const match of matches) {
          fonts.add(match[1].trim())
          files.push(fullPath)
        }
      }
    }
  }

  scanDirectory(projectPath)

  return {
    success: true,
    fonts: Array.from(fonts),
    filesScanned: files.length,
    totalFonts: fonts.size,
  }
}

function suggestTypeScale(currentSizes: number[], ratio?: string) {
  const baseSize = 16
  const selectedRatio = ratio
    ? typographyBestPractices.typeScales.modularScale.ratios[ratio as keyof typeof typographyBestPractices.typeScales.modularScale.ratios]
    : 1.25

  const scale = []
  for (let i = -2; i <= 6; i++) {
    const size = Math.round(baseSize * Math.pow(selectedRatio, i))
    scale.push(size)
  }

  return {
    success: true,
    ratio: ratio || 'majorThird',
    ratioValue: selectedRatio,
    suggestedScale: scale,
    currentSizes,
    recommendations: `Use ${scale.join(', ')} for consistent type hierarchy`,
  }
}

function checkReadability(params: { fontSize: number; lineHeight?: number; lineLength?: number }) {
  const { fontSize, lineHeight, lineLength } = params
  const issues = []
  const recommendations = []

  // Check line height
  if (lineHeight) {
    const { body, headings } = typographyBestPractices.readability.lineHeight
    if (lineHeight < body.min) {
      issues.push(`Line height ${lineHeight} is too tight. Minimum: ${body.min}`)
      recommendations.push(`Increase line-height to at least ${body.ideal}`)
    }
  }

  // Check line length
  if (lineLength) {
    const { min, ideal, max } = typographyBestPractices.readability.lineLength
    if (lineLength < min) {
      issues.push(`Line length ${lineLength} characters is too short`)
    } else if (lineLength > max) {
      issues.push(`Line length ${lineLength} characters is too long`)
      recommendations.push(`Reduce line length to ${ideal} characters for optimal readability`)
    }
  }

  // Check font size
  if (fontSize < 14) {
    issues.push(`Font size ${fontSize}px is too small for body text`)
    recommendations.push('Use minimum 16px for body text')
  }

  return {
    success: true,
    fontSize,
    lineHeight,
    lineLength,
    readable: issues.length === 0,
    issues,
    recommendations,
  }
}

function generateRecommendations(analysis: any): string[] {
  const recs = []

  if (analysis.fontFamilies.size === 0) {
    recs.push('Define font families using system font stacks for better performance')
  }

  if (analysis.fontSizes.size > 8) {
    recs.push('Consolidate font sizes into a type scale (8 sizes recommended)')
  }

  recs.push('Use relative units (rem/em) instead of px for better accessibility')
  recs.push('Maintain line-height between 1.5-1.8 for body text')

  return recs
}

async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
  console.error('typography-analyzer-mcp running on stdio')
}

main().catch((error) => {
  console.error('Server error:', error)
  process.exit(1)
})
