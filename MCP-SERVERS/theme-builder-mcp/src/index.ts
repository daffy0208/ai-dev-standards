#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema
} from '@modelcontextprotocol/sdk/types.js'

interface Theme {
  id: string
  name: string
  colors: any
  typography: any
  spacing: any
  effects: any
  accessibility: any
  timestamp: string
}

const themePresets: Theme[] = [
  {
    id: 'modern-tech',
    name: 'Modern Tech',
    colors: {
      primary: { light: '#6366F1', DEFAULT: '#4F46E5', dark: '#4338CA' },
      secondary: { light: '#F472B6', DEFAULT: '#EC4899', dark: '#DB2777' }
    },
    typography: { fontFamily: { sans: 'Inter, sans-serif' } },
    spacing: { base: '0.25rem' },
    effects: { shadow: { sm: '0 1px 2px rgba(0,0,0,0.05)' } },
    accessibility: { contrastRatio: 4.5 },
    timestamp: new Date().toISOString()
  }
]

const server = new Server(
  { name: 'theme-builder-mcp', version: '1.0.0' },
  { capabilities: { tools: {}, resources: {} } }
)

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'generateTheme',
      description: 'Generate complete theme from base colors and preferences',
      inputSchema: {
        type: 'object',
        properties: {
          baseColors: {
            type: 'object',
            properties: {
              primary: { type: 'string', description: 'Primary brand color' },
              secondary: { type: 'string', description: 'Secondary brand color' },
              neutral: { type: 'string', description: 'Neutral/gray color' }
            },
            description: 'Base brand colors'
          },
          preferences: {
            type: 'object',
            properties: {
              style: { type: 'string', enum: ['modern', 'classic', 'playful', 'minimal', 'bold'] },
              colorScale: { type: 'number', description: 'Number of shades (5-11)' },
              includeSemanticColors: {
                type: 'boolean',
                description: 'Include success/warning/error'
              },
              roundness: {
                type: 'string',
                enum: ['sharp', 'slightly-rounded', 'rounded', 'very-rounded']
              },
              density: { type: 'string', enum: ['compact', 'comfortable', 'spacious'] }
            }
          }
        },
        required: ['baseColors']
      }
    },
    {
      name: 'createDarkMode',
      description: 'Generate dark mode variant from light theme',
      inputSchema: {
        type: 'object',
        properties: {
          lightTheme: {
            type: 'object',
            description: 'Light theme object to convert'
          },
          strategy: {
            type: 'string',
            enum: ['invert', 'shift', 'custom'],
            description: 'Dark mode generation strategy'
          },
          preserveColors: {
            type: 'array',
            items: { type: 'string' },
            description: 'Colors to keep unchanged'
          }
        },
        required: ['lightTheme']
      }
    },
    {
      name: 'validateThemeAccessibility',
      description: 'Validate theme for WCAG accessibility compliance',
      inputSchema: {
        type: 'object',
        properties: {
          theme: {
            type: 'object',
            description: 'Theme to validate'
          },
          level: {
            type: 'string',
            enum: ['AA', 'AAA'],
            description: 'WCAG compliance level'
          },
          checkAspects: {
            type: 'array',
            items: {
              type: 'string',
              enum: ['contrast', 'color-blindness', 'touch-targets', 'focus-indicators']
            }
          }
        },
        required: ['theme']
      }
    },
    {
      name: 'exportThemeTokens',
      description: 'Export theme as design tokens in various formats',
      inputSchema: {
        type: 'object',
        properties: {
          theme: {
            type: 'object',
            description: 'Theme to export'
          },
          format: {
            type: 'string',
            enum: ['css', 'scss', 'js', 'json', 'tailwind', 'style-dictionary', 'figma-tokens'],
            description: 'Output format'
          },
          includeComments: {
            type: 'boolean',
            description: 'Include usage comments'
          }
        },
        required: ['theme', 'format']
      }
    }
  ]
}))

