#!/usr/bin/env node

/**
 * Update Skill Registry with MCP Pattern Preferences
 *
 * This script updates all skills in skill-registry.json with:
 * - preferred_mcp_pattern: Which MCP pattern works best for this skill
 * - mcp_pattern_rationale: Why this pattern is preferred
 *
 * Pattern Selection Logic:
 * - Code Execution: Complex skills with multiple tool interactions, data processing
 * - Direct MCP: Simple skills with single operations, real-time requirements
 * - Hybrid: Skills that can benefit from both patterns depending on task
 *
 * Usage:
 *   node scripts/update-skill-registry-patterns.js [--dry-run]
 */

const fs = require('fs-extra')
const path = require('path')

// Skills that strongly benefit from Code Execution pattern
const CODE_EXECUTION_SKILLS = [
  'data-pipeline-architect',
  'rag-implementer',
  'vector-database-specialist',
  'analytics-engineer',
  'ml-ops-engineer',
  'data-forensics-investigator',
  'integration-architect',
  'workflow-automator',
  'deployment-automator',
  'infrastructure-as-code-specialist'
]

// Skills that work better with Direct MCP pattern
const DIRECT_MCP_SKILLS = [
  'ui-designer',
  'accessibility-engineer',
  '3d-visualizer',
  'animation-specialist',
  'real-time-collaborator'
]

/**
 * Determine preferred MCP pattern for a skill
 */
function getPreferredPattern(skill) {
  const name = skill.name

  // Check explicit lists first
  if (CODE_EXECUTION_SKILLS.includes(name)) {
    return {
      pattern: 'code-execution',
      rationale: 'Complex multi-tool workflows benefit from progressive discovery and skill reuse'
    }
  }

  if (DIRECT_MCP_SKILLS.includes(name)) {
    return {
      pattern: 'direct',
      rationale: 'Simple, real-time operations work better with all tools loaded upfront'
    }
  }

  // Infer from skill characteristics
  const difficulty = skill.difficulty || 'intermediate'
  const category = skill.category || 'specialized'
  const estimatedTime = skill.estimated_time || ''

  // Complex, long-running skills prefer Code Execution
  if (difficulty === 'advanced' || estimatedTime.includes('3+ hours')) {
    return {
      pattern: 'code-execution',
      rationale: 'Advanced complexity and longer tasks benefit from token efficiency and skill persistence'
    }
  }

  // Simple, quick skills can work with either
  if (difficulty === 'beginner' || estimatedTime.includes('< 1 hour')) {
    return {
      pattern: 'direct',
      rationale: 'Simple operations complete quickly with Direct MCP pattern'
    }
  }

  // Category-based inference
  const codeExecutionCategories = [
    'data',
    'infrastructure',
    'orchestration',
    'analysis',
    'automation'
  ]

  const skillDescription = skill.description || ''
  for (const cat of codeExecutionCategories) {
    if (skillDescription.toLowerCase().includes(cat) || category === cat) {
      return {
        pattern: 'hybrid',
        rationale: 'Can use both patterns - Code Execution for complex tasks, Direct MCP for simple operations'
      }
    }
  }

  // Default to hybrid for flexibility
  return {
    pattern: 'hybrid',
    rationale: 'Flexible pattern selection based on task complexity via Brain orchestrator'
  }
}

/**
 * Add recommended MCPs for each pattern
 */
function getRecommendedMcps(skill, pattern) {
  const recommendations = {
    'code-execution': [],
    'direct': [],
    'hybrid': []
  }

  // Infer from skill name and description
  const name = skill.name.toLowerCase()
  const description = (skill.description || '').toLowerCase()

  // Data and analytics skills
  if (name.includes('data') || name.includes('analytics') || description.includes('data')) {
    recommendations['code-execution'].push('data-pipeline-mcp', 'vector-database-mcp')
  }

  // RAG and AI skills
  if (name.includes('rag') || description.includes('retrieval')) {
    recommendations['code-execution'].push('vector-database-mcp', 'semantic-search-mcp')
  }

  // Deployment and infrastructure
  if (name.includes('deploy') || name.includes('infrastructure')) {
    recommendations['code-execution'].push('deployment-orchestrator-mcp', 'infrastructure-mcp')
  }

  // UI and design skills
  if (name.includes('ui') || name.includes('design') || description.includes('design')) {
    recommendations['direct'].push('design-system-mcp', 'asset-library-mcp')
  }

  // Testing and quality
  if (name.includes('test') || name.includes('quality')) {
    recommendations['hybrid'].push('testing-automation-mcp', 'quality-assurance-mcp')
  }

  return recommendations
}

