const fs = require('fs-extra')
const path = require('path')

/**
 * Local Fetch Utility
 *
 * SECURITY FIX: Replaced GitHub fetching with local file system reads
 *
 * This ensures complete project isolation - each project reads from its own
 * local ai-dev-standards installation, NOT from a shared GitHub repository.
 *
 * This fixes the critical security flaw where all projects were syncing from
 * the same GitHub URL, potentially exposing cross-project data.
 */

/**
 * Get the ai-dev-standards root path
 *
 * Priority:
 * 1. AI_DEV_STANDARDS_PATH environment variable
 * 2. Global npm installation
 * 3. Relative to CLI installation
 */
function getStandardsPath() {
  // 1. Check environment variable first (allows user override)
  if (process.env.AI_DEV_STANDARDS_PATH) {
    return process.env.AI_DEV_STANDARDS_PATH
  }

  // 2. Try to find via npm global installation
  try {
    const { execSync } = require('child_process')
    const npmRoot = execSync('npm root -g', { encoding: 'utf8' }).trim()
    const globalPath = path.join(npmRoot, 'ai-dev-standards')
    if (fs.existsSync(globalPath)) {
      return globalPath
    }
  } catch (error) {
    // npm command failed, continue to next method
  }

  // 3. Default: Assume CLI is inside ai-dev-standards/CLI/
  // Go up two directories from this file's location
  const cliPath = path.resolve(__dirname, '../..')
  if (fs.existsSync(path.join(cliPath, 'META', 'skill-registry.json'))) {
    return cliPath
  }

  throw new Error(
    'Cannot locate ai-dev-standards installation. Please set AI_DEV_STANDARDS_PATH environment variable.'
  )
}

/**
 * Read JSON from local file system
 */
async function fetchJSON(relativePath) {
  try {
    const standardsPath = getStandardsPath()
    const fullPath = path.join(standardsPath, relativePath)

    if (!(await fs.pathExists(fullPath))) {
      throw new Error(`File not found: ${relativePath}`)
    }

    const content = await fs.readFile(fullPath, 'utf8')
    return JSON.parse(content)
  } catch (error) {
    throw new Error(`Failed to read ${relativePath}: ${error.message}`)
  }
}

/**
 * Read text from local file system
 */
async function fetchText(relativePath) {
  try {
    const standardsPath = getStandardsPath()
    const fullPath = path.join(standardsPath, relativePath)

    if (!(await fs.pathExists(fullPath))) {
      throw new Error(`File not found: ${relativePath}`)
    }

    return await fs.readFile(fullPath, 'utf8')
  } catch (error) {
    throw new Error(`Failed to read ${relativePath}: ${error.message}`)
  }
}

/**
 * Get absolute path for a resource
 * Used when we need to reference files (like skill SKILL.md files)
 */
function getAbsolutePath(relativePath) {
  const standardsPath = getStandardsPath()
  return path.join(standardsPath, relativePath)
}

/**
 * Check if a file exists
 */
async function fileExists(relativePath) {
  try {
    const fullPath = getAbsolutePath(relativePath)
    return await fs.pathExists(fullPath)
  } catch (error) {
    return false
  }
}

/**
 * Fetch all skills from skill-registry.json
 */
async function fetchSkills() {
  const registry = await fetchJSON('meta/skill-registry.json')
  return registry.skills || []
}

/**
 * Fetch all MCPs from mcp-registry.json
 */
async function fetchMCPs() {
  const registry = await fetchJSON('meta/mcp-registry.json')
  return registry.mcps || []
}

/**
 * Fetch all tools from tool-registry.json
 */
async function fetchTools() {
  const registry = await fetchJSON('meta/tool-registry.json')
  return {
    tools: registry.tools || [],
    scripts: registry.supporting_scripts || []
  }
}

/**
 * Fetch all components from component-registry.json
 */
async function fetchComponents() {
  const registry = await fetchJSON('meta/component-registry.json')
  return registry.components || []
}

/**
 * Fetch all integrations from integration-registry.json
 */
async function fetchIntegrations() {
  const registry = await fetchJSON('meta/integration-registry.json')
  return registry.integrations || []
}

/**
 * Fetch relationship mapping
 */
async function fetchRelationships() {
  const mapping = await fetchJSON('meta/relationship-mapping.json')
  return mapping
}

/**
 * Fetch latest version from package.json
 */
async function fetchVersion() {
  try {
    const pkg = await fetchJSON('package.json')
    return pkg.version || '1.0.0'
  } catch (error) {
    return '1.0.0' // Fallback
  }
}

/**
 * Fetch .cursorrules
 */
async function fetchCursorrules() {
  return fetchText('.cursorrules')
}

/**
 * Fetch .gitignore
 */
async function fetchGitignore() {
  return fetchText('.gitignore')
}

/**
 * Fetch all standards (used by sync command)
 */
async function fetchAllStandards() {
  const [
    skills,
    mcps,
    toolsData,
    components,
    integrations,
    relationships,
    cursorrules,
    gitignore,
    version
  ] = await Promise.all([
    fetchSkills(),
    fetchMCPs(),
    fetchTools(),
    fetchComponents(),
    fetchIntegrations(),
    fetchRelationships(),
    fetchCursorrules(),
    fetchGitignore(),
    fetchVersion()
  ])

  return {
    version,
    skills,
    mcps,
    tools: toolsData.tools,
    scripts: toolsData.scripts,
    components,
    integrations,
    relationships,
    cursorrules,
    gitignore
  }
}

module.exports = {
  fetchJSON,
  fetchText,
  fetchSkills,
  fetchMCPs,
  fetchTools,
  fetchComponents,
  fetchIntegrations,
  fetchRelationships,
  fetchVersion,
  fetchCursorrules,
  fetchGitignore,
  fetchAllStandards,
  getStandardsPath,
  getAbsolutePath,
  fileExists
}