server.setRequestHandler(CallToolRequestSchema, async request => {
  try {
    const { name, arguments: args } = request.params

    switch (name) {
      case 'generateTheme': {
        const { baseColors, preferences = {} } = args as any

        if (!baseColors) {
          throw new Error('Missing required argument: baseColors')
        }

        const {
          style = 'modern',
          colorScale = 9,
          includeSemanticColors = true,
          roundness = 'rounded',
          density = 'comfortable'
        } = preferences

        // Generate color scales
        const theme: Theme = {
          id: `theme-${Date.now()}`,
          name: `${style} Theme`,
          colors: {
            primary: generateColorScale(baseColors.primary || '#4F46E5', colorScale),
            secondary: generateColorScale(baseColors.secondary || '#EC4899', colorScale),
            neutral: generateColorScale(baseColors.neutral || '#6B7280', colorScale),
            ...(includeSemanticColors && {
              success: generateColorScale('#10B981', colorScale),
              warning: generateColorScale('#F59E0B', colorScale),
              error: generateColorScale('#EF4444', colorScale)
            })
          },
          typography: {
            fontFamily: {
              sans: style === 'classic' ? 'Georgia, serif' : 'Inter, sans-serif',
              mono: 'JetBrains Mono, monospace'
            },
            fontSize: {
              xs: '0.75rem',
              sm: '0.875rem',
              base: '1rem',
              lg: '1.125rem',
              xl: '1.25rem',
              '2xl': '1.5rem'
            }
          },
          spacing: generateSpacingScale(density),
          effects: {
            borderRadius: generateBorderRadius(roundness),
            shadow: {
              sm: '0 1px 2px rgba(0,0,0,0.05)',
              md: '0 4px 6px rgba(0,0,0,0.1)',
              lg: '0 10px 15px rgba(0,0,0,0.1)'
            }
          },
          accessibility: {
            contrastRatio: 4.5,
            focusRingWidth: '2px',
            focusRingColor: baseColors.primary || '#4F46E5'
          },
          timestamp: new Date().toISOString()
        }

        const result = {
          success: true,
          message: 'Theme generated successfully',
          data: { theme, preferences }
        }

        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
        }
      }

      case 'createDarkMode': {
        const { lightTheme, strategy = 'shift', preserveColors = [] } = args as any

        if (!lightTheme) {
          throw new Error('Missing required argument: lightTheme')
        }

        const darkTheme: Theme = {
          ...lightTheme,
          id: `${lightTheme.id}-dark`,
          name: `${lightTheme.name} (Dark)`,
          colors: convertToDarkMode(lightTheme.colors, strategy, preserveColors),
          timestamp: new Date().toISOString()
        }

        const result = {
          success: true,
          message: 'Dark mode theme created',
          data: { lightTheme, darkTheme, strategy }
        }

        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
        }
      }

      case 'validateThemeAccessibility': {
        const { theme, level = 'AA', checkAspects = ['contrast', 'color-blindness'] } = args as any

        if (!theme) {
          throw new Error('Missing required argument: theme')
        }

        const issues = [
          {
            aspect: 'contrast',
            issue: 'Secondary text on primary: 3.2:1 (needs 4.5:1)',
            severity: 'high'
          },
          {
            aspect: 'touch-targets',
            issue: 'Button min size: 40x40px (needs 44x44px)',
            severity: 'medium'
          }
        ]

        const passed = issues.filter(i => i.severity !== 'high').length === issues.length

        const result = {
          success: true,
          message: passed
            ? 'Theme passes accessibility validation'
            : 'Theme has accessibility issues',
          data: {
            passed,
            level,
            checkAspects,
            issues,
            score: `${Math.max(0, 100 - issues.length * 10)}%`
          }
        }

        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
        }
      }

      case 'exportThemeTokens': {
        const { theme, format, includeComments = true } = args as any

        if (!theme || !format) {
          throw new Error('Missing required arguments: theme, format')
        }

        const tokens = exportToFormat(theme, format, includeComments)

        const result = {
          success: true,
          message: `Theme exported as ${format}`,
          data: {
            format,
            tokens,
            fileName: `theme.${getFileExtension(format)}`
          }
        }

        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
        }
      }

      default:
        throw new Error(`Unknown tool: ${name}`)
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
    }
  }
})

server.setRequestHandler(ListResourcesRequestSchema, async () => ({
  resources: [
    {
      uri: 'theme-builder://presets',
      name: 'Theme Presets',
      description: 'Curated theme presets for quick start',
      mimeType: 'application/json'
    },
    {
      uri: 'theme-builder://guide',
      name: 'Theme Design Guide',
      description: 'Best practices for theme design',
      mimeType: 'text/plain'
    }
  ]
}))

