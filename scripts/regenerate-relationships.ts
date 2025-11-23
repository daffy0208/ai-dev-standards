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

import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join, resolve } from 'path'
import { fileURLToPath } from 'url'

declare const __filename: string | undefined

const resolvedFilename =
  typeof __filename === 'string' ? __filename : fileURLToPath(import.meta.url)
const repoRoot = process.env.AI_DEV_STANDARDS_ROOT
  ? resolve(process.env.AI_DEV_STANDARDS_ROOT)
  : process.cwd()

const META_DIR = join(repoRoot, 'META')

interface Registry {
  [key: string]: any
}

interface SkillMapping {
  required_mcps: string[]
  required_tools: string[]
  required_components: string[]
  required_integrations: string[]
  supporting_scripts: string[]
  related_playbooks?: string[]
  related_standards?: string[]
  related_templates?: string[]
  related_schemas?: string[]
  related_utils?: string[]
  related_examples?: string[]
  related_installers?: string[]
  related_docs?: string[]
}

interface McpMapping {
  required_tools: string[]
  required_components: string[]
  required_integrations: string[]
}

const MANUAL_SKILL_MCP_OVERRIDES: Record<string, string[]> = {
  'api-integration-builder': ['api-validator-mcp', 'openapi-generator-mcp'],
  'bmad-method': ['market-analyzer-mcp', 'feature-prioritizer-mcp'],
  'capability-graph-builder': ['graph-database-mcp', 'brain-mcp'],
  'customer-feedback-analyzer': ['user-insight-analyzer-mcp', 'semantic-search-mcp'],
  'customer-support-builder': ['knowledge-base-mcp', 'vector-database-mcp'],
  'framework-orchestrator': ['agent-orchestrator-mcp', 'brain-mcp'],
  'growth-experimenter': ['market-analyzer-mcp', 'user-insight-analyzer-mcp'],
  'manifest-generator': ['doc-generator-mcp'],
  'orchestration-planner': ['agent-orchestrator-mcp', 'brain-mcp'],
  'pricing-strategist': ['market-analyzer-mcp', 'feature-prioritizer-mcp'],
  'product-analyst': ['user-insight-analyzer-mcp', 'market-analyzer-mcp'],
  'product-analytics': ['user-insight-analyzer-mcp', 'semantic-search-mcp'],
  'prp-generator': ['doc-generator-mcp'],
  'quality-assurance': ['code-quality-scanner-mcp', 'test-runner-mcp', 'screenshot-testing-mcp'],
  'release-manager': ['deployment-orchestrator-mcp', 'test-runner-mcp'],
  'security-architect': ['security-scanner-mcp', 'api-validator-mcp'],
  'skill-validator': ['code-quality-scanner-mcp', 'test-runner-mcp'],
  'system-diagnostician': ['dark-matter-analyzer-mcp', 'code-quality-scanner-mcp'],
  'usability-tester': ['responsive-preview-mcp', 'screenshot-testing-mcp']
}

interface FileDependency {
  depends_on_registries: string[]
  update_type: string
  sections: string[]
  priority: string
  description: string
}

