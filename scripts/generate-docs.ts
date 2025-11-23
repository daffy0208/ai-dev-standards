#!/usr/bin/env tsx

/**
 * Generate Documentation
 *
 * Automatically updates all documentation from registry data.
 * Uses AUTO-GEN markers to identify sections to update.
 *
 * Usage: npm run generate:docs
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

interface RegistryCounts {
  skills: number
  mcps: number
  tools: number
  components: number
  integrations: number
  total: number
  coverage?: string
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

  // Calculate coverage (MCPs / Skills)
  const coveragePercent = skills > 0 ? ((mcps / skills) * 100).toFixed(1) : '0.0'
  const coverage = `${coveragePercent}% (${mcps} MCPs / ${skills} Skills)`

  return {
    skills,
    mcps,
    tools,
    components,
    integrations,
    total,
    coverage
  }
}

/**
 * Update content between AUTO-GEN markers
 */
function updateAutoGenSection(content: string, marker: string, newValue: string): string {
  const startMarker = `<!-- AUTO-GEN:START:${marker} -->`
  const endMarker = `<!-- AUTO-GEN:END:${marker} -->`

  const regex = new RegExp(`${startMarker}[^]*?${endMarker}`, 'g')
  const replacement = `${startMarker}${newValue}${endMarker}`

  if (!content.includes(startMarker)) {
    console.warn(`${YELLOW}⚠️  Marker "${marker}" not found${RESET}`)
    return content
  }

  return content.replace(regex, replacement)
}

/**
 * Add AUTO-GEN markers to README.md if they don't exist
 */
function addMarkersToREADME(filePath: string, counts: RegistryCounts): void {
  let content = fs.readFileSync(filePath, 'utf-8')
  let modified = false

  // Add markers around key numbers
  const replacements = [
    // Line 19: "64 Specialized Skills"
    {
      search: /(\*\*)(\d+)(\s+Specialized Skills\*\*)/g,
      replace: `$1<!-- AUTO-GEN:START:skills -->$2<!-- AUTO-GEN:END:skills -->$3`
    },
    // Line 20: "50 MCP Servers"
    {
      search: /(\*\*)(\d+)(\s+MCP Servers\*\*)/g,
      replace: `$1<!-- AUTO-GEN:START:mcps -->$2<!-- AUTO-GEN:END:mcps -->$3`
    },
    // Line 22: "75 Reusable Components"
    {
      search: /(\*\*)(\d+)(\s+Reusable Components\*\*)/g,
      replace: `$1<!-- AUTO-GEN:START:components -->$2<!-- AUTO-GEN:END:components -->$3`
    },
    // Line 31: "198 resources"
    {
      search:
        /(\*\*)(\d+)(\s+resources\*\*\s+\(64 skills \+ 50 MCPs \+ 4 tools \+ 75 components \+ 5 integrations\))/g,
      replace: `$1<!-- AUTO-GEN:START:total-resources -->$2<!-- AUTO-GEN:END:total-resources -->$3`
    }
  ]

  for (const { search, replace } of replacements) {
    const newContent = content.replace(search, replace)
    if (newContent !== content) {
      content = newContent
      modified = true
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content)
    console.log(`${BLUE}📝 Added AUTO-GEN markers to README.md${RESET}`)
  }
}

/**
 * Update README.md
 */
function updateREADME(counts: RegistryCounts): void {
  console.log(`${BLUE}📝 Updating README.md${RESET}`)

  const filePath = path.join(ROOT, 'README.md')

  // First, add markers if they don't exist
  addMarkersToREADME(filePath, counts)

  let content = fs.readFileSync(filePath, 'utf-8')

  // Update all AUTO-GEN sections
  content = updateAutoGenSection(content, 'skills', counts.skills.toString())
  content = updateAutoGenSection(content, 'mcps', counts.mcps.toString())
  content = updateAutoGenSection(content, 'tools', counts.tools.toString())
  content = updateAutoGenSection(content, 'components', counts.components.toString())
  content = updateAutoGenSection(content, 'integrations', counts.integrations.toString())
  content = updateAutoGenSection(content, 'total-resources', counts.total.toString())

  if (counts.coverage) {
    content = updateAutoGenSection(content, 'coverage', counts.coverage)
  }

  fs.writeFileSync(filePath, content)

  console.log(`${GREEN}✅ Updated README.md${RESET}`)
}

