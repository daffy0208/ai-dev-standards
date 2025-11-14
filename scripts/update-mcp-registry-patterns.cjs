#!/usr/bin/env node

/**
 * Update MCP Registry with Pattern Metadata
 *
 * This script updates all 50 MCPs in mcp-registry.json with:
 * - pattern field (default: "direct")
 * - migration_metadata with complexity scores and priorities
 * - security_config with initial security settings
 *
 * Usage:
 *   node scripts/update-mcp-registry-patterns.js [--dry-run]
 */

const fs = require('fs-extra')
const path = require('path')

// Tier 1 migration candidates (identified in roadmap)
const TIER_1_CANDIDATES = [
  'semantic-search-mcp',      // Pilot migration
  'market-analyzer-mcp',
  'user-insight-analyzer-mcp',
  'deployment-orchestrator-mcp',
  'agent-orchestrator-mcp'
]

// Tier 2 migration candidates (potential future migrations)
const TIER_2_CANDIDATES = [
  'vector-database-mcp',
  'data-pipeline-mcp',
  'analytics-dashboard-mcp',
  'integration-hub-mcp',
  'workflow-automation-mcp'
]

// MCPs that handle PII and require tokenization
const PII_HANDLING_MCPS = [
  'user-insight-analyzer-mcp',
  'customer-support-mcp',
  'data-pipeline-mcp',
  'analytics-dashboard-mcp'
]

/**
 * Estimate complexity score for an MCP
 */
function estimateComplexity(mcp) {
  let score = 1

  // Base on features
  const featureCount = mcp.features?.length || 1
  score += featureCount * 1.5

  // Base on capabilities
  const capabilityCount = mcp.capabilities?.length || 1
  score += Math.min(capabilityCount * 0.5, 3)

  // Base on dependencies
  const dependencyCount = mcp.dependencies?.length || 0
  score += Math.min(dependencyCount * 0.3, 2)

  // Base on category
  const complexCategories = ['ai', 'orchestration', 'analysis', 'deployment']
  if (complexCategories.includes(mcp.category)) {
    score += 1
  }

  return Math.min(Math.max(Math.round(score), 1), 10)
}

/**
 * Estimate tool count for an MCP
 */
function estimateToolCount(mcp) {
  const hasTools = mcp.features?.includes('tools')
  const hasResources = mcp.features?.includes('resources')
  const hasPrompts = mcp.features?.includes('prompts')

  let toolCount = 0
  if (hasTools) toolCount += Math.max(mcp.capabilities?.length || 2, 2)
  if (hasResources) toolCount += 1
  if (hasPrompts) toolCount += 1

  return toolCount
}

/**
 * Estimate token usage for Direct MCP pattern
 */
function estimateTokenUsage(mcp) {
  const toolCount = estimateToolCount(mcp)
  const avgTokensPerTool = 500 // Conservative estimate

  // Base tokens + (tools * avg per tool)
  return 1000 + (toolCount * avgTokensPerTool)
}

/**
 * Determine migration priority
 */
function getMigrationPriority(mcpId, complexity) {
  if (TIER_1_CANDIDATES.includes(mcpId)) {
    return { priority: 'high', tier: 1 }
  }

  if (TIER_2_CANDIDATES.includes(mcpId)) {
    return { priority: 'medium', tier: 2 }
  }

  // Consider complexity for other MCPs
  if (complexity >= 7) {
    return { priority: 'low', tier: 3 }
  }

  return { priority: 'not-evaluated', tier: null }
}

/**
 * Calculate expected token savings
 */
function calculateExpectedSavings(complexity, toolCount) {
  // First run: 40-60% savings based on complexity
  const firstRunSavings = 40 + (complexity / 10) * 20

  // With skills: 85-95% savings
  const withSkillsSavings = 85 + (toolCount / 10) * 10

  // Return average expected savings
  return Math.round((firstRunSavings + withSkillsSavings) / 2)
}

/**
 * Determine security configuration
 */
function getSecurityConfig(mcpId, pattern) {
  const requiresPII = PII_HANDLING_MCPS.includes(mcpId)

  if (pattern === 'code-execution') {
    return {
      layers_enabled: [
        'sandbox',
        ...(requiresPII ? ['pii-tokenization'] : []),
        'access-control',
        'monitoring'
      ],
      sandbox_type: 'docker',
      requires_pii_tokenization: requiresPII,
      access_control_level: 'authenticated'
    }
  }

  // Direct MCP has minimal security needs
  return {
    layers_enabled: [],
    sandbox_type: 'none',
    requires_pii_tokenization: requiresPII,
    access_control_level: 'public'
  }
}

