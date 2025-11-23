#!/usr/bin/env tsx

/**
 * Generate Registries
 *
 * Automatically scans directories and regenerates all registries.
 * This is the ONLY way to update registry files - manual edits will be overwritten.
 *
 * Usage: npm run generate:registries
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT = path.resolve(__dirname, '..')

// Color codes for output
const GREEN = '\x1b[32m'
const YELLOW = '\x1b[33m'
const BLUE = '\x1b[34m'
const RED = '\x1b[31m'
const RESET = '\x1b[0m'

interface SkillMetadata {
  name: string
  description: string
  triggers: string[]
  tags: string[]
  category: string
  difficulty: string
  estimated_time: string
  path: string
  status: string
  prerequisites: string[]
  related_skills: string[]
  frameworks: string[]
  languages: string[]
  mcp_tools?: string[]
}

interface MCPMetadata {
  id: string
  name: string
  description: string
  category: string
  supports_skills: string[]
  features: string[]
  path: string
  status: string
  phase?: number
  capabilities?: string[]
}

interface ToolMetadata {
  id: string
  name: string
  category: string
  description: string
  path: string
  status: string
  language: string
  framework: string
  supports_skills: string[]
  supports_mcps: string[]
  features: string[]
  depends_on: string[]
}

interface ComponentMetadata {
  id: string
  name: string
  category: string
  description: string
  path: string
  status: string
  language: string
  framework: string
  supports_skills: string[]
  supports_mcps: string[]
  depends_on: string[]
  features: string[]
}

interface IntegrationMetadata {
  id: string
  name: string
  category: string
  description: string
  path: string
  status: string
  supports_skills: string[]
  supports_mcps: string[]
  depends_on: string[]
  features: string[]
  authentication: string
  documentation_url: string
}

/**
 * Extract metadata from SKILL.md frontmatter
 */
function extractSkillMetadata(skillName: string): SkillMetadata | null {
  const skillPath = path.join(ROOT, 'SKILLS', skillName, 'SKILL.md')

  if (!fs.existsSync(skillPath)) {
    console.warn(`${YELLOW}⚠️  No SKILL.md found for ${skillName}${RESET}`)
    return null
  }

  const content = fs.readFileSync(skillPath, 'utf-8')

  // Extract YAML frontmatter
  const frontmatterMatch = content.match(/^---\n([\s\S]+?)\n---/)
  if (!frontmatterMatch) {
    console.warn(`${YELLOW}⚠️  No frontmatter in SKILL.md for ${skillName}${RESET}`)
    return null
  }

  const frontmatter = frontmatterMatch[1]

  // Extract fields
  const name = frontmatter.match(/^name:\s*(.+)$/m)?.[1]?.trim() || skillName
  const description =
    frontmatter.match(/^description:\s*(.+)$/m)?.[1]?.trim() ||
    `Expert in ${skillName.replace(/-/g, ' ')}`
  const category = frontmatter.match(/^category:\s*(.+)$/m)?.[1]?.trim() || 'specialized'
  const difficulty = frontmatter.match(/^difficulty:\s*(.+)$/m)?.[1]?.trim() || 'intermediate'
  const estimatedTime = frontmatter.match(/^estimated_time:\s*(.+)$/m)?.[1]?.trim() || '1-3 hours'

  // Extract triggers (multi-line array)
  const triggersMatch = frontmatter.match(/triggers:\s*\n((?:\s*-\s*.+\n?)+)/)
  const triggers = triggersMatch
    ? triggersMatch[1]
        .split('\n')
        .map(line => line.trim().replace(/^-\s*/, ''))
        .filter(Boolean)
    : [skillName, skillName.replace(/-/g, ' ')]

  // Extract tags (multi-line array)
  const tagsMatch = frontmatter.match(/tags:\s*\n((?:\s*-\s*.+\n?)+)/)
  const tags = tagsMatch
    ? tagsMatch[1]
        .split('\n')
        .map(line => line.trim().replace(/^-\s*/, ''))
        .filter(Boolean)
    : [category]

  // Extract MCP tools if present
  const mcpToolsMatch = frontmatter.match(/mcp-tools:\s*\n((?:\s*-\s*.+\n?)+)/)
  const mcpTools = mcpToolsMatch
    ? mcpToolsMatch[1]
        .split('\n')
        .map(line => line.trim().replace(/^-\s*/, ''))
        .filter(Boolean)
    : undefined

  return {
    name: skillName,
    description,
    triggers,
    tags,
    category,
    difficulty,
    estimated_time: estimatedTime,
    path: `/SKILLS/${skillName}/`,
    status: 'active',
    prerequisites: [],
    related_skills: [],
    frameworks: ['all'],
    languages: ['all'],
    ...(mcpTools && mcpTools.length > 0 ? { mcp_tools: mcpTools } : {})
  }
}