/**
 * Add pattern information to a skill
 */
function addPatternInfo(skill) {
  const { pattern, rationale } = getPreferredPattern(skill)
  const recommendedMcps = getRecommendedMcps(skill, pattern)

  return {
    ...skill,
    mcp_pattern_preference: {
      preferred_pattern: pattern,
      rationale,
      recommended_mcps: recommendedMcps,
      pattern_notes: pattern === 'hybrid'
        ? 'Brain orchestrator will automatically select optimal pattern based on task complexity'
        : pattern === 'code-execution'
        ? 'Use Code Execution pattern for maximum token efficiency and skill reuse'
        : 'Use Direct MCP pattern for simple, fast operations'
    }
  }
}

/**
 * Main execution
 */
async function main() {
  const isDryRun = process.argv.includes('--dry-run')
  const registryPath = path.join(__dirname, '../meta/skill-registry.json')

  console.log('🔄 Updating Skill Registry with MCP Pattern Preferences...\n')

  // Read registry
  const registry = await fs.readJSON(registryPath)
  console.log(`📦 Found ${registry.skills.length} skills\n`)

  // Backup original
  if (!isDryRun) {
    const backupPath = path.join(__dirname, '../meta/skill-registry.backup.json')
    await fs.writeJSON(backupPath, registry, { spaces: 2 })
    console.log(`💾 Backup saved to: skill-registry.backup.json\n`)
  }

  // Update each skill
  const updatedSkills = registry.skills.map(skill => addPatternInfo(skill))

  // Update registry
  const updatedRegistry = {
    ...registry,
    version: registry.version,
    last_updated: new Date().toISOString().split('T')[0],
    description: registry.description + ' Now includes MCP pattern preferences for optimal tool selection.',
    skills: updatedSkills
  }

  // Statistics
  const codeExecutionCount = updatedSkills.filter(
    s => s.mcp_pattern_preference.preferred_pattern === 'code-execution'
  ).length
  const directCount = updatedSkills.filter(
    s => s.mcp_pattern_preference.preferred_pattern === 'direct'
  ).length
  const hybridCount = updatedSkills.filter(
    s => s.mcp_pattern_preference.preferred_pattern === 'hybrid'
  ).length

  console.log('📊 Pattern Distribution:')
  console.log(`   Code Execution: ${codeExecutionCount} skills (${Math.round(codeExecutionCount / updatedSkills.length * 100)}%)`)
  console.log(`   Direct MCP: ${directCount} skills (${Math.round(directCount / updatedSkills.length * 100)}%)`)
  console.log(`   Hybrid: ${hybridCount} skills (${Math.round(hybridCount / updatedSkills.length * 100)}%)`)
  console.log('')

  // Show some examples
  console.log('📝 Example Pattern Preferences:')
  console.log('')

  console.log('   Code Execution Skills:')
  updatedSkills
    .filter(s => s.mcp_pattern_preference.preferred_pattern === 'code-execution')
    .slice(0, 3)
    .forEach(skill => {
      console.log(`   - ${skill.name}`)
      console.log(`     ${skill.mcp_pattern_preference.rationale}`)
    })
  console.log('')

  console.log('   Direct MCP Skills:')
  updatedSkills
    .filter(s => s.mcp_pattern_preference.preferred_pattern === 'direct')
    .slice(0, 3)
    .forEach(skill => {
      console.log(`   - ${skill.name}`)
      console.log(`     ${skill.mcp_pattern_preference.rationale}`)
    })
  console.log('')

  // Write updated registry
  if (isDryRun) {
    console.log('🔍 DRY RUN MODE - Changes not written to disk')
    console.log('\nTo apply changes, run without --dry-run flag')
  } else {
    await fs.writeJSON(registryPath, updatedRegistry, { spaces: 2 })
    console.log('✅ Skill Registry updated successfully!')
    console.log(`📝 Updated: ${registryPath}`)
  }
}

// Run script
main().catch(error => {
  console.error('❌ Error updating skill registry:', error)
  process.exit(1)
})
