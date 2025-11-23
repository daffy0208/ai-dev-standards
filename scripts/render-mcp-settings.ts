#!/usr/bin/env tsx

/**
 * Render MCP Settings
 *
 * Renders .claude/mcp-settings.json from template with environment-specific paths.
 * Automatically generates MCP entries from mcp-registry.json.
 *
 * Usage: npm run mcp:render
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT = path.resolve(__dirname, '..')

// Color codes
const GREEN = '\x1b[32m'
const YELLOW = '\x1b[33m'
const BLUE = '\x1b[34m'
const RED = '\x1b[31m'
const RESET = '\x1b[0m'

/**
 * Detect environment and get root path
 */
function getAIDevRoot(): string {
  // 1. Explicit environment variable
  if (process.env.AI_DEV_STANDARDS_ROOT) {
    return process.env.AI_DEV_STANDARDS_ROOT
  }

  // 2. CI environment (GitHub Actions)
  if (process.env.GITHUB_WORKSPACE) {
    return process.env.GITHUB_WORKSPACE
  }

  // 3. Local development - use current working directory
  return ROOT
}

/**
 * Render template with variables
 */
function renderTemplate(template: string, vars: Record<string, string>): string {
  let result = template

  for (const [key, value] of Object.entries(vars)) {
    const regex = new RegExp(`{{${key}}}`, 'g')
    result = result.replace(regex, value)
  }

  return result
}

/**
 * Generate MCP server configuration from registry
 */
function generateMCPConfig(mcpId: string, aiDevRoot: string): any {
  // Most MCPs follow this pattern
  return {
    command: 'node',
    args: [`${aiDevRoot}/MCP-SERVERS/${mcpId}/dist/index.js`],
    env: {
      AI_DEV_STANDARDS_ROOT: aiDevRoot
    }
  }
}

/**
 * Main execution
 */
function main(): void {
  console.log(`\n${GREEN}🔧 AI Dev Standards - MCP Settings Renderer${RESET}\n`)

  try {
    const aiDevRoot = getAIDevRoot()

    console.log(`${BLUE}📍 Detected paths:${RESET}`)
    console.log(`   AI_DEV_STANDARDS_ROOT: ${aiDevRoot}`)
    console.log()

    // Load template
    const templatePath = path.join(ROOT, '.claude', 'mcp-settings.template.json')

    if (!fs.existsSync(templatePath)) {
      console.error(`${RED}❌ Template not found: ${templatePath}${RESET}`)
      process.exit(1)
    }

    const templateContent = fs.readFileSync(templatePath, 'utf-8')

    // Render template
    const vars = {
      AI_DEV_ROOT: aiDevRoot
<<<<<<< HEAD
    }

    const renderedContent = renderTemplate(templateContent, vars)
    const settings = JSON.parse(renderedContent)
=======
    };
    
    const renderedContent = renderTemplate(templateContent, vars);
    const settings = JSON.parse(renderedContent);
>>>>>>> origin/main

    // Load MCP registry to auto-generate additional entries
    const mcpRegistryPath = path.join(ROOT, 'META', 'mcp-registry.json')

    if (fs.existsSync(mcpRegistryPath)) {
      const mcpRegistry = JSON.parse(fs.readFileSync(mcpRegistryPath, 'utf-8'))
      const mcps = mcpRegistry.mcps || []

      console.log(`${BLUE}📦 Generating MCP entries from registry (${mcps.length} MCPs)${RESET}`)

      // Only add MCPs that aren't already in the template
      const existingMCPs = new Set(Object.keys(settings.mcpServers || {}))

      for (const mcp of mcps) {
        if (!existingMCPs.has(mcp.id)) {
          // Check if the MCP has a built dist/index.js
          const mcpPath = path.join(ROOT, 'MCP-SERVERS', mcp.id, 'dist', 'index.js')

          if (fs.existsSync(mcpPath)) {
            settings.mcpServers[mcp.id] = generateMCPConfig(mcp.id, aiDevRoot)
            console.log(`   ${GREEN}✓${RESET} Added ${mcp.id}`)
          } else {
            console.log(`   ${YELLOW}⊘${RESET} Skipped ${mcp.id} (not built)`)
          }
        }
      }
    }

    // Write rendered settings
    const outputPath = path.join(ROOT, '.claude', 'mcp-settings.json')
    fs.writeFileSync(outputPath, JSON.stringify(settings, null, 2) + '\n')

    console.log()
    console.log(`${GREEN}✅ MCP settings rendered successfully!${RESET}`)
    console.log(`   Output: ${outputPath}`)
    console.log(`   ${Object.keys(settings.mcpServers).length} MCP servers configured`)
    console.log()
  } catch (error) {
    console.error(`${RED}❌ Error rendering MCP settings:${RESET}`, error)
    process.exit(1)
  }
}

main()