/**
 * Add AUTO-GEN markers to INSTALL.md if they don't exist
 */
function addMarkersToINSTALL(filePath: string): void {
  const content = fs.readFileSync(filePath, 'utf-8')
  let modified = false

  // Add markers around skill count mentions
  const newContent = content.replace(/(\d+)\s+(skills?)/gi, (match, num, word) => {
    if (!match.includes('AUTO-GEN')) {
      modified = true
      return `<!-- AUTO-GEN:START:skills -->${num}<!-- AUTO-GEN:END:skills --> ${word}`
    }
    return match
  })

  if (modified) {
    fs.writeFileSync(filePath, newContent)
    console.log(`${BLUE}📝 Added AUTO-GEN markers to INSTALL.md${RESET}`)
  }
}

/**
 * Update INSTALL.md
 */
function updateINSTALL(counts: RegistryCounts): void {
  console.log(`${BLUE}📝 Updating INSTALL.md${RESET}`)

  const filePath = path.join(ROOT, 'INSTALL.md')

  if (!fs.existsSync(filePath)) {
    console.warn(`${YELLOW}⚠️  INSTALL.md not found${RESET}`)
    return
  }

  // Add markers first
  addMarkersToINSTALL(filePath)

  let content = fs.readFileSync(filePath, 'utf-8')

  // Update all AUTO-GEN sections
  content = updateAutoGenSection(content, 'skills', counts.skills.toString())
  content = updateAutoGenSection(content, 'mcps', counts.mcps.toString())
  content = updateAutoGenSection(content, 'total-resources', counts.total.toString())

  fs.writeFileSync(filePath, content)

  console.log(`${GREEN}✅ Updated INSTALL.md${RESET}`)
}

/**
 * Update INTEGRATION-USAGE.md
 */
function updateINTEGRATIONUSAGE(counts: RegistryCounts): void {
  console.log(`${BLUE}📝 Updating INTEGRATION-USAGE.md${RESET}`)

  const filePath = path.join(ROOT, 'INTEGRATION-USAGE.md')

  if (!fs.existsSync(filePath)) {
    console.warn(`${YELLOW}⚠️  INTEGRATION-USAGE.md not found${RESET}`)
    return
  }

  let content = fs.readFileSync(filePath, 'utf-8')

  // Update all AUTO-GEN sections
  content = updateAutoGenSection(content, 'skills', counts.skills.toString())
  content = updateAutoGenSection(content, 'mcps', counts.mcps.toString())
  content = updateAutoGenSection(content, 'components', counts.components.toString())
  content = updateAutoGenSection(content, 'integrations', counts.integrations.toString())
  content = updateAutoGenSection(content, 'tools', counts.tools.toString())
  content = updateAutoGenSection(content, 'total-resources', counts.total.toString())

  fs.writeFileSync(filePath, content)

  console.log(`${GREEN}✅ Updated INTEGRATION-USAGE.md${RESET}`)
}

/**
 * Update STANDALONE-USAGE.md
 */
function updateSTANDALONEUSAGE(counts: RegistryCounts): void {
  console.log(`${BLUE}📝 Updating STANDALONE-USAGE.md${RESET}`)

  const filePath = path.join(ROOT, 'STANDALONE-USAGE.md')

  if (!fs.existsSync(filePath)) {
    console.warn(`${YELLOW}⚠️  STANDALONE-USAGE.md not found${RESET}`)
    return
  }

  let content = fs.readFileSync(filePath, 'utf-8')

  // Update all AUTO-GEN sections
  content = updateAutoGenSection(content, 'skills', counts.skills.toString())
  content = updateAutoGenSection(content, 'mcps', counts.mcps.toString())
  content = updateAutoGenSection(content, 'components', counts.components.toString())
  content = updateAutoGenSection(content, 'integrations', counts.integrations.toString())

  fs.writeFileSync(filePath, content)

  console.log(`${GREEN}✅ Updated STANDALONE-USAGE.md${RESET}`)
}

/**
 * Update .claude/CLAUDE.md
 */