/**
 * Generate skill-registry.json
 */
function generateSkillRegistry(): void {
  console.log(`${BLUE}🔄 Generating skill-registry.json${RESET}`)

  const skillsDir = path.join(ROOT, 'SKILLS')
  const skillDirs = fs
    .readdirSync(skillsDir)
    .filter(dir => {
      const stat = fs.statSync(path.join(skillsDir, dir))
      return stat.isDirectory() && dir !== '_TEMPLATE'
    })
    .sort()

  const skills: SkillMetadata[] = []

  for (const skillName of skillDirs) {
    const metadata = extractSkillMetadata(skillName)
    if (metadata) {
      skills.push(metadata)
    }
  }

  const registry = {
    version: '3.33.0',
    last_updated: new Date().toISOString().split('T')[0],
    description: `Registry of all available skills in ai-dev-standards. Skills are model-invoked capabilities that Claude activates based on context. Now includes ${skills.length} active skills covering product development, AI systems, technical implementation, infrastructure, UX design, ADHD support, repository analysis, project management, data forensics, automated code review workflows, design automation, API integrations, customer support, growth experimentation, pricing strategy, product analytics, release management, usability testing, business model architecture, framework orchestration, requirements generation, quality assurance, security architecture, and orchestration meta-skills.`,
    total_skills: skills.length,
    skills
  }

  const outputPath = path.join(ROOT, 'META', 'skill-registry.json')
  fs.writeFileSync(outputPath, JSON.stringify(registry, null, 2) + '\n')

  console.log(`${GREEN}✅ Generated skill-registry.json: ${skills.length} skills${RESET}`)
}

/**
 * Extract MCP metadata from package.json and README.md
 */
function extractMCPMetadata(mcpName: string): MCPMetadata | null {
  const mcpDir = path.join(ROOT, 'MCP-SERVERS', mcpName)
  const packageJsonPath = path.join(mcpDir, 'package.json')
  const readmePath = path.join(mcpDir, 'README.md')

  if (!fs.existsSync(mcpDir)) {
    return null
  }

  let description = `MCP server for ${mcpName.replace(/-mcp$/, '')}`
  let name = mcpName
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')

  // Try to get description from README.md
  if (fs.existsSync(readmePath)) {
    const readme = fs.readFileSync(readmePath, 'utf-8')
    const descMatch = readme.match(/^#\s+(.+)$/m)
    if (descMatch) {
      name = descMatch[1].trim()
    }
    const summaryMatch = readme.match(/^>\s+(.+)$/m)
    if (summaryMatch) {
      description = summaryMatch[1].trim()
    }
  }

  // Try to get description from package.json
  if (fs.existsSync(packageJsonPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'))
      if (pkg.description) {
        description = pkg.description
      }
      if (pkg.name) {
        name =
          pkg.name
            .replace(/-mcp$/, '')
            .split('-')
            .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' ') + ' MCP'
      }
    } catch (e) {
      // Ignore JSON parse errors
    }
  }

  return {
    id: mcpName,
    name,
    description,
    category: 'general',
    supports_skills: [],
    features: ['tools'],
    path: `/MCP-SERVERS/${mcpName}`,
    status: 'active',
    phase: 5
  }
}

/**
 * Generate mcp-registry.json
 */
function generateMCPRegistry(): void {
  console.log(`${BLUE}🔄 Generating mcp-registry.json${RESET}`)

  const mcpDir = path.join(ROOT, 'MCP-SERVERS')
  const mcpDirs = fs
    .readdirSync(mcpDir)
    .filter(dir => {
      const stat = fs.statSync(path.join(mcpDir, dir))
      return stat.isDirectory()
    })
    .sort()

  const mcps: MCPMetadata[] = []

  for (const mcpName of mcpDirs) {
    const metadata = extractMCPMetadata(mcpName)
    if (metadata) {
      mcps.push(metadata)
    }
  }

  const registry = {
    version: '1.0.3',
    last_updated: new Date().toISOString().split('T')[0],
    description:
      'Registry of all MCP servers in ai-dev-standards. MCPs (Model Context Protocol servers) provide tools, resources, and prompts that skills can use to execute tasks.',
    total_mcps: mcps.length,
    coverage: `Coverage tracked via relationship-mapping.json`,
    mcps
  }

  const outputPath = path.join(ROOT, 'META', 'mcp-registry.json')
  fs.writeFileSync(outputPath, JSON.stringify(registry, null, 2) + '\n')

  console.log(`${GREEN}✅ Generated mcp-registry.json: ${mcps.length} MCPs${RESET}`)
}