interface RelationshipMapping {
  version: string
  last_updated: string
  description: string
  skills: Record<string, SkillMapping>
  mcps: Record<string, McpMapping>
  file_dependencies: Record<string, FileDependency>
  statistics: {
    total_skills: number
    total_mcps: number
    skills_with_mcps: number
    skills_without_mcps: number
    most_used_tools: Array<{ tool: string; usage_count: number }>
    most_used_components: Array<{ component: string; usage_count: number }>
    most_used_integrations: Array<{ integration: string; usage_count: number }>
    most_used_scripts: Array<{ script: string; usage_count: number }>
    file_dependencies: {
      total_tracked_files: number
      critical_files: number
      high_priority_files: number
      medium_priority_files: number
      low_priority_files: number
      files_by_update_type: Record<string, number>
    }
  }
  usage_notes: {
    purpose: string
    validation: string
    generation: string
    file_dependencies: string
    automation: string
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
  integrationRegistry: Registry,
  skillRegistry: Registry
): Record<string, SkillMapping> {
  const skillMappings: Record<string, SkillMapping> = {}

  function ensureSkill(skill: string) {
    if (!skillMappings[skill]) {
      skillMappings[skill] = {
        required_mcps: [],
        required_tools: [],
        required_components: [],
        required_integrations: [],
        supporting_scripts: []
      }
    }
  }

  const definedSkills = new Set<string>()

  skillRegistry.skills?.forEach((skill: any) => {
    if (skill?.name) {
      definedSkills.add(skill.name)
      ensureSkill(skill.name)
    }
  })

  // Initialize from MCPs
  mcpRegistry.mcps?.forEach((mcp: any) => {
    mcp.supports_skills?.forEach((skill: string) => {
      ensureSkill(skill)
      if (!skillMappings[skill].required_mcps.includes(mcp.id)) {
        skillMappings[skill].required_mcps.push(mcp.id)
      }
    })
  })

  // Add from tools
  toolRegistry.tools?.forEach((tool: any) => {
    tool.supports_skills?.forEach((skill: string) => {
      if (skill === 'all') return // Skip generic "all" references
      ensureSkill(skill)
      if (!skillMappings[skill].required_tools.includes(tool.id)) {
        skillMappings[skill].required_tools.push(tool.id)
      }
    })
  })

  // Add from scripts
  toolRegistry.supporting_scripts?.forEach((script: any) => {
    script.supports_skills?.forEach((skill: string) => {
      ensureSkill(skill)
      if (!skillMappings[skill].supporting_scripts.includes(script.id)) {
        skillMappings[skill].supporting_scripts.push(script.id)
      }
    })
  })

  // Add from components
  componentRegistry.components?.forEach((component: any) => {
    component.supports_skills?.forEach((skill: string) => {
      ensureSkill(skill)
      if (!skillMappings[skill].required_components.includes(component.id)) {
        skillMappings[skill].required_components.push(component.id)
      }
    })
  })

  // Add from integrations
  integrationRegistry.integrations?.forEach((integration: any) => {
    integration.supports_skills?.forEach((skill: string) => {
      ensureSkill(skill)
      if (!skillMappings[skill].required_integrations.includes(integration.id)) {
        skillMappings[skill].required_integrations.push(integration.id)
      }
    })
  })

  Object.entries(MANUAL_SKILL_MCP_OVERRIDES).forEach(([skill, mcps]) => {
    if (!definedSkills.has(skill)) {
      return
    }
    ensureSkill(skill)
    mcps.forEach(mcp => {
      if (!skillMappings[skill].required_mcps.includes(mcp)) {
        skillMappings[skill].required_mcps.push(mcp)
      }
    })
  })

  Object.values(skillMappings).forEach(mapping => {
    mapping.required_mcps.sort()
    mapping.required_tools.sort()
    mapping.required_components.sort()
    mapping.required_integrations.sort()
    mapping.supporting_scripts.sort()
  })

  Object.keys(skillMappings).forEach(skill => {
    if (!definedSkills.has(skill)) {
      delete skillMappings[skill]
    }
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
      required_integrations: []
    }

    // Find tools that support this MCP
    toolRegistry.tools?.forEach((tool: any) => {
      if (tool.supports_mcps?.includes(mcp.id) || tool.supports_mcps?.includes('all')) {
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
 * Get file dependencies configuration
 */
function getFileDependencies(): Record<string, FileDependency> {
  return {
    'CLI/commands/sync.js': {
      depends_on_registries: [
        'skill-registry',
        'mcp-registry',
        'tool-registry',
        'component-registry',
        'integration-registry'
      ],
      update_type: 'code',
      sections: ['checkForUpdates', 'applyUpdate', 'initializeSync', 'showSyncSummary'],
      priority: 'critical',
      description:
        'Sync command needs updating when new resource types are added or registry structures change'
    },
    'CLI/utils/github-fetch.js': {
      depends_on_registries: ['all'],
      update_type: 'code',
      sections: ['fetchAllStandards', 'module.exports'],
      priority: 'critical',
      description: 'Fetch utility must be updated when new registries are added'
    },
    '.claude/claude.md': {
      depends_on_registries: ['skill-registry'],
      update_type: 'content',
      sections: ['Skills section'],
      priority: 'high',
      description: 'Must list all 37 skills with names, descriptions, and locations'
    },
    '.cursorrules': {
      depends_on_registries: ['all'],
      update_type: 'statistics',
      sections: ['Available Resources'],
      priority: 'high',
      description: 'Statistics and registry references need updating when counts change'
    },
    'README.md': {
      depends_on_registries: ['all'],
      update_type: 'statistics',
      sections: ['lines 9-26', 'version number', 'resource counts'],
      priority: 'high',
      description: 'Version and resource statistics must be current'
    },
    'TEMPLATES/cursorrules-ai-rag.md': {
      depends_on_registries: ['all'],
      update_type: 'statistics',
      sections: ['Available Resources'],
      priority: 'medium',
      description: 'Template should reference current registry statistics'
    },
    'TEMPLATES/cursorrules-existing-project.md': {
      depends_on_registries: ['all'],
      update_type: 'statistics',
      sections: ['Available Resources'],
      priority: 'medium',
      description: 'Template should reference current registry statistics'
    },
    'TEMPLATES/cursorrules-minimal.md': {
      depends_on_registries: ['all'],
      update_type: 'statistics',
      sections: ['Available Resources'],
      priority: 'medium',
      description: 'Template should reference current registry statistics'
    },
    'TEMPLATES/cursorrules-quick-test.md': {
      depends_on_registries: ['all'],
      update_type: 'statistics',
      sections: ['Available Resources'],
      priority: 'medium',
      description: 'Template should reference current registry statistics'
    },
    'TEMPLATES/cursorrules-saas.md': {
      depends_on_registries: ['all'],
      update_type: 'statistics',
      sections: ['Available Resources'],
      priority: 'medium',
      description: 'Template should reference current registry statistics'
    },
    'INSTALLERS/bootstrap/bootstrap.js': {
      depends_on_registries: ['all'],
      update_type: 'code',
      sections: ['installation logic', 'resource fetching'],
      priority: 'high',
      description: 'Bootstrap installer must handle all 6 resource types'
    },
    'scripts/regenerate-relationships.ts': {
      depends_on_registries: ['all'],
      update_type: 'code',
      sections: ['extractSkillRelationships', 'extractMcpRelationships'],
      priority: 'critical',
      description: 'Relationship regeneration script must process all registries correctly'
    },
    'SYNC-UPDATE-PLAN.md': {
      depends_on_registries: ['all'],
      update_type: 'documentation',
      sections: ['all sections'],
      priority: 'low',
      description: 'Planning document - can be archived once updates are complete'
    }
  }
}

/**
 * Calculate file dependency statistics
 */
function calculateFileDependencyStatistics(fileDeps: Record<string, FileDependency>) {
  const priorities = Object.values(fileDeps).map(dep => dep.priority)
  const updateTypes = Object.values(fileDeps).map(dep => dep.update_type)

  const updateTypeCount: Record<string, number> = {}
  updateTypes.forEach(type => {
    updateTypeCount[type] = (updateTypeCount[type] || 0) + 1
  })

  return {
    total_tracked_files: Object.keys(fileDeps).length,
    critical_files: priorities.filter(p => p === 'critical').length,
    high_priority_files: priorities.filter(p => p === 'high').length,
    medium_priority_files: priorities.filter(p => p === 'medium').length,
    low_priority_files: priorities.filter(p => p === 'low').length,
    files_by_update_type: updateTypeCount
  }
}

/**
 * Calculate usage statistics
 */
function calculateStatistics(
  skillMappings: Record<string, SkillMapping>,
  mcpMappings: Record<string, McpMapping>,
  skillRegistry: Registry,
  fileDeps: Record<string, FileDependency>
): RelationshipMapping['statistics'] {
  const toolUsage: Record<string, number> = {}
  const componentUsage: Record<string, number> = {}
  const integrationUsage: Record<string, number> = {}
  const scriptUsage: Record<string, number> = {}

  // Count tool usage
  Object.values(skillMappings).forEach(mapping => {
    mapping.required_tools.forEach(tool => {
      toolUsage[tool] = (toolUsage[tool] || 0) + 1
    })
  })
  Object.values(mcpMappings).forEach(mapping => {
    mapping.required_tools.forEach(tool => {
      toolUsage[tool] = (toolUsage[tool] || 0) + 1
    })
  })

  // Count component usage
  Object.values(skillMappings).forEach(mapping => {
    mapping.required_components.forEach(component => {
      componentUsage[component] = (componentUsage[component] || 0) + 1
    })
  })
  Object.values(mcpMappings).forEach(mapping => {
    mapping.required_components.forEach(component => {
      componentUsage[component] = (componentUsage[component] || 0) + 1
    })
  })

  // Count integration usage
  Object.values(skillMappings).forEach(mapping => {
    mapping.required_integrations.forEach(integration => {
      integrationUsage[integration] = (integrationUsage[integration] || 0) + 1
    })
  })
  Object.values(mcpMappings).forEach(mapping => {
    mapping.required_integrations.forEach(integration => {
      integrationUsage[integration] = (integrationUsage[integration] || 0) + 1
    })
  })

  // Count script usage
  Object.values(skillMappings).forEach(mapping => {
    mapping.supporting_scripts.forEach(script => {
      scriptUsage[script] = (scriptUsage[script] || 0) + 1
    })
  })

  const totalSkills = Object.keys(skillMappings).length
  const skillsWithMcps = Object.values(skillMappings).filter(m => m.required_mcps.length > 0).length

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
    file_dependencies: calculateFileDependencyStatistics(fileDeps)
  }
}

/**
 * Main regeneration function
 */
async function regenerateRelationships(options: { checkOnly?: boolean } = {}) {
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
    integrationRegistry,
    skillRegistry
  )

  const mcpMappings = extractMcpRelationships(
    mcpRegistry,
    toolRegistry,
    componentRegistry,
    integrationRegistry
  )

  console.log('Getting file dependencies...')

  const outputPath = join(META_DIR, 'relationship-mapping.json')
  const existingMapping = existsSync(outputPath)
    ? JSON.parse(readFileSync(outputPath, 'utf-8'))
    : null

  const fileDependencies = existingMapping?.file_dependencies || getFileDependencies()

  console.log('Calculating statistics...')

  const statistics = calculateStatistics(
    skillMappings,
    mcpMappings,
    skillRegistry,
    fileDependencies
  )

  const existingSkills = existingMapping?.skills || {}

  const mergedSkills: Record<string, SkillMapping> = {}
  Object.entries(skillMappings).forEach(([skill, mapping]) => {
    const existing = existingSkills[skill] || {}
    mergedSkills[skill] = {
      required_mcps: mapping.required_mcps,
      required_tools: mapping.required_tools,
      required_components: mapping.required_components,
      required_integrations: mapping.required_integrations,
      supporting_scripts: mapping.supporting_scripts,
      related_playbooks: existing.related_playbooks || [],
      related_standards: existing.related_standards || [],
      related_templates: existing.related_templates || [],
      related_schemas: existing.related_schemas || [],
      related_utils: existing.related_utils || [],
      related_examples: existing.related_examples || [],
      related_installers: existing.related_installers || [],
      related_docs: existing.related_docs || []
    }
  })

  const relationshipMapping: RelationshipMapping = {
    version: '2.0.0',
    last_updated: new Date().toISOString().split('T')[0],
    description:
      'Complete mapping of skills and MCPs to their required resources (tools, components, integrations, scripts). This is the single source of truth for resource dependencies.',
    skills: mergedSkills,
    mcps: mcpMappings,
    file_dependencies: fileDependencies,
    statistics,
    usage_notes: {
      purpose:
        'This is the single source of truth for resource dependencies. Skills and MCPs reference this mapping to discover required resources.',
      validation: 'CI validates that all referenced resources exist in their respective registries',
      generation:
        'This file can be regenerated from individual registries using scripts/regenerate-relationships.ts',
      file_dependencies:
        'The file_dependencies section tracks which files need updating when registries change. This ensures systematic updates and prevents files from falling out of sync.',
      automation:
        'When registries are updated, check file_dependencies to see which files need updating. Sort by priority (critical > high > medium > low) and update_type.',
      cross_references: [
        'META/skill-registry.json - All skills',
        'META/mcp-registry.json - All MCPs',
        'META/tool-registry.json - All tools',
        'META/component-registry.json - All components',
        'META/integration-registry.json - All integrations'
      ]
    }
  }

  const outputJson = JSON.stringify(relationshipMapping, null, 2) + '\n'

  if (options.checkOnly) {
    if (!existsSync(outputPath)) {
      console.error(
        '❌ relationship-mapping.json is missing. Regenerate it with npm run relationships:regen'
      )
      throw new Error('relationship-mapping.json missing')
    }

    const existing = readFileSync(outputPath, 'utf-8')

    if (existing.trim() === outputJson.trim()) {
      console.log('✅ relationship-mapping.json is up to date')
      console.log(`  Total skills: ${statistics.total_skills}`)
      console.log(`  Total MCPs: ${statistics.total_mcps}`)
      console.log(`  Skills with MCPs: ${statistics.skills_with_mcps}`)
      console.log(`  Skills without MCPs: ${statistics.skills_without_mcps}`)
      return
    }

    console.error('❌ relationship-mapping.json is out of date. Run npm run relationships:regen')
    throw new Error('relationship-mapping.json out of date')
  }

  console.log('Writing relationship-mapping.json...')

  writeFileSync(outputPath, outputJson, 'utf-8')

  console.log('✅ Relationship mapping regenerated successfully!')
  console.log(`  Total skills: ${statistics.total_skills}`)
  console.log(`  Total MCPs: ${statistics.total_mcps}`)
  console.log(`  Skills with MCPs: ${statistics.skills_with_mcps}`)
  console.log(`  Skills without MCPs: ${statistics.skills_without_mcps}`)
}

const invokedDirectly = process.argv[1] ? resolve(process.argv[1]) === resolvedFilename : false

// Run if executed directly
if (invokedDirectly) {
  const checkOnly = process.argv.includes('--check')

  regenerateRelationships({ checkOnly }).catch(error => {
    console.error('Failed to regenerate relationships:', error)
    process.exit(1)
  })
}

export { regenerateRelationships }
