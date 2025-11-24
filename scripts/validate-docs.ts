#!/usr/bin/env tsx

/**
 * Validate Documentation
 *
 * Checks that all documentation is in sync with registry data.
 * Validates that AUTO-GEN markers exist and contain correct values.
 *
 * Usage: npm run validate:docs
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
const RED = '\x1b[31m'
const BLUE = '\x1b[34m'
const RESET = '\x1b[0m'

interface ValidationResult {
  passed: boolean
  errors: string[]
  warnings: string[]
}

interface RegistryCounts {
  skills: number
  mcps: number
  tools: number
  components: number
  integrations: number
  total: number
}

/**
 * Load all registry counts
 */
function loadRegistryCounts(): RegistryCounts {
  const skillRegistry = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'META', 'skill-registry.json'), 'utf-8')
  )
  const mcpRegistry = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'META', 'mcp-registry.json'), 'utf-8')
  )
  const toolRegistry = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'META', 'tool-registry.json'), 'utf-8')
  )
  const componentRegistry = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'META', 'component-registry.json'), 'utf-8')
  )
  const integrationRegistry = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'META', 'integration-registry.json'), 'utf-8')
  )

  const skills = skillRegistry.total_skills || skillRegistry.skills?.length || 0
  const mcps = mcpRegistry.total_mcps || mcpRegistry.mcps?.length || 0
  const tools = toolRegistry.total_tools || toolRegistry.tools?.length || 0
  const components = componentRegistry.total_components || componentRegistry.components?.length || 0
  const integrations =
    integrationRegistry.total_integrations || integrationRegistry.integrations?.length || 0

  const total = skills + mcps + tools + components + integrations

  return {
    skills,
    mcps,
    tools,
    components,
    integrations,
    total
  }
}

/**
 * Extract value from AUTO-GEN marker
 */
function extractAutoGenValue(content: string, marker: string): string | null {
  const startMarker = `<!-- AUTO-GEN:START:${marker} -->`
  const endMarker = `<!-- AUTO-GEN:END:${marker} -->`

  const regex = new RegExp(`${startMarker}([^]*?)${endMarker}`)
  const match = content.match(regex)

  return match ? match[1].trim() : null
}

/**
 * Validate a documentation file
 */
function validateDocFile(
  filePath: string,
  fileName: string,
  requiredMarkers: string[],
  counts: RegistryCounts
): ValidationResult {
  console.log(`${BLUE}📝 Validating ${fileName}${RESET}`)

  const result: ValidationResult = {
    passed: true,
    errors: [],
    warnings: []
  }

  if (!fs.existsSync(filePath)) {
    result.errors.push(`${fileName} does not exist`)
    result.passed = false
    return result
  }

  const content = fs.readFileSync(filePath, 'utf-8')

  // Check for required markers
  for (const marker of requiredMarkers) {
    const value = extractAutoGenValue(content, marker)

    if (value === null) {
      result.warnings.push(`${fileName} missing AUTO-GEN marker: ${marker}`)
      continue
    }

    // Validate value matches registry
    const expectedValue = (counts as any)[marker]
    if (expectedValue !== undefined && value !== expectedValue.toString()) {
      result.errors.push(
        `${fileName} AUTO-GEN:${marker} has value "${value}" but should be "${expectedValue}"`
      )
      result.passed = false
    }
  }

  if (result.passed && result.warnings.length === 0) {
    console.log(`${GREEN}✅ ${fileName} is valid${RESET}`)
  }

  return result
}

/**
 * Main execution
 */
function main(): void {
  console.log(`\n${GREEN}🔍 AI Dev Standards - Documentation Validator${RESET}\n`)

  try {
    const counts = loadRegistryCounts()

    console.log(`${BLUE}📊 Registry counts:${RESET}`)
    console.log(`   Skills: ${counts.skills}`)
    console.log(`   MCPs: ${counts.mcps}`)
    console.log(`   Tools: ${counts.tools}`)
    console.log(`   Components: ${counts.components}`)
    console.log(`   Integrations: ${counts.integrations}`)
    console.log(`   ${GREEN}Total: ${counts.total} resources${RESET}`)
    console.log()

    // Validate all documentation files
    const results: ValidationResult[] = []

    results.push(
      validateDocFile(
        path.join(ROOT, 'README.md'),
        'README.md',
        ['skills', 'mcps', 'components', 'total'],
        counts
      )
    )

    results.push(validateDocFile(path.join(ROOT, 'INSTALL.md'), 'INSTALL.md', ['skills'], counts))

    results.push(
      validateDocFile(
        path.join(ROOT, 'INTEGRATION-USAGE.md'),
        'INTEGRATION-USAGE.md',
        ['skills', 'mcps'],
        counts
      )
    )

    results.push(
      validateDocFile(
        path.join(ROOT, 'STANDALONE-USAGE.md'),
        'STANDALONE-USAGE.md',
        ['skills', 'mcps'],
        counts
      )
    )

    results.push(
      validateDocFile(
        path.join(ROOT, '.claude', 'CLAUDE.md'),
        '.claude/CLAUDE.md',
        ['skills', 'mcps'],
        counts
      )
    )

    results.push(
      validateDocFile(
        path.join(ROOT, 'DOCS', 'INDEX.md'),
        'DOCS/INDEX.md',
        ['skills', 'mcps', 'total'],
        counts
      )
    )

    results.push(
      validateDocFile(
        path.join(ROOT, 'FINAL-RESOURCE-COUNTS.md'),
        'FINAL-RESOURCE-COUNTS.md',
        ['skills', 'mcps', 'tools', 'components', 'integrations', 'total'],
        counts
      )
    )

    // Collect all errors and warnings
    const allErrors: string[] = []
    const allWarnings: string[] = []

    for (const result of results) {
      allErrors.push(...result.errors)
      allWarnings.push(...result.warnings)
    }

    // Print summary
    console.log(`\n${BLUE}📊 Validation Summary:${RESET}`)

    if (allErrors.length > 0) {
      console.log(`\n${RED}❌ Errors (${allErrors.length}):${RESET}`)
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
      console.log(`\n${GREEN}✅ All documentation is in sync!${RESET}`)

      if (allWarnings.length > 0) {
        console.log(
          `${YELLOW}   (${allWarnings.length} warnings - some files missing AUTO-GEN markers)${RESET}`
        )
        console.log(`\n${BLUE}To add markers, run:${RESET} npm run generate:docs\n`)
      } else {
        console.log()
      }

      process.exit(0)
    } else {
      console.log(`\n${RED}❌ Validation failed with ${allErrors.length} error(s)${RESET}`)
      console.log(`\n${BLUE}To fix, run:${RESET} npm run generate:docs\n`)
      process.exit(1)
    }
  } catch (error) {
    console.error(`${RED}❌ Error validating documentation:${RESET}`, error)
    process.exit(1)
  }
}

main()