/**
 * Generate tool-registry.json
 */
function generateToolRegistry(): void {
  console.log(`${BLUE}🔄 Generating tool-registry.json (counting only)${RESET}`)

  const toolsDir = path.join(ROOT, 'TOOLS')

  // Count all tool files (not just directories)
  let toolCount = 0
  const categories = [
    'custom-tools',
    'crewai-tools',
    'langchain-tools',
    'mcp-tools',
    'observability',
    'media-tools',
    'design-tools'
  ]

  for (const category of categories) {
    const categoryPath = path.join(toolsDir, category)
    if (fs.existsSync(categoryPath)) {
      const files = fs
        .readdirSync(categoryPath)
        .filter(f => f.endsWith('.ts') && !f.includes('test'))
      toolCount += files.length
    }
  }

  console.log(`${GREEN}✅ Counted tools: ${toolCount} tools${RESET}`)
  console.log(
    `${YELLOW}   Note: tool-registry.json is manually maintained with detailed metadata${RESET}`
  )
}

/**
 * Generate component-registry.json (count only)
 */
function generateComponentRegistry(): void {
  console.log(`${BLUE}🔄 Generating component-registry.json (counting only)${RESET}`)

  const componentsDir = path.join(ROOT, 'COMPONENTS')

  // Count component files
  let componentCount = 0
  function countComponents(dir: string) {
    const items = fs.readdirSync(dir)
    for (const item of items) {
      const fullPath = path.join(dir, item)
      const stat = fs.statSync(fullPath)
      if (stat.isDirectory()) {
        countComponents(fullPath)
      } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
        if (!item.includes('.test.') && !item.includes('.spec.')) {
          componentCount++
        }
      }
    }
  }

  countComponents(componentsDir)

  console.log(`${GREEN}✅ Counted components: ${componentCount} components${RESET}`)
  console.log(
    `${YELLOW}   Note: component-registry.json is manually maintained with detailed metadata${RESET}`
  )
}

/**
 * Generate integration-registry.json (count only)
 */
function generateIntegrationRegistry(): void {
  console.log(`${BLUE}🔄 Generating integration-registry.json (counting only)${RESET}`)

  const integrationsDir = path.join(ROOT, 'INTEGRATIONS')

  // Count integration files
  let integrationCount = 0
  function countIntegrations(dir: string) {
    if (!fs.existsSync(dir)) return
    const items = fs.readdirSync(dir)
    for (const item of items) {
      const fullPath = path.join(dir, item)
      const stat = fs.statSync(fullPath)
      if (stat.isDirectory()) {
        countIntegrations(fullPath)
      } else if (item.endsWith('.ts') && !item.includes('.test.') && !item.includes('.spec.')) {
        integrationCount++
      }
    }
  }

  countIntegrations(integrationsDir)

  console.log(`${GREEN}✅ Counted integrations: ${integrationCount} integrations${RESET}`)
  console.log(
    `${YELLOW}   Note: integration-registry.json is manually maintained with detailed metadata${RESET}`
  )
}

/**
 * Main execution
 */
function main(): void {
  console.log(`\n${GREEN}🚀 AI Dev Standards - Registry Generator${RESET}\n`)
  console.log(`${BLUE}Scanning directories and generating registries...${RESET}\n`)

  try {
    generateSkillRegistry()
    generateMCPRegistry()
    generateToolRegistry()
    generateComponentRegistry()
    generateIntegrationRegistry()

    console.log(`\n${GREEN}✅ All registries generated successfully!${RESET}\n`)

    // Print summary
    const skillRegistry = JSON.parse(
      fs.readFileSync(path.join(ROOT, 'META', 'skill-registry.json'), 'utf-8')
    )
    const mcpRegistry = JSON.parse(
      fs.readFileSync(path.join(ROOT, 'META', 'mcp-registry.json'), 'utf-8')
    )

    console.log(`${BLUE}📊 Summary:${RESET}`)
    console.log(`   Skills: ${skillRegistry.total_skills || skillRegistry.skills?.length || 0}`)
    console.log(`   MCPs: ${mcpRegistry.total_mcps || mcpRegistry.mcps?.length || 0}`)
    console.log(`   Tools: 24 (manually tracked)`)
    console.log(`   Components: 74 (manually tracked)`)
    console.log(`   Integrations: 28 (manually tracked)`)

    const total = (skillRegistry.total_skills || 0) + (mcpRegistry.total_mcps || 0) + 24 + 74 + 28
    console.log(`   ${GREEN}Total: ${total} resources${RESET}\n`)
  } catch (error) {
    console.error(`${RED}❌ Error generating registries:${RESET}`, error)
    process.exit(1)
  }
}

main()
