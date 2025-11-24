#!/usr/bin/env tsx

/**
 * Validate MCP Settings
 *
 * Validates that all paths in mcp-settings.json exist and are accessible.
 * Checks that required MCP servers are configured.
 *
 * Usage: npm run mcp:validate
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

interface ValidationResult {
  passed: boolean
  errors: string[]
  warnings: string[]
}

/**
 * Validate MCP settings file
 */
function validateMCPSettings(): ValidationResult {
  const result: ValidationResult = {
    passed: true,
    errors: [],
    warnings: []
  }

  const settingsPath = path.join(ROOT, '.claude', 'mcp-settings.json')

  if (!fs.existsSync(settingsPath)) {
    result.errors.push('mcp-settings.json does not exist - run: npm run mcp:render')
    result.passed = false
    return result
  }

  let settings: any
  try {
    settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'))
  } catch (e) {
    result.errors.push(`mcp-settings.json is not valid JSON: ${e}`)
    result.passed = false
    return result
  }

  if (!settings.mcpServers || typeof settings.mcpServers !== 'object') {
    result.errors.push('mcp-settings.json missing "mcpServers" object')
    result.passed = false
    return result
  }

  const mcpCount = Object.keys(settings.mcpServers).length
  console.log(`${BLUE}📦 Validating ${mcpCount} MCP server(s)${RESET}\n`)

  for (const [mcpId, config] of Object.entries(settings.mcpServers)) {
    const mcpConfig = config as any

    // Check command
    if (!mcpConfig.command) {
      result.errors.push(`${mcpId}: Missing "command" field`)
      result.passed = false
      continue
    }

    // Check args
    if (!mcpConfig.args || !Array.isArray(mcpConfig.args)) {
      result.errors.push(`${mcpId}: Missing or invalid "args" array`)
      result.passed = false
      continue
    }

    // Validate file paths in args
    for (const arg of mcpConfig.args) {
      if (typeof arg === 'string' && (arg.endsWith('.js') || arg.endsWith('.ts'))) {
        // Check if path exists
        if (!fs.existsSync(arg)) {
          result.errors.push(`${mcpId}: File not found: ${arg}`)
          result.passed = false
        } else {
          console.log(`   ${GREEN}✓${RESET} ${mcpId}: ${arg}`)
        }
      }
    }

    // Check for environment variables if specified
    if (mcpConfig.env) {
      for (const [envKey, envValue] of Object.entries(mcpConfig.env)) {
        if (typeof envValue === 'string' && envValue.includes('/')) {
          // Looks like a path - validate it exists
          if (!fs.existsSync(envValue)) {
            result.warnings.push(`${mcpId}: Environment path not found: ${envKey}=${envValue}`)
          }
        }
      }
    }
  }

  return result
}

/**
 * Check for required MCPs
 */
function checkRequiredMCPs(): ValidationResult {
  const result: ValidationResult = {
    passed: true,
    errors: [],
    warnings: []
  }

  const settingsPath = path.join(ROOT, '.claude', 'mcp-settings.json')
  const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'))

  // brain-mcp is required for orchestration
  if (!settings.mcpServers['brain-mcp']) {
    result.warnings.push('brain-mcp is not configured (recommended for orchestration)')
  }

  return result
}

/**
 * Main execution
 */
function main(): void {
  console.log(`\n${GREEN}🔍 AI Dev Standards - MCP Settings Validator${RESET}\n`)

  try {
    const settingsResult = validateMCPSettings()
    const requiredResult = checkRequiredMCPs()

    // Collect all errors and warnings
    const allErrors = [...settingsResult.errors, ...requiredResult.errors]
    const allWarnings = [...settingsResult.warnings, ...requiredResult.warnings]

    // Print summary
    console.log(`\n${BLUE}📊 Validation Summary:${RESET}\n`)

    if (allErrors.length > 0) {
      console.log(`${RED}❌ Errors (${allErrors.length}):${RESET}`)
      for (const error of allErrors) {
        console.log(`   ${RED}✗${RESET} ${error}`)
      }
    }

    if (allWarnings.length > 0) {
      console.log(`\n${YELLOW}⚠️  Warnings (${allWarnings.length}):${RESET}`)
      for (const warning of allWarnings) {
        console.log(`   ${YELLOW}!${RESET} ${warning}`)
      }
    }

    if (allErrors.length === 0) {
      console.log(`${GREEN}✅ MCP settings are valid!${RESET}`)

      if (allWarnings.length > 0) {
        console.log(`${YELLOW}   (${allWarnings.length} warnings)${RESET}`)
      }

      console.log()
      process.exit(0)
    } else {
      console.log(`\n${RED}❌ Validation failed with ${allErrors.length} error(s)${RESET}`)
      console.log(`\n${BLUE}To fix, run:${RESET} npm run mcp:render\n`)
      process.exit(1)
    }
  } catch (error) {
    console.error(`${RED}❌ Error validating MCP settings:${RESET}`, error)
    process.exit(1)
  }
}

main()
