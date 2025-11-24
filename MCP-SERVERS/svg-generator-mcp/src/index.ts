#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema
} from '@modelcontextprotocol/sdk/types.js'

interface SVGTemplate {
  name: string
  category: string
  svg: string
  tags: string[]
}

const svgTemplates: SVGTemplate[] = [
  {
    name: 'Circle Icon',
    category: 'shapes',
    svg: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/></svg>',
    tags: ['circle', 'shape', 'basic']
  },
  {
    name: 'Star Icon',
    category: 'icons',
    svg: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" stroke-width="2"/></svg>',
    tags: ['star', 'favorite', 'rating']
  },
  {
    name: 'Geometric Pattern',
    category: 'patterns',
    svg: '<svg width="100" height="100" viewBox="0 0 100 100"><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" stroke-width="0.5"/></pattern><rect width="100" height="100" fill="url(#grid)"/></svg>',
    tags: ['pattern', 'grid', 'background']
  }
]

const server = new Server(
  { name: 'svg-generator-mcp', version: '1.0.0' },
  { capabilities: { tools: {}, resources: {} } }
)

// Tools Handler
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'generateSvgIcon',
      description: 'Generate SVG icon from text description with customizable style',
      inputSchema: {
        type: 'object',
        properties: {
          description: {
            type: 'string',
            description: 'Description of the icon to generate'
          },
          style: {
            type: 'string',
            description: 'Icon style',
            enum: ['line', 'solid', 'duotone', 'outline']
          },
          size: {
            type: 'number',
            description: 'Icon size in pixels (default: 24)'
          },
          color: {
            type: 'string',
            description: 'Icon color (hex, rgb, or currentColor)'
          },
          strokeWidth: {
            type: 'number',
            description: 'Stroke width for outline styles (default: 2)'
          }
        },
        required: ['description']
      }
    },
    {
      name: 'generateSvgIllustration',
      description: 'Generate SVG illustration from text prompt',
      inputSchema: {
        type: 'object',
        properties: {
          prompt: {
            type: 'string',
            description: 'Description of the illustration'
          },
          style: {
            type: 'string',
            description: 'Illustration style',
            enum: ['flat', 'minimalist', 'geometric', 'isometric', 'abstract']
          },
          colorScheme: {
            type: 'array',
            description: 'Array of colors to use',
            items: { type: 'string' }
          },
          complexity: {
            type: 'string',
            description: 'Complexity level',
            enum: ['simple', 'medium', 'detailed']
          }
        },
        required: ['prompt']
      }
    },
    {
      name: 'generateSvgPattern',
      description: 'Generate SVG pattern for backgrounds or fills',
      inputSchema: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            description: 'Pattern type',
            enum: ['dots', 'lines', 'grid', 'waves', 'hexagons', 'triangles']
          },
          colors: {
            type: 'array',
            description: 'Pattern colors',
            items: { type: 'string' }
          },
          density: {
            type: 'string',
            description: 'Pattern density',
            enum: ['low', 'medium', 'high']
          },
          size: {
            type: 'number',
            description: 'Pattern tile size in pixels'
          }
        },
        required: ['type']
      }
    },
    {
      name: 'optimizeSvg',
      description: 'Optimize SVG code by removing unnecessary elements and reducing file size',
      inputSchema: {
        type: 'object',
        properties: {
          svgContent: {
            type: 'string',
            description: 'SVG code to optimize'
          },
          options: {
            type: 'object',
            description: 'Optimization options',
            properties: {
              removeComments: { type: 'boolean' },
              removeMetadata: { type: 'boolean' },
              removeHiddenElements: { type: 'boolean' },
              convertToPathData: { type: 'boolean' },
              precision: { type: 'number' }
            }
          }
        },
        required: ['svgContent']
      }
    }
  ]
}))

