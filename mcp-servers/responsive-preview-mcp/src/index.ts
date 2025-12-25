#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema
} from '@modelcontextprotocol/sdk/types.js'

interface DevicePreset {
  name: string
  width: number
  height: number
  category: string
  userAgent?: string
}

const devicePresets: DevicePreset[] = [
  { name: 'iPhone SE', width: 375, height: 667, category: 'mobile' },
  { name: 'iPhone 12/13/14', width: 390, height: 844, category: 'mobile' },
  { name: 'iPhone 14 Pro Max', width: 430, height: 932, category: 'mobile' },
  { name: 'Samsung Galaxy S21', width: 360, height: 800, category: 'mobile' },
  { name: 'iPad Mini', width: 768, height: 1024, category: 'tablet' },
  { name: 'iPad Pro 11"', width: 834, height: 1194, category: 'tablet' },
  { name: 'iPad Pro 12.9"', width: 1024, height: 1366, category: 'tablet' },
  { name: 'MacBook Air', width: 1280, height: 800, category: 'desktop' },
  { name: 'MacBook Pro 14"', width: 1512, height: 982, category: 'desktop' },
  { name: 'MacBook Pro 16"', width: 1728, height: 1117, category: 'desktop' },
  { name: 'Desktop HD', width: 1920, height: 1080, category: 'desktop' },
  { name: 'Desktop 4K', width: 3840, height: 2160, category: 'desktop' }
]

const server = new Server(
  { name: 'responsive-preview-mcp', version: '1.0.0' },
  { capabilities: { tools: {}, resources: {} } }
)

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'preview_at_breakpoint',
      description: 'Preview URL at specific breakpoint',
      inputSchema: {
        type: 'object',
        properties: {
          url: { type: 'string', description: 'URL to preview' },
          breakpoint: { type: 'string', description: 'Breakpoint name or device preset' },
          width: { type: 'number', description: 'Custom width (optional)' },
          height: { type: 'number', description: 'Custom height (optional)' }
        },
        required: ['url', 'breakpoint']
      }
    },
    {
      name: 'capture_all_breakpoints',
      description: 'Capture screenshots at all standard breakpoints',
      inputSchema: {
        type: 'object',
        properties: {
          url: { type: 'string', description: 'URL to capture' },
          breakpoints: {
            type: 'array',
            items: { type: 'string' },
            description: 'Breakpoint list (optional)'
          }
        },
        required: ['url']
      }
    },
    {
      name: 'compare_breakpoints',
      description: 'Compare two URLs side-by-side at breakpoints',
      inputSchema: {
        type: 'object',
        properties: {
          url1: { type: 'string', description: 'First URL' },
          url2: { type: 'string', description: 'Second URL' },
          breakpoint: { type: 'string', description: 'Breakpoint to compare' }
        },
        required: ['url1', 'url2', 'breakpoint']
      }
    }
  ]
}))

server.setRequestHandler(ListResourcesRequestSchema, async () => ({
  resources: [
    {
      uri: 'devices://presets',
      name: 'Device Presets',
      description: 'Common device sizes for responsive testing',
      mimeType: 'application/json'
    }
  ]
}))

server.setRequestHandler(ReadResourceRequestSchema, async request => {
  if (request.params.uri === 'devices://presets') {
    return {
      contents: [
        {
          uri: request.params.uri,
          mimeType: 'application/json',
          text: JSON.stringify({ devices: devicePresets }, null, 2)
        }
      ]
    }
  }
  throw new Error(`Unknown resource: ${request.params.uri}`)
})

server.setRequestHandler(CallToolRequestSchema, async request => {
  const { name, arguments: args } = request.params
  try {
    switch (name) {
      case 'preview_at_breakpoint':
        return {
          content: [
            { type: 'text', text: JSON.stringify(previewAtBreakpoint(args as any), null, 2) }
          ]
        }
      case 'capture_all_breakpoints':
        return {
          content: [
            { type: 'text', text: JSON.stringify(captureAllBreakpoints(args as any), null, 2) }
          ]
        }
      case 'compare_breakpoints':
        return {
          content: [
            { type: 'text', text: JSON.stringify(compareBreakpoints(args as any), null, 2) }
          ]
        }
      default:
        throw new Error(`Unknown tool: ${name}`)
    }
  } catch (error) {
    return {
      content: [
        { type: 'text', text: `Error: ${error instanceof Error ? error.message : String(error)}` }
      ],
      isError: true
    }
  }
})

function previewAtBreakpoint(params: {
  url: string
  breakpoint: string
  width?: number
  height?: number
}) {
  const { url, breakpoint, width, height } = params
  const device = devicePresets.find(d => d.name.toLowerCase() === breakpoint.toLowerCase())

  const dimensions = device
    ? { width: device.width, height: device.height, device: device.name }
    : { width: width || 1024, height: height || 768, device: 'Custom' }

  return {
    success: true,
    url,
    dimensions,
    message: `Preview simulated at ${dimensions.device} (${dimensions.width}x${dimensions.height})`,
    note: 'Use Playwright/Puppeteer for actual screenshot capture'
  }
}

function captureAllBreakpoints(params: { url: string; breakpoints?: string[] }) {
  const { url, breakpoints } = params
  const devicesToCapture = breakpoints
    ? devicePresets.filter(d => breakpoints.includes(d.name))
    : devicePresets.filter(d => ['mobile', 'tablet', 'desktop'].includes(d.category))

  const captures = devicesToCapture.map(device => ({
    device: device.name,
    width: device.width,
    height: device.height,
    category: device.category,
    status: 'simulated'
  }))

  return {
    success: true,
    url,
    captures,
    total: captures.length,
    note: 'Use Playwright/Puppeteer for actual screenshot capture'
  }
}

function compareBreakpoints(params: { url1: string; url2: string; breakpoint: string }) {
  const { url1, url2, breakpoint } = params
  const device = devicePresets.find(d => d.name.toLowerCase() === breakpoint.toLowerCase())

  if (!device) {
    throw new Error(`Device preset not found: ${breakpoint}`)
  }

  return {
    success: true,
    comparison: {
      url1,
      url2,
      device: device.name,
      dimensions: { width: device.width, height: device.height }
    },
    message: `Comparison simulated at ${device.name}`,
    note: 'Use Playwright/Puppeteer for actual visual comparison'
  }
}

async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
  console.error('responsive-preview-mcp running on stdio')
}

main().catch(error => {
  console.error('Server error:', error)
  process.exit(1)
})
