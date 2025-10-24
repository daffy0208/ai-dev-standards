/**
 * Regenerate relationship-mapping.json from individual registries
 *
 * This script reads all registry files and generates a comprehensive
 * relationship mapping that shows which skills, MCPs, tools, components,
 * and integrations depend on each other.
 *
 * @example
 * ```bash
 * # Run the script
 * ts-node scripts/regenerate-relationships.ts
 *
 * # Or with npm
 * npm run regenerate-relationships
 * ```
 */

import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

const META_DIR = join(__dirname, '..', 'META')

interface Registry {
  [key: string]: any
}

interface SkillMapping {
  required_mcps: string[]
  required_tools: string[]
  required_components: string[]
  required_integrations: string[]
  supporting_scripts: string[]
}

interface McpMapping {
  required_tools: string[]
  required_components: string[]
  required_integrations: string[]
}

interface RelationshipMapping {
  version: string
  last_updated: string
  description: string
  skills: Record<string, SkillMapping>
  mcps: Record<string, McpMapping>
  statistics: {
    total_skills: number
    total_mcps: number
    skills_with_mcps: number
    skills_without_mcps: number
    most_used_tools: Array<{ tool: string; usage_count: number }>
    most_used_components: Array<{ component: string; usage_count: number }>
    most_used_integrations: Array<{ integration: string; usage_count: number }>
    most_used_scripts: Array<{ script: string; usage_count: number }>
  }
  usage_notes: {
    purpose: string
    validation: string
    generation: string
    cross_references: string[]
  }
}

/**
 * Read a JSON registry file
 */
function readRegistry(filename: string): Registry {
  const path = join(META_DIR, filename)
  try {
    const content = readFileSync(path, 'utf-8')
    return JSON.parse(content)
  } catch (error) {
    console.error(`Error reading ${filename}:`, error)
    throw error
  }
}

/**
 * Extract skill relationships from relationship-mapping.json
 * Since skills don't have a direct "uses" field in skill-registry,
 * we need to maintain the relationships in relationship-mapping.json manually
 * or infer them from MCPs, tools, components, and integrations
 */
function extractSkillRelationships(
  mcpRegistry: Registry,
  toolRegistry: Registry,
  componentRegistry: Registry,
  integrationRegistry: Registry
): Record<string, SkillMapping> {
  const skillMappings: Record<string, SkillMapping> = {}

  // Initialize from MCPs
  mcpRegistry.mcps?.forEach((mcp: any) => {
    mcp.supports_skills?.forEach((skill: string) => {
      if (!skillMappings[skill]) {
        skillMappings[skill] = {
          required_mcps: [],
          required_tools: [],
          required_components: [],
          required_integrations: [],
          supporting_scripts: [],
        }
      }
      if (!skillMappings[skill].required_mcps.includes(mcp.id)) {
        skillMappings[skill].required_mcps.push(mcp.id)
      }
    })
  })

  // Add from tools
  toolRegistry.tools?.forEach((tool: any) => {
    tool.supports_skills?.forEach((skill: string) => {
      if (skill === 'all') return // Skip generic "all" references
      if (!skillMappings[skill]) {
        skillMappings[skill] = {
          required_mcps: [],
          required_tools: [],
          required_components: [],
          required_integrations: [],
          supporting_scripts: [],
        }
      }
      if (!skillMappings[skill].required_tools.includes(tool.id)) {
        skillMappings[skill].required_tools.push(tool.id)
      }
    })
  })

  // Add from scripts
  toolRegistry.supporting_scripts?.forEach((script: any) => {
    script.supports_skills?.forEach((skill: string) => {
      if (!skillMappings[skill]) {
        skillMappings[skill] = {
          required_mcps: [],
          required_tools: [],
          required_components: [],
          required_integrations: [],
          supporting_scripts: [],
        }
      }
      if (!skillMappings[skill].supporting_scripts.includes(script.id)) {
        skillMappings[skill].supporting_scripts.push(script.id)
      }
    })
  })

  // Add from components
  componentRegistry.components?.forEach((component: any) => {
    component.supports_skills?.forEach((skill: string) => {
      if (!skillMappings[skill]) {
        skillMappings[skill] = {
          required_mcps: [],
          required_tools: [],
          required_components: [],
          required_integrations: [],
          supporting_scripts: [],
        }
      }
      if (!skillMappings[skill].required_components.includes(component.id)) {
        skillMappings[skill].required_components.push(component.id)
      }
    })
  })

  // Add from integrations
  integrationRegistry.integrations?.forEach((integration: any) => {
    integration.supports_skills?.forEach((skill: string) => {
      if (!skillMappings[skill]) {
        skillMappings[skill] = {
          required_mcps: [],
          required_tools: [],
          required_components: [],
          required_integrations: [],
          supporting_scripts: [],
        }
      }
      if (!skillMappings[skill].required_integrations.includes(integration.id)) {
        skillMappings[skill].required_integrations.push(integration.id)
      }
    })
  })

  return skillMappings
}