/**
 * Add pattern metadata to an MCP
 */
function addPatternMetadata(mcp) {
  const complexity = estimateComplexity(mcp)
  const toolCount = estimateToolCount(mcp)
  const tokenUsage = estimateTokenUsage(mcp)
  const { priority, tier } = getMigrationPriority(mcp.id, complexity)
  const expectedSavings = calculateExpectedSavings(complexity, toolCount)

  // Default pattern is "direct" for all existing MCPs
  const pattern = 'direct'

  return {
    ...mcp,
    pattern,
    migration_metadata: {
      is_migration_candidate: priority !== 'not-evaluated',
      complexity_score: complexity,
      estimated_tools_count: toolCount,
      estimated_token_usage: tokenUsage,
      migration_priority: priority,
      migration_tier: tier,
      expected_token_savings_percent: expectedSavings
    },
    security_config: getSecurityConfig(mcp.id, pattern)
  }
}

/**
 * Main execution
 */
async function main() {
  const isDryRun = process.argv.includes('--dry-run')
  const registryPath = path.join(__dirname, '../META/mcp-registry.json')

  console.log('🔄 Updating MCP Registry with Pattern Metadata...\n')

  // Read registry
  const registry = await fs.readJSON(registryPath)
  console.log(`📦 Found ${registry.mcps.length} MCPs\n`)

  // Backup original
  if (!isDryRun) {
    const backupPath = path.join(__dirname, '../META/mcp-registry.backup.json')
    await fs.writeJSON(backupPath, registry, { spaces: 2 })
    console.log(`💾 Backup saved to: mcp-registry.backup.json\n`)
  }

  // Update each MCP
  const updatedMcps = registry.mcps.map(mcp => addPatternMetadata(mcp))

  // Update registry
  const updatedRegistry = {
    ...registry,
    version: registry.version,
    last_updated: new Date().toISOString().split('T')[0],
    mcps: updatedMcps
  }

  // Statistics
  const tier1Count = updatedMcps.filter(m => m.migration_metadata.migration_tier === 1).length
  const tier2Count = updatedMcps.filter(m => m.migration_metadata.migration_tier === 2).length
  const tier3Count = updatedMcps.filter(m => m.migration_metadata.migration_tier === 3).length
  const piiCount = updatedMcps.filter(m => m.security_config.requires_pii_tokenization).length

  console.log('📊 Statistics:')
  console.log(`   Total MCPs: ${updatedMcps.length}`)
  console.log(`   Tier 1 (High Priority): ${tier1Count} MCPs`)
  console.log(`   Tier 2 (Medium Priority): ${tier2Count} MCPs`)
  console.log(`   Tier 3 (Low Priority): ${tier3Count} MCPs`)
  console.log(`   Require PII Tokenization: ${piiCount} MCPs`)
  console.log('')

  // Show Tier 1 candidates
  console.log('🎯 Tier 1 Migration Candidates:')
  updatedMcps
    .filter(m => m.migration_metadata.migration_tier === 1)
    .forEach(mcp => {
      console.log(`   - ${mcp.id}`)
      console.log(`     Complexity: ${mcp.migration_metadata.complexity_score}/10`)
      console.log(`     Tools: ~${mcp.migration_metadata.estimated_tools_count}`)
      console.log(`     Token Usage: ~${mcp.migration_metadata.estimated_token_usage}`)
      console.log(`     Expected Savings: ${mcp.migration_metadata.expected_token_savings_percent}%`)
      console.log('')
    })

  // Write updated registry
  if (isDryRun) {
    console.log('🔍 DRY RUN MODE - Changes not written to disk')
    console.log('\nTo apply changes, run without --dry-run flag')
  } else {
    await fs.writeJSON(registryPath, updatedRegistry, { spaces: 2 })
    console.log('✅ MCP Registry updated successfully!')
    console.log(`📝 Updated: ${registryPath}`)
  }
}

// Run script
main().catch(error => {
  console.error('❌ Error updating MCP registry:', error)
  process.exit(1)
})