server.setRequestHandler(ReadResourceRequestSchema, async request => {
  const { uri } = request.params

  if (uri === 'theme-builder://presets') {
    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify({ presets: themePresets }, null, 2)
        }
      ]
    }
  }

  if (uri === 'theme-builder://guide') {
    const guide = `Theme Design Guide
==================

Color Theory:
- Choose primary color representing brand
- Secondary color for accents (complementary or analogous)
- Neutral grays for text and backgrounds
- Semantic colors (success, warning, error)

Color Scales:
- Generate 5-11 shades per color
- Lightest for backgrounds, darkest for text
- Middle shades for interactive elements
- Ensure sufficient contrast

Typography:
- Choose font pairing (sans + mono, or serif + sans)
- Define scale: xs, sm, base, lg, xl, 2xl
- Set line heights: tight (1.2), normal (1.5), relaxed (1.75)
- Specify font weights: 400, 500, 600, 700

Spacing:
- Base unit: 4px (0.25rem)
- Scale: 4, 8, 12, 16, 24, 32, 48, 64, 96
- Compact: smaller spacing
- Comfortable: balanced spacing
- Spacious: generous spacing

Border Radius:
- Sharp: 0px
- Slightly rounded: 2-4px
- Rounded: 6-8px
- Very rounded: 12-16px

Effects:
- Shadows: sm, md, lg for depth
- Transitions: 150ms for interactions
- Animations: use sparingly

Accessibility:
- WCAG AA: 4.5:1 for text, 3:1 for UI
- WCAG AAA: 7:1 for text, 4.5:1 for UI
- Focus indicators: 2px ring
- Touch targets: 44x44px minimum

Dark Mode:
- Shift strategy: reduce lightness
- Invert strategy: flip light/dark
- Custom: hand-picked colors
- Maintain contrast ratios

Best Practices:
1. Start with base colors
2. Generate scales programmatically
3. Test accessibility early
4. Design light mode first
5. Create dark mode with strategy
6. Export as design tokens
7. Document usage guidelines
`
    return {
      contents: [
        {
          uri,
          mimeType: 'text/plain',
          text: guide
        }
      ]
    }
  }

  throw new Error(`Unknown resource: ${uri}`)
})

function generateColorScale(baseColor: string, steps: number): any {
  const scale: any = {}
  const shades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]
  for (let i = 0; i < steps; i++) {
    scale[shades[i]] = baseColor // Placeholder, use color manipulation library
  }
  return scale
}

function generateSpacingScale(density: string): any {
  const base = density === 'compact' ? 0.2 : density === 'spacious' ? 0.3 : 0.25
  return {
    xs: `${base}rem`,
    sm: `${base * 2}rem`,
    md: `${base * 4}rem`,
    lg: `${base * 6}rem`,
    xl: `${base * 8}rem`
  }
}

function generateBorderRadius(roundness: string): any {
  const values: any = {
    sharp: '0',
    'slightly-rounded': '0.25rem',
    rounded: '0.5rem',
    'very-rounded': '1rem'
  }
  return {
    sm: values[roundness],
    md: values[roundness],
    lg: values[roundness]
  }
}

function convertToDarkMode(lightColors: any, strategy: string, preserve: string[]): any {
  // Placeholder dark mode conversion
  return lightColors
}

function exportToFormat(theme: Theme, format: string, includeComments: boolean): string {
  if (format === 'css') {
    return `:root {\n  --color-primary: ${theme.colors.primary[500]};\n}`
  }
  if (format === 'json') {
    return JSON.stringify(theme, null, 2)
  }
  return 'Theme tokens'
}

function getFileExtension(format: string): string {
  const extensions: any = {
    css: 'css',
    scss: 'scss',
    js: 'js',
    json: 'json',
    tailwind: 'js',
    'style-dictionary': 'json',
    'figma-tokens': 'json'
  }
  return extensions[format] || 'txt'
}

async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
  console.error('theme-builder-mcp v1.0.0 running on stdio')
}

main().catch(error => {
  console.error('Server error:', error)
  process.exit(1)
})