/**
 * Extract MCP relationships
 */
function extractMcpRelationships(
  mcpRegistry: Registry,
  toolRegistry: Registry,
  componentRegistry: Registry,
  integrationRegistry: Registry
): Record<string, McpMapping> {
  const mcpMappings: Record<string, McpMapping> = {}

  mcpRegistry.mcps?.forEach((mcp: any) => {
    mcpMappings[mcp.id] = {
      required_tools: [],
      required_components: [],
      required_integrations: [],
    }

    // Find tools that support this MCP
    toolRegistry.tools?.forEach((tool: any) => {
      if (
        tool.supports_mcps?.includes(mcp.id) ||
        tool.supports_mcps?.includes('all')
      ) {
        mcpMappings[mcp.id].required_tools.push(tool.id)
      }
    })

    // Find components that support this MCP
    componentRegistry.components?.forEach((component: any) => {
      if (component.supports_mcps?.includes(mcp.id)) {
        mcpMappings[mcp.id].required_components.push(component.id)
      }
    })

    // Find integrations that support this MCP
    integrationRegistry.integrations?.forEach((integration: any) => {
      if (integration.supports_mcps?.includes(mcp.id)) {
        mcpMappings[mcp.id].required_integrations.push(integration.id)
      }
    })
  })

  return mcpMappings
}

/**
 * Calculate usage statistics
 */
function calculateStatistics(
  skillMappings: Record<string, SkillMapping>,
  mcpMappings: Record<string, McpMapping>,
  skillRegistry: Registry
): RelationshipMapping['statistics'] {
  const toolUsage: Record<string, number> = {}
  const componentUsage: Record<string, number> = {}
  const integrationUsage: Record<string, number> = {}
  const scriptUsage: Record<string, number> = {}

  // Count tool usage
  Object.values(skillMappings).forEach((mapping) => {
    mapping.required_tools.forEach((tool) => {
      toolUsage[tool] = (toolUsage[tool] || 0) + 1
    })
  })
  Object.values(mcpMappings).forEach((mapping) => {
    mapping.required_tools.forEach((tool) => {
      toolUsage[tool] = (toolUsage[tool] || 0) + 1
    })
  })

  // Count component usage
  Object.values(skillMappings).forEach((mapping) => {
    mapping.required_components.forEach((component) => {
      componentUsage[component] = (componentUsage[component] || 0) + 1
    })
  })
  Object.values(mcpMappings).forEach((mapping) => {
    mapping.required_components.forEach((component) => {
      componentUsage[component] = (componentUsage[component] || 0) + 1
    })
  })

  // Count integration usage
  Object.values(skillMappings).forEach((mapping) => {
    mapping.required_integrations.forEach((integration) => {
      integrationUsage[integration] = (integrationUsage[integration] || 0) + 1
    })
  })
  Object.values(mcpMappings).forEach((mapping) => {
    mapping.required_integrations.forEach((integration) => {
      integrationUsage[integration] = (integrationUsage[integration] || 0) + 1
    })
  })

  // Count script usage
  Object.values(skillMappings).forEach((mapping) => {
    mapping.supporting_scripts.forEach((script) => {
      scriptUsage[script] = (scriptUsage[script] || 0) + 1
    })
  })

  const totalSkills = Object.keys(skillMappings).length
  const skillsWithMcps = Object.values(skillMappings).filter(
    (m) => m.required_mcps.length > 0
  ).length

  return {
    total_skills: totalSkills,
    total_mcps: Object.keys(mcpMappings).length,
    skills_with_mcps: skillsWithMcps,
    skills_without_mcps: totalSkills - skillsWithMcps,
    most_used_tools: Object.entries(toolUsage)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tool, usage_count]) => ({ tool, usage_count })),
    most_used_components: Object.entries(componentUsage)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([component, usage_count]) => ({ component, usage_count })),
    most_used_integrations: Object.entries(integrationUsage)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([integration, usage_count]) => ({ integration, usage_count })),
    most_used_scripts: Object.entries(scriptUsage)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([script, usage_count]) => ({ script, usage_count })),
  }
}

