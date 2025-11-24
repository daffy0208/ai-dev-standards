/**
 * Font Optimizer MCP Server
 *
 * MCP server for font optimization operations including subsetting, format conversion, and usage analysis.
 *
 * Tools:
 * - subsetFont: Create font subsets with specific character ranges
 * - convertFontFormat: Convert font between formats (ttf, woff, woff2)
 * - analyzeFontUsage: Analyze font usage in HTML/CSS files
 *
 * Usage:
 * ```bash
 * node index.ts
 * ```
 */

import {
  BaseMCPServer,
  validateArgs,
  createErrorResponse
} from '../../COMPONENTS/mcp-servers/base-mcp-server'
import * as fs from 'fs/promises'
import * as path from 'path'

interface SubsetFontArgs {
  fontFile: string
  characters: string
  outputFile?: string
}

interface ConvertFontFormatArgs {
  inputFile: string
  outputFormat: 'ttf' | 'woff' | 'woff2'
  outputFile?: string
}

interface AnalyzeFontUsageArgs {
  files: string[]
  includeStats?: boolean
}

class FontOptimizerMCPServer extends BaseMCPServer {
  constructor() {
    super('font-optimizer-mcp', '1.0.0')
    this.registerTools()
  }

  protected registerTools(): void {
    // Subset font tool
    this.addTool({
      name: 'subsetFont',
      description:
        'Create a font subset containing only specified characters. Reduces font file size.',
      inputSchema: {
        type: 'object',
        properties: {
          fontFile: {
            type: 'string',
            description: 'Path to input font file'
          },
          characters: {
            type: 'string',
            description: 'Characters to include in subset (e.g., "ABCabc123" or unicode ranges)'
          },
          outputFile: {
            type: 'string',
            description: 'Path to output file (optional, defaults to input-subset.ext)'
          }
        },
        required: ['fontFile', 'characters']
      },
      handler: async (args: SubsetFontArgs) => {
        try {
          validateArgs(args, ['fontFile', 'characters'])

          const { fontFile, characters, outputFile } = args

          // Validate input file exists
          try {
            await fs.access(fontFile)
          } catch {
            throw new Error(`Font file not found: ${fontFile}`)
          }

          // Determine output file
          const output = outputFile || fontFile.replace(/(\.[^.]+)$/, '-subset$1')

          // Calculate character set
          const charSet = new Set(characters.split(''))
          const unicodes = Array.from(charSet).map(c => c.charCodeAt(0))

          // In production, this would use a font subsetting library like fonttools
          // For now, return metadata
          return {
            success: true,
            inputFile: fontFile,
            outputFile: output,
            characterCount: charSet.size,
            characters: Array.from(charSet).join(''),
            unicodes,
            message: 'Font subsetting requires fonttools or similar library. This is a simulation.',
            recommendation: 'Use pyftsubset from fonttools: pip install fonttools'
          }
        } catch (error) {
          return createErrorResponse(error)
        }
      }
    })

    // Convert font format tool
    this.addTool({
      name: 'convertFontFormat',
      description: 'Convert font between different formats (TTF, WOFF, WOFF2)',
      inputSchema: {
        type: 'object',
        properties: {
          inputFile: {
            type: 'string',
            description: 'Path to input font file'
          },
          outputFormat: {
            type: 'string',
            enum: ['ttf', 'woff', 'woff2'],
            description: 'Target format'
          },
          outputFile: {
            type: 'string',
            description: 'Path to output file (optional)'
          }
        },
        required: ['inputFile', 'outputFormat']
      },
      handler: async (args: ConvertFontFormatArgs) => {
        try {
          validateArgs(args, ['inputFile', 'outputFormat'])

          const { inputFile, outputFormat, outputFile } = args

          // Validate input file
          try {
            await fs.access(inputFile)
          } catch {
            throw new Error(`Input file not found: ${inputFile}`)
          }

          // Get input format
          const inputFormat = path.extname(inputFile).slice(1).toLowerCase()

          // Determine output file
          const output = outputFile || inputFile.replace(/\.[^.]+$/, `.${outputFormat}`)

          // In production, use font conversion libraries
          return {
            success: true,
            inputFile,
            inputFormat,
            outputFile: output,
            outputFormat,
            message: 'Font conversion requires specialized tools. This is a simulation.',
            recommendations: [
              'WOFF2: Best compression, use for modern browsers',
              'WOFF: Good compression, broader browser support',
              'TTF: No compression, use as source format',
              'Tools: fonttools, woff2, font-converter'
            ]
          }
        } catch (error) {
          return createErrorResponse(error)
        }
      }
    })

    // Analyze font usage tool
    this.addTool({
      name: 'analyzeFontUsage',
      description: 'Analyze font usage in HTML/CSS files to determine which fonts are used',
      inputSchema: {
        type: 'object',
        properties: {
          files: {
            type: 'array',
            items: { type: 'string' },
            description: 'Array of file paths to analyze'
          },
          includeStats: {
            type: 'boolean',
            description: 'Include detailed statistics (default: true)'
          }
        },
        required: ['files']
      },
      handler: async (args: AnalyzeFontUsageArgs) => {
        try {
          validateArgs(args, ['files'])

          const { files, includeStats = true } = args

          const fontFamilies = new Set<string>()
          const fontWeights = new Set<string>()
          const fontStyles = new Set<string>()
          const results: any[] = []

          for (const file of files) {
            try {
              const content = await fs.readFile(file, 'utf-8')

              // Find font-family declarations
              const familyMatches = content.matchAll(/font-family:\s*([^;]+)/gi)
              for (const match of familyMatches) {
                const families = match[1].split(',').map(f => f.trim().replace(/['"]/g, ''))
                families.forEach(f => fontFamilies.add(f))
              }

              // Find font-weight declarations
              const weightMatches = content.matchAll(/font-weight:\s*(\d+|bold|normal)/gi)
              for (const match of weightMatches) {
                fontWeights.add(match[1])
              }

              // Find font-style declarations
              const styleMatches = content.matchAll(/font-style:\s*(italic|normal|oblique)/gi)
              for (const match of styleMatches) {
                fontStyles.add(match[1])
              }

              results.push({
                file,
                analyzed: true
              })
            } catch (error) {
              results.push({
                file,
                analyzed: false,
                error: error instanceof Error ? error.message : 'Failed to read file'
              })
            }
          }

          const response: any = {
            success: true,
            filesAnalyzed: results.filter(r => r.analyzed).length,
            filesWithErrors: results.filter(r => !r.analyzed).length,
            fontFamilies: Array.from(fontFamilies),
            results
          }

          if (includeStats) {
            response.stats = {
              totalFamilies: fontFamilies.size,
              weights: Array.from(fontWeights),
              styles: Array.from(fontStyles),
              recommendations: this.generateRecommendations(fontFamilies, fontWeights)
            }
          }

          return response
        } catch (error) {
          return createErrorResponse(error)
        }
      }
    })
  }

  private generateRecommendations(families: Set<string>, weights: Set<string>): string[] {
    const recommendations: string[] = []

    if (families.size > 3) {
      recommendations.push('Consider reducing font families - using 3 or fewer improves load times')
    }

    if (weights.size > 4) {
      recommendations.push('Limit font weights to 4 or fewer to reduce total font size')
    }

    const hasSystemFonts = Array.from(families).some(f =>
      ['system-ui', 'sans-serif', 'serif', 'monospace'].includes(f.toLowerCase())
    )

    if (!hasSystemFonts) {
      recommendations.push('Consider system font fallbacks for better performance')
    }

    return recommendations
  }
}

// Start server
const server = new FontOptimizerMCPServer()
server.start().catch(console.error)
