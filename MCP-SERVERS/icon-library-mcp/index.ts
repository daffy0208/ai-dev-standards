/**
 * Icon Library MCP Server
 *
 * MCP server providing icon search and retrieval across multiple icon libraries.
 * Supports Heroicons, Lucide, and Font Awesome.
 *
 * Tools:
 * - searchIcons: Search for icons by name across libraries
 * - getIconSvg: Get SVG content for a specific icon
 *
 * Resources:
 * - icon-collections: List all available icon libraries
 *
 * Usage:
 * ```bash
 * node index.ts
 * ```
 */

import { BaseMCPServer, validateArgs, createErrorResponse } from '../../COMPONENTS/mcp-servers/base-mcp-server'

interface SearchIconsArgs {
  query: string
  library?: 'heroicons' | 'lucide' | 'font-awesome' | 'all'
  limit?: number
}

interface GetIconSvgArgs {
  name: string
  library: 'heroicons' | 'lucide' | 'font-awesome'
  variant?: string
  size?: number
}

class IconLibraryMCPServer extends BaseMCPServer {
  constructor() {
    super('icon-library-mcp', '1.0.0')
    this.registerTools()
    this.registerResources()
  }

  protected registerTools(): void {
    // Search icons tool
    this.addTool({
      name: 'searchIcons',
      description: 'Search for icons by name across icon libraries. Supports Heroicons, Lucide, and Font Awesome.',
      inputSchema: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Search query for icon name or keywords'
          },
          library: {
            type: 'string',
            enum: ['heroicons', 'lucide', 'font-awesome', 'all'],
            description: 'Icon library to search (default: all)'
          },
          limit: {
            type: 'number',
            description: 'Maximum number of results to return (default: 20)'
          }
        },
        required: ['query']
      },
      handler: async (args: SearchIconsArgs) => {
        try {
          validateArgs(args, ['query'])

          const query = args.query.toLowerCase().trim()
          const library = args.library || 'all'
          const limit = args.limit || 20

          let results: any[] = []

          // Search Heroicons
          if (library === 'all' || library === 'heroicons') {
            const heroicons = this.searchHeroicons(query)
            results.push(...heroicons.map(icon => ({ ...icon, library: 'heroicons' })))
          }

          // Search Lucide
          if (library === 'all' || library === 'lucide') {
            const lucide = this.searchLucide(query)
            results.push(...lucide.map(icon => ({ ...icon, library: 'lucide' })))
          }

          // Search Font Awesome
          if (library === 'all' || library === 'font-awesome') {
            const fontAwesome = this.searchFontAwesome(query)
            results.push(...fontAwesome.map(icon => ({ ...icon, library: 'font-awesome' })))
          }

          // Sort by relevance and limit
          results = results.slice(0, limit)

          return {
            success: true,
            query,
            library,
            total: results.length,
            icons: results
          }
        } catch (error) {
          return createErrorResponse(error)
        }
      }
    })

    // Get icon SVG tool
    this.addTool({
      name: 'getIconSvg',
      description: 'Get SVG content for a specific icon from a library',
      inputSchema: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'Icon name (kebab-case)'
          },
          library: {
            type: 'string',
            enum: ['heroicons', 'lucide', 'font-awesome'],
            description: 'Icon library'
          },
          variant: {
            type: 'string',
            description: 'Icon variant (e.g., outline, solid for Heroicons)'
          },
          size: {
            type: 'number',
            description: 'Icon size in pixels (default: 24)'
          }
        },
        required: ['name', 'library']
      },
      handler: async (args: GetIconSvgArgs) => {
        try {
          validateArgs(args, ['name', 'library'])

          const { name, library, variant = 'outline', size = 24 } = args

          let url: string
          let svg: string

          switch (library) {
            case 'heroicons': {
              const sizeStr = size <= 20 ? '20' : '24'
              url = `https://raw.githubusercontent.com/tailwindlabs/heroicons/master/src/${sizeStr}/${variant}/${name}.svg`
              break
            }
            case 'lucide': {
              url = `https://cdn.jsdelivr.net/npm/lucide-static@latest/icons/${name}.svg`
              break
            }
            case 'font-awesome': {
              const style = variant || 'solid'
              url = `https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.5.1/svgs/${style}/${name}.svg`
              break
            }
            default:
              throw new Error(`Unknown library: ${library}`)
          }

          // Fetch SVG
          const response = await fetch(url)
          if (!response.ok) {
            throw new Error(`Icon not found: ${name} in ${library}`)
          }

          svg = await response.text()

          return {
            success: true,
            name,
            library,
            variant,
            size,
            svg,
            url
          }
        } catch (error) {
          return createErrorResponse(error)
        }
      }
    })
  }

  protected registerResources(): void {
    this.addResource({
      uri: 'icon://collections',
      name: 'icon-collections',
      description: 'List of all available icon libraries with metadata',
      mimeType: 'application/json',
      handler: async () => {
        return JSON.stringify({
          libraries: [
            {
              id: 'heroicons',
              name: 'Heroicons',
              description: 'Beautiful hand-crafted SVG icons by Tailwind CSS',
              count: 200,
              variants: ['outline', 'solid', 'mini'],
              url: 'https://heroicons.com/'
            },
            {
              id: 'lucide',
              name: 'Lucide',
              description: 'Beautiful & consistent icon toolkit with 1000+ icons',
              count: 1000,
              variants: ['default'],
              url: 'https://lucide.dev/'
            },
            {
              id: 'font-awesome',
              name: 'Font Awesome',
              description: 'The web\'s most popular icon set',
              count: 2000,
              variants: ['solid', 'regular', 'brands'],
              url: 'https://fontawesome.com/'
            }
          ]
        }, null, 2)
      }
    })
  }

  // Search implementations
  private searchHeroicons(query: string): any[] {
    const icons = [
      'arrow-right', 'arrow-left', 'arrow-up', 'arrow-down',
      'check', 'x-mark', 'plus', 'minus', 'heart', 'star',
      'home', 'user', 'users', 'cog-6-tooth', 'magnifying-glass',
      'bell', 'envelope', 'folder', 'document', 'trash'
    ]

    return icons
      .filter(name => name.includes(query))
      .map(name => ({ name, displayName: this.toDisplayName(name) }))
  }

  private searchLucide(query: string): any[] {
    const icons = [
      'arrow-right', 'arrow-left', 'check', 'x', 'plus', 'minus',
      'heart', 'star', 'home', 'user', 'users', 'settings',
      'search', 'bell', 'mail', 'folder', 'file', 'trash-2'
    ]

    return icons
      .filter(name => name.includes(query))
      .map(name => ({ name, displayName: this.toDisplayName(name) }))
  }

  private searchFontAwesome(query: string): any[] {
    const icons = [
      'arrow-right', 'arrow-left', 'check', 'xmark', 'plus', 'minus',
      'heart', 'star', 'house', 'user', 'users', 'gear',
      'magnifying-glass', 'bell', 'envelope', 'folder', 'file', 'trash'
    ]

    return icons
      .filter(name => name.includes(query))
      .map(name => ({ name, displayName: this.toDisplayName(name) }))
  }

  private toDisplayName(name: string): string {
    return name
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }
}

// Start server
const server = new IconLibraryMCPServer()
server.start().catch(console.error)