/**
 * Main regeneration function
 */
async function regenerateRelationships() {
  console.log('Reading registry files...')

  const skillRegistry = readRegistry('skill-registry.json')
  const mcpRegistry = readRegistry('mcp-registry.json')
  const toolRegistry = readRegistry('tool-registry.json')
  const componentRegistry = readRegistry('component-registry.json')
  const integrationRegistry = readRegistry('integration-registry.json')

  console.log('Extracting relationships...')

  const skillMappings = extractSkillRelationships(
    mcpRegistry,
    toolRegistry,
    componentRegistry,
    integrationRegistry
  )

  const mcpMappings = extractMcpRelationships(
    mcpRegistry,
    toolRegistry,
    componentRegistry,
    integrationRegistry
  )

  console.log('Calculating statistics...')

  const statistics = calculateStatistics(skillMappings, mcpMappings, skillRegistry)

  const relationshipMapping: RelationshipMapping = {
    version: '2.0.0',
    last_updated: new Date().toISOString().split('T')[0],
    description:
      'Complete mapping of skills and MCPs to their required resources (tools, components, integrations, scripts). This is the single source of truth for resource dependencies.',
    skills: skillMappings,
    mcps: mcpMappings,
    statistics,
    usage_notes: {
      purpose:
        'This is the single source of truth for resource dependencies. Skills and MCPs reference this mapping to discover required resources.',
      validation:
        'CI validates that all referenced resources exist in their respective registries',
      generation:
        'This file can be regenerated from individual registries using scripts/regenerate-relationships.ts',
      cross_references: [
        'META/skill-registry.json - All skills',
        'META/mcp-registry.json - All MCPs',
        'META/tool-registry.json - All tools',
        'META/component-registry.json - All components',
        'META/integration-registry.json - All integrations',
      ],
    },
  }

  const outputPath = join(META_DIR, 'relationship-mapping.json')

  console.log('Writing relationship-mapping.json...')

  writeFileSync(outputPath, JSON.stringify(relationshipMapping, null, 2), 'utf-8')

  console.log('✓ Relationship mapping regenerated successfully!')
  console.log(`  Total skills: ${statistics.total_skills}`)
  console.log(`  Total MCPs: ${statistics.total_mcps}`)
  console.log(`  Skills with MCPs: ${statistics.skills_with_mcps}`)
  console.log(`  Skills without MCPs: ${statistics.skills_without_mcps}`)
}

// Run if executed directly
if (require.main === module) {
  regenerateRelationships().catch((error) => {
    console.error('Failed to regenerate relationships:', error)
    process.exit(1)
  })
}

export { regenerateRelationships }
