#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema
} from '@modelcontextprotocol/sdk/types.js'

interface Illustration {
  id: string
  description: string
  style: string
  imageUrl: string
  svgData?: string
  metadata: {
    colors: string[]
    dimensions: { width: number; height: number }
    elements: string[]
  }
  timestamp: string
}

const illustrationLibrary: Illustration[] = []

const server = new Server(
  { name: 'illustration-generator-mcp', version: '1.0.0' },
  { capabilities: { tools: {}, resources: {} } }
)

// Tools Handler
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'generateIllustration',
      description:
        'Generate custom illustration from text description with various artistic styles',
      inputSchema: {
        type: 'object',
        properties: {
          description: {
            type: 'string',
            description: 'Detailed description of the illustration'
          },
          style: {
            type: 'string',
            description: 'Illustration style',
            enum: ['flat', '3d', 'hand-drawn', 'minimalist', 'geometric', 'isometric', 'line-art']
          },
          colorPalette: {
            type: 'array',
            description: 'Color palette for the illustration',
            items: { type: 'string' }
          },
          aspectRatio: {
            type: 'string',
            description: 'Aspect ratio',
            enum: ['1:1', '16:9', '4:3', '3:2', '9:16']
          },
          complexity: {
            type: 'string',
            description: 'Level of detail',
            enum: ['simple', 'moderate', 'detailed', 'complex']
          },
          format: {
            type: 'string',
            description: 'Output format',
            enum: ['svg', 'png', 'jpg', 'webp']
          }
        },
        required: ['description', 'style']
      }
    },
    {
      name: 'generateCharacter',
      description: 'Generate character illustration with specific traits and style',
      inputSchema: {
        type: 'object',
        properties: {
          traits: {
            type: 'object',
            description: 'Character traits',
            properties: {
              age: { type: 'string' },
              gender: { type: 'string' },
              profession: { type: 'string' },
              personality: { type: 'string' },
              clothing: { type: 'string' }
            }
          },
          style: {
            type: 'string',
            description: 'Character style',
            enum: ['cartoon', 'realistic', 'anime', 'chibi', 'pixel-art', 'vector']
          },
          pose: {
            type: 'string',
            description: 'Character pose',
            enum: ['standing', 'sitting', 'walking', 'running', 'custom']
          },
          expression: {
            type: 'string',
            description: 'Facial expression',
            enum: ['happy', 'sad', 'neutral', 'excited', 'angry', 'surprised']
          },
          backgroundColor: {
            type: 'string',
            description: 'Background color or transparent'
          }
        },
        required: ['traits', 'style']
      }
    },
    {
      name: 'generateScene',
      description: 'Generate complete scene illustration with environment and objects',
      inputSchema: {
        type: 'object',
        properties: {
          description: {
            type: 'string',
            description: 'Scene description'
          },
          environment: {
            type: 'string',
            description: 'Environment type',
            enum: ['indoor', 'outdoor', 'urban', 'nature', 'abstract', 'workspace']
          },
          timeOfDay: {
            type: 'string',
            description: 'Lighting and time',
            enum: ['morning', 'afternoon', 'evening', 'night']
          },
          mood: {
            type: 'string',
            description: 'Overall mood',
            enum: ['calm', 'energetic', 'mysterious', 'professional', 'playful']
          },
          perspective: {
            type: 'string',
            description: 'View perspective',
            enum: ['front', 'side', 'top-down', 'isometric', '3-quarter']
          },
          includeCharacters: {
            type: 'boolean',
            description: 'Include people in the scene'
          }
        },
        required: ['description']
      }
    },
    {
      name: 'customizeIllustration',
      description: 'Customize existing illustration with modifications',
      inputSchema: {
        type: 'object',
        properties: {
          illustrationId: {
            type: 'string',
            description: 'ID of the illustration to customize'
          },
          modifications: {
            type: 'object',
            description: 'Modifications to apply',
            properties: {
              colorScheme: { type: 'array', items: { type: 'string' } },
              style: { type: 'string' },
              elements: {
                type: 'object',
                properties: {
                  add: { type: 'array', items: { type: 'string' } },
                  remove: { type: 'array', items: { type: 'string' } }
                }
              },
              scale: { type: 'number' }
            }
          }
        },
        required: ['illustrationId', 'modifications']
      }
    }
  ]
}))

