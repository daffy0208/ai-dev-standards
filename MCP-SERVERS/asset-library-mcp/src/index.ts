#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { CallToolRequestSchema, ListResourcesRequestSchema, ListToolsRequestSchema, ReadResourceRequestSchema } from '@modelcontextprotocol/sdk/types.js'
import * as fs from 'fs'
import * as path from 'path'
import * as crypto from 'crypto'

interface Asset {
  id: string
  name: string
  type: string
  path: string
  size: number
  metadata: Record<string, any>
  createdAt: string
  tags: string[]
}

const assetLibrary: Asset[] = []
const server = new Server({ name: 'asset-library-mcp', version: '1.0.0' }, { capabilities: { tools: {}, resources: {} } })

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'add_asset',
      description: 'Add asset to library',
      inputSchema: {
        type: 'object',
        properties: {
          filePath: { type: 'string', description: 'Path to asset file' },
          metadata: { type: 'object', description: 'Asset metadata' },
          tags: { type: 'array', items: { type: 'string' }, description: 'Asset tags' },
        },
        required: ['filePath'],
      },
    },
    {
      name: 'search_assets',
      description: 'Search assets by query and filters',
      inputSchema: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Search query' },
          filters: { type: 'object', description: 'Filters (type, tags)' },
        },
      },
    },
    {
      name: 'optimize_asset',
      description: 'Optimize asset (compression, format conversion)',
      inputSchema: {
        type: 'object',
        properties: {
          assetId: { type: 'string', description: 'Asset ID' },
          options: { type: 'object', description: 'Optimization options' },
        },
        required: ['assetId'],
      },
    },
    {
      name: 'generate_variants',
      description: 'Generate asset variants (sizes, formats)',
      inputSchema: {
        type: 'object',
        properties: {
          assetId: { type: 'string', description: 'Asset ID' },
          sizes: { type: 'array', items: { type: 'object' }, description: 'Size variants' },
        },
        required: ['assetId', 'sizes'],
      },
    },
  ],
}))

server.setRequestHandler(ListResourcesRequestSchema, async () => ({
  resources: [
    {
      uri: 'assets://catalog',
      name: 'Asset Catalog',
      description: 'Searchable library of all assets',
      mimeType: 'application/json',
    },
  ],
}))

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  if (request.params.uri === 'assets://catalog') {
    return {
      contents: [{ uri: request.params.uri, mimeType: 'application/json', text: JSON.stringify(assetLibrary, null, 2) }],
    }
  }
  throw new Error(`Unknown resource: ${request.params.uri}`)
})

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params
  try {
    switch (name) {
      case 'add_asset':
        return { content: [{ type: 'text', text: JSON.stringify(addAsset(args as any), null, 2) }] }
      case 'search_assets':
        return { content: [{ type: 'text', text: JSON.stringify(searchAssets(args as any), null, 2) }] }
      case 'optimize_asset':
        return { content: [{ type: 'text', text: JSON.stringify({ success: true, message: 'Asset optimization simulated' }, null, 2) }] }
      case 'generate_variants':
        return { content: [{ type: 'text', text: JSON.stringify(generateVariants(args as any), null, 2) }] }
      default:
        throw new Error(`Unknown tool: ${name}`)
    }
  } catch (error) {
    return { content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : String(error)}` }], isError: true }
  }
})

function addAsset(params: { filePath: string; metadata?: Record<string, any>; tags?: string[] }) {
  const { filePath, metadata = {}, tags = [] } = params
  if (!fs.existsSync(filePath)) throw new Error(`File not found: ${filePath}`)

  const stat = fs.statSync(filePath)
  const asset: Asset = {
    id: crypto.randomUUID(),
    name: path.basename(filePath),
    type: path.extname(filePath).slice(1),
    path: filePath,
    size: stat.size,
    metadata,
    createdAt: new Date().toISOString(),
    tags,
  }

  assetLibrary.push(asset)
  return { success: true, asset }
}

function searchAssets(params: { query?: string; filters?: { type?: string; tags?: string[] } }) {
  const { query, filters } = params
  let results = [...assetLibrary]

  if (query) {
    results = results.filter((a) => a.name.toLowerCase().includes(query.toLowerCase()) || a.tags.some((t) => t.toLowerCase().includes(query.toLowerCase())))
  }

  if (filters?.type) {
    results = results.filter((a) => a.type === filters.type)
  }

  if (filters?.tags) {
    results = results.filter((a) => filters.tags!.some((t) => a.tags.includes(t)))
  }

  return { success: true, results, total: results.length }
}

function generateVariants(params: { assetId: string; sizes: Array<{ width: number; height: number; name: string }> }) {
  const asset = assetLibrary.find((a) => a.id === params.assetId)
  if (!asset) throw new Error('Asset not found')

  const variants = params.sizes.map((size) => ({
    id: crypto.randomUUID(),
    name: `${asset.name}-${size.name}`,
    width: size.width,
    height: size.height,
    originalId: asset.id,
  }))

  return { success: true, variants, total: variants.length }
}

async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
  console.error('asset-library-mcp running on stdio')
}

main().catch((error) => {
  console.error('Server error:', error)
  process.exit(1)
})