server.setRequestHandler(CallToolRequestSchema, async request => {
  try {
    const { name, arguments: args } = request.params

    switch (name) {
      case 'generateSvgIcon': {
        const {
          description,
          style = 'line',
          size = 24,
          color = 'currentColor',
          strokeWidth = 2
        } = args as any

        if (!description) {
          throw new Error('Missing required argument: description')
        }

        // Generate simple SVG icon based on description
        const svg = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- ${description} -->
  <path d="M${size / 4} ${size / 2} L${(size * 3) / 4} ${size / 2} M${size / 2} ${size / 4} L${size / 2} ${(size * 3) / 4}"
        stroke="${color}"
        stroke-width="${strokeWidth}"
        stroke-linecap="round"/>
</svg>`

        const result = {
          success: true,
          message: 'SVG icon generated',
          data: {
            svg: svg.trim(),
            description,
            style,
            size,
            color,
            bytes: new Blob([svg]).size,
            timestamp: new Date().toISOString()
          },
          note: 'This is a placeholder SVG. Integrate with AI SVG generation service for actual icons.'
        }

        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
        }
      }

      case 'generateSvgIllustration': {
        const {
          prompt,
          style = 'flat',
          colorScheme = ['#4F46E5', '#EC4899', '#10B981'],
          complexity = 'medium'
        } = args as any

        if (!prompt) {
          throw new Error('Missing required argument: prompt')
        }

        // Generate simple illustration SVG
        const svg = `<svg width="400" height="300" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
  <!-- ${prompt} (${style} style, ${complexity} complexity) -->
  <rect width="400" height="300" fill="${colorScheme[0]}" opacity="0.1"/>
  <circle cx="200" cy="150" r="80" fill="${colorScheme[0]}"/>
  <circle cx="160" cy="120" r="40" fill="${colorScheme[1]}"/>
  <circle cx="240" cy="120" r="40" fill="${colorScheme[2]}"/>
</svg>`

        const result = {
          success: true,
          message: 'SVG illustration generated',
          data: {
            svg: svg.trim(),
            prompt,
            style,
            colorScheme,
            complexity,
            dimensions: { width: 400, height: 300 },
            bytes: new Blob([svg]).size,
            timestamp: new Date().toISOString()
          },
          note: 'This is a placeholder illustration. Integrate with AI illustration service for custom graphics.'
        }

        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
        }
      }

      case 'generateSvgPattern': {
        const { type, colors = ['#000000'], density = 'medium', size = 20 } = args as any

        if (!type) {
          throw new Error('Missing required argument: type')
        }

        let patternSvg = ''
        switch (type) {
          case 'dots':
            patternSvg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <circle cx="${size / 2}" cy="${size / 2}" r="${size / 6}" fill="${colors[0]}"/>
</svg>`
            break
          case 'grid':
            patternSvg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <path d="M ${size} 0 L 0 0 0 ${size}" fill="none" stroke="${colors[0]}" stroke-width="1"/>
</svg>`
            break
          case 'lines':
            patternSvg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <line x1="0" y1="0" x2="${size}" y2="${size}" stroke="${colors[0]}" stroke-width="1"/>
</svg>`
            break
          default:
            patternSvg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="${colors[0]}" opacity="0.1"/>
</svg>`
        }

        const fullSvg = `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <pattern id="${type}-pattern" x="0" y="0" width="${size}" height="${size}" patternUnits="userSpaceOnUse">
      ${patternSvg.replace(/<svg[^>]*>|<\/svg>/g, '')}
    </pattern>
  </defs>
  <rect width="200" height="200" fill="url(#${type}-pattern)"/>
</svg>`

        const result = {
          success: true,
          message: 'SVG pattern generated',
          data: {
            svg: fullSvg.trim(),
            type,
            colors,
            density,
            tileSize: size,
            bytes: new Blob([fullSvg]).size,
            timestamp: new Date().toISOString()
          }
        }

        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
        }
      }

      case 'optimizeSvg': {
        const { svgContent, options = {} } = args as any

        if (!svgContent) {
          throw new Error('Missing required argument: svgContent')
        }

        // Simple optimization (in production, use SVGO library)
        let optimized = svgContent

        if (options.removeComments !== false) {
          optimized = optimized.replace(/<!--[\s\S]*?-->/g, '')
        }

        // Remove unnecessary whitespace
        optimized = optimized.replace(/\s+/g, ' ').trim()

        const originalSize = new Blob([svgContent]).size
        const optimizedSize = new Blob([optimized]).size
        const savings = (((originalSize - optimizedSize) / originalSize) * 100).toFixed(2)

        const result = {
          success: true,
          message: 'SVG optimized',
          data: {
            originalSvg: svgContent,
            optimizedSvg: optimized,
            originalSize,
            optimizedSize,
            savings: `${savings}%`,
            options,
            timestamp: new Date().toISOString()
          },
          note: 'Basic optimization applied. For production, use SVGO library for comprehensive optimization.'
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

// Resources Handler
server.setRequestHandler(ListResourcesRequestSchema, async () => ({
  resources: [
    {
      uri: 'svg-generator://templates',
      name: 'SVG Templates',
      description: 'Collection of common SVG shapes, icons, and patterns',
      mimeType: 'application/json'
    },
    {
      uri: 'svg-generator://guide',
      name: 'SVG Generation Guide',
      description: 'Best practices for SVG generation and optimization',
      mimeType: 'text/plain'
    }
  ]
}))

server.setRequestHandler(ReadResourceRequestSchema, async request => {
  const { uri } = request.params

  if (uri === 'svg-generator://templates') {
    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify({ templates: svgTemplates }, null, 2)
        }
      ]
    }
  }

  if (uri === 'svg-generator://guide') {
    const guide = `SVG Generation Guide
====================

Best Practices:
1. Use viewBox for responsive scaling
2. Set width/height for default size
3. Use currentColor for theme integration
4. Minimize path complexity
5. Remove unnecessary groups
6. Use semantic element names

Icon Styles:
- Line: Simple outlines, 2px stroke
- Solid: Filled shapes, no stroke
- Duotone: Two-color combinations
- Outline: Detailed strokes, varying widths

Optimization Tips:
- Remove metadata and comments
- Simplify paths with fewer points
- Use relative path commands
- Combine similar elements
- Round decimal precision to 2 places
- Use CSS instead of inline styles

Color Management:
- Use currentColor for theme compatibility
- Define color palettes in CSS variables
- Support light/dark modes
- Ensure sufficient contrast

Accessibility:
- Add title and desc elements
- Use role="img" attribute
- Provide alt text alternatives
- Ensure keyboard navigability

Performance:
- Keep file size under 10KB
- Minimize DOM nodes
- Use CSS animations over SMIL
- Consider sprite sheets for multiple icons

Common Patterns:
- Dots: Repeating circles
- Grid: Intersecting lines
- Waves: Curved sinusoidal paths
- Geometric: Triangles, hexagons
- Stripes: Parallel lines

Tools Integration:
- SVGO: Command-line optimizer
- Figma: Design to SVG export
- Illustrator: Professional graphics
- Inkscape: Open-source editor
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

async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
  console.error('svg-generator-mcp v1.0.0 running on stdio')
}

main().catch(error => {
  console.error('Server error:', error)
  process.exit(1)
})