server.setRequestHandler(CallToolRequestSchema, async request => {
  try {
    const { name, arguments: args } = request.params

    switch (name) {
      case 'generateIllustration': {
        const {
          description,
          style,
          colorPalette = ['#4F46E5', '#EC4899', '#10B981', '#F59E0B'],
          aspectRatio = '16:9',
          complexity = 'moderate',
          format = 'svg'
        } = args as any

        if (!description || !style) {
          throw new Error('Missing required arguments: description, style')
        }

        // Calculate dimensions based on aspect ratio
        const aspectMap: Record<string, { width: number; height: number }> = {
          '1:1': { width: 800, height: 800 },
          '16:9': { width: 1600, height: 900 },
          '4:3': { width: 1200, height: 900 },
          '3:2': { width: 1200, height: 800 },
          '9:16': { width: 900, height: 1600 }
        }

        const dimensions = aspectMap[aspectRatio] || { width: 800, height: 600 }

        const illustration: Illustration = {
          id: `ill-${Date.now()}`,
          description,
          style,
          imageUrl: `https://placeholder.example.com/illustrations/${Date.now()}.${format}`,
          svgData:
            format === 'svg'
              ? `<svg width="${dimensions.width}" height="${dimensions.height}" xmlns="http://www.w3.org/2000/svg"><!-- ${description} --></svg>`
              : undefined,
          metadata: {
            colors: colorPalette,
            dimensions,
            elements: ['background', 'foreground', 'details']
          },
          timestamp: new Date().toISOString()
        }

        illustrationLibrary.push(illustration)

        const result = {
          success: true,
          message: 'Illustration generated successfully',
          data: {
            illustration,
            style,
            complexity,
            format,
            aspectRatio
          },
          note: 'This is a placeholder. Integrate with AI illustration services for custom graphics.'
        }

        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
        }
      }

      case 'generateCharacter': {
        const {
          traits,
          style,
          pose = 'standing',
          expression = 'neutral',
          backgroundColor = 'transparent'
        } = args as any

        if (!traits || !style) {
          throw new Error('Missing required arguments: traits, style')
        }

        const character: Illustration = {
          id: `char-${Date.now()}`,
          description: `${traits.profession || 'person'} character with ${expression} expression`,
          style,
          imageUrl: `https://placeholder.example.com/characters/${Date.now()}.png`,
          metadata: {
            colors: backgroundColor === 'transparent' ? [] : [backgroundColor],
            dimensions: { width: 800, height: 1200 },
            elements: ['character', 'clothing', 'accessories']
          },
          timestamp: new Date().toISOString()
        }

        illustrationLibrary.push(character)

        const result = {
          success: true,
          message: 'Character generated successfully',
          data: {
            character,
            traits,
            pose,
            expression,
            style
          },
          note: 'This is a placeholder. Integrate with character generation AI for custom characters.'
        }

        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
        }
      }

      case 'generateScene': {
        const {
          description,
          environment = 'indoor',
          timeOfDay = 'afternoon',
          mood = 'professional',
          perspective = 'front',
          includeCharacters = false
        } = args as any

        if (!description) {
          throw new Error('Missing required argument: description')
        }

        const scene: Illustration = {
          id: `scene-${Date.now()}`,
          description,
          style: 'scene',
          imageUrl: `https://placeholder.example.com/scenes/${Date.now()}.png`,
          metadata: {
            colors: ['#87CEEB', '#228B22', '#8B4513', '#FFD700'],
            dimensions: { width: 1920, height: 1080 },
            elements: [
              'environment',
              'lighting',
              includeCharacters ? 'characters' : 'empty',
              'objects'
            ]
          },
          timestamp: new Date().toISOString()
        }

        illustrationLibrary.push(scene)

        const result = {
          success: true,
          message: 'Scene generated successfully',
          data: {
            scene,
            environment,
            timeOfDay,
            mood,
            perspective,
            includeCharacters
          },
          note: 'This is a placeholder. Integrate with scene generation AI for complete environments.'
        }

        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
        }
      }

      case 'customizeIllustration': {
        const { illustrationId, modifications } = args as any

        if (!illustrationId || !modifications) {
          throw new Error('Missing required arguments: illustrationId, modifications')
        }

        const original = illustrationLibrary.find(ill => ill.id === illustrationId)
        if (!original) {
          throw new Error(`Illustration not found: ${illustrationId}`)
        }

        const customized: Illustration = {
          ...original,
          id: `${illustrationId}-mod-${Date.now()}`,
          imageUrl: `https://placeholder.example.com/illustrations/modified-${Date.now()}.png`,
          metadata: {
            ...original.metadata,
            colors: modifications.colorScheme || original.metadata.colors
          },
          timestamp: new Date().toISOString()
        }

        illustrationLibrary.push(customized)

        const result = {
          success: true,
          message: 'Illustration customized successfully',
          data: {
            original,
            customized,
            modifications
          },
          note: 'This is a placeholder. Integrate with AI editing services for customization.'
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
      uri: 'illustration-generator://library',
      name: 'Illustration Library',
      description: 'All generated illustrations',
      mimeType: 'application/json'
    },
    {
      uri: 'illustration-generator://styles',
      name: 'Style Guide',
      description: 'Available illustration styles and best practices',
      mimeType: 'text/plain'
    }
  ]
}))