function updateCLAUDEMD(counts: RegistryCounts): void {
  console.log(`${BLUE}📝 Updating .claude/CLAUDE.md${RESET}`)

  const filePath = path.join(ROOT, '.claude', 'CLAUDE.md')

  if (!fs.existsSync(filePath)) {
    console.warn(`${YELLOW}⚠️  .claude/CLAUDE.md not found${RESET}`)
    return
  }

  let content = fs.readFileSync(filePath, 'utf-8')

  // Update all AUTO-GEN sections
  content = updateAutoGenSection(content, 'skills', counts.skills.toString())
  content = updateAutoGenSection(content, 'mcps', counts.mcps.toString())

  fs.writeFileSync(filePath, content)

  console.log(`${GREEN}✅ Updated .claude/CLAUDE.md${RESET}`)
}

/**
 * Update DOCS/INDEX.md
 */
function updateDOCSINDEX(counts: RegistryCounts): void {
  console.log(`${BLUE}📝 Updating DOCS/INDEX.md${RESET}`)

  const filePath = path.join(ROOT, 'DOCS', 'INDEX.md')

  if (!fs.existsSync(filePath)) {
    console.warn(`${YELLOW}⚠️  DOCS/INDEX.md not found${RESET}`)
    return
  }

  let content = fs.readFileSync(filePath, 'utf-8')

  // Update all AUTO-GEN sections
  content = updateAutoGenSection(content, 'skills', counts.skills.toString())
  content = updateAutoGenSection(content, 'mcps', counts.mcps.toString())
  content = updateAutoGenSection(content, 'total-resources', counts.total.toString())

  fs.writeFileSync(filePath, content)

  console.log(`${GREEN}✅ Updated DOCS/INDEX.md${RESET}`)
}

/**
 * Update FINAL-RESOURCE-COUNTS.md
 */
function updateFINALRESOURCECOUNTS(counts: RegistryCounts): void {
  console.log(`${BLUE}📝 Updating FINAL-RESOURCE-COUNTS.md${RESET}`)

  const candidatePaths = [
    path.join(ROOT, 'STATUS-REPORTS', 'FINAL-RESOURCE-COUNTS.md'),
    path.join(ROOT, 'FINAL-RESOURCE-COUNTS.md')
  ]

  const filePath = candidatePaths.find(fs.existsSync)

  if (!filePath) {
    console.log(
      `${YELLOW}ℹ️  FINAL-RESOURCE-COUNTS.md not found in active locations; skipping${RESET}`
    )
    return
  }

  let content = fs.readFileSync(filePath, 'utf-8')

  // Update all AUTO-GEN sections
  content = updateAutoGenSection(content, 'skills', counts.skills.toString())
  content = updateAutoGenSection(content, 'mcps', counts.mcps.toString())
  content = updateAutoGenSection(content, 'tools', counts.tools.toString())
  content = updateAutoGenSection(content, 'components', counts.components.toString())
  content = updateAutoGenSection(content, 'integrations', counts.integrations.toString())
  content = updateAutoGenSection(content, 'total-resources', counts.total.toString())

  fs.writeFileSync(filePath, content)

  console.log(`${GREEN}✅ Updated FINAL-RESOURCE-COUNTS.md${RESET}`)
}

/**
 * Main execution
 */
function main(): void {
  console.log(`\n${GREEN}🚀 AI Dev Standards - Documentation Generator${RESET}\n`)
  console.log(`${BLUE}Loading registry data...${RESET}\n`)

  try {
    const counts = loadRegistryCounts()

    console.log(`${BLUE}📊 Current counts:${RESET}`)
    console.log(`   Skills: ${counts.skills}`)
    console.log(`   MCPs: ${counts.mcps}`)
    console.log(`   Tools: ${counts.tools}`)
    console.log(`   Components: ${counts.components}`)
    console.log(`   Integrations: ${counts.integrations}`)
    console.log(`   ${GREEN}Total: ${counts.total} resources${RESET}`)
    if (counts.coverage) {
      console.log(`   Coverage: ${counts.coverage}`)
    }
    console.log()

    // Update all documentation files
    updateREADME(counts)
    updateINSTALL(counts)
    updateINTEGRATIONUSAGE(counts)
    updateSTANDALONEUSAGE(counts)
    updateCLAUDEMD(counts)
    updateDOCSINDEX(counts)
    updateFINALRESOURCECOUNTS(counts)

    console.log(`\n${GREEN}✅ All documentation updated successfully!${RESET}\n`)
  } catch (error) {
    console.error(`${RED}❌ Error generating documentation:${RESET}`, error)
    process.exit(1)
  }
}

main()