server.setRequestHandler(ReadResourceRequestSchema, async request => {
  const { uri } = request.params

  if (uri === 'illustration-generator://library') {
    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify(
            {
              illustrations: illustrationLibrary,
              count: illustrationLibrary.length
            },
            null,
            2
          )
        }
      ]
    }
  }

  if (uri === 'illustration-generator://styles') {
    const guide = `Illustration Styles Guide
=========================

FLAT
- Simple shapes, solid colors
- No shadows or gradients
- Best for: Modern, clean designs
- Use cases: Landing pages, presentations

3D
- Depth and dimension
- Lighting and shadows
- Best for: Product visualization
- Use cases: Hero sections, features

HAND-DRAWN
- Organic, imperfect lines
- Sketchy appearance
- Best for: Personal, approachable feel
- Use cases: Blogs, creative portfolios

MINIMALIST
- Essential elements only
- Limited color palette (1-3 colors)
- Best for: Elegant, focused designs
- Use cases: Premium brands, services

GEOMETRIC
- Shapes and patterns
- Mathematical precision
- Best for: Technical, abstract concepts
- Use cases: Tech products, data viz

ISOMETRIC
- 30-degree perspective
- Consistent angles
- Best for: Diagrams, architecture
- Use cases: Infographics, tutorials

LINE-ART
- Outlines only, no fill
- Clean and simple
- Best for: Icons, technical drawings
- Use cases: Instructions, schematics

CHARACTER STYLES
================

CARTOON
- Exaggerated features
- Bright colors
- Best for: Playful, fun applications

REALISTIC
- Detailed, lifelike
- Proper proportions
- Best for: Professional contexts

ANIME
- Large eyes, stylized
- Japanese aesthetic
- Best for: Gaming, entertainment

CHIBI
- Small body, large head
- Cute and simplified
- Best for: Mascots, stickers

PIXEL-ART
- Retro gaming aesthetic
- Grid-based design
- Best for: Indie games, nostalgia

VECTOR
- Clean, scalable
- Professional quality
- Best for: Branding, marketing

SCENE COMPOSITION
================

Indoor Scenes:
- Office, home, cafe
- Focus on lighting
- Include furniture, details

Outdoor Scenes:
- Nature, urban, abstract
- Sky, horizon, landscape
- Weather and atmosphere

Workspace Scenes:
- Desk, computer, tools
- Professional context
- Clean and organized

Best Practices:
1. Choose style based on brand
2. Maintain consistency across assets
3. Consider color psychology
4. Ensure cultural sensitivity
5. Test at different sizes
6. Provide alt text
7. Optimize file sizes
8. Use appropriate formats
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
  console.error('illustration-generator-mcp v1.0.0 running on stdio')
}

main().catch(error => {
  console.error('Server error:', error)
  process.exit(1)
})
