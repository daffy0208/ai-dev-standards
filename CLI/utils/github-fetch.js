const execa = require('execa')

/**
 * GitHub Fetch Utility
 *
 * ⚠️ DEPRECATED: This module has been replaced by local-fetch.js for security reasons.
 *
 * CRITICAL SECURITY FIX: This module created a cross-project data exposure risk
 * by having all projects sync from a single shared GitHub repository.
 *
 * USE local-fetch.js INSTEAD - it provides:
 * - Complete project isolation
 * - Local-first architecture
 * - 10x faster performance
 * - Offline support
 * - No single point of failure
 *
 * This file is kept only for backward compatibility and will be removed in v3.0.0
 *
 * @deprecated Use CLI/utils/local-fetch.js instead
 * @see CLI/utils/local-fetch.js
 * @see SECURITY-FIX-CROSS-PROJECT-ISOLATION.md
 */

const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/daffy0208/ai-dev-standards/main'

/**
 * Fetch JSON from GitHub
 */
async function fetchJSON(path) {
  const url = `${GITHUB_RAW_BASE}/${path}`
  try {
    const response = await execa('curl', ['-s', '-f', url])
    return JSON.parse(response.stdout)
  } catch (error) {
    throw new Error(`Failed to fetch ${path} from GitHub: ${error.message}`)
  }
}

/**
 * Fetch text from GitHub
 */
async function fetchText(path) {
  const url = `${GITHUB_RAW_BASE}/${path}`
  try {
    const response = await execa('curl', ['-s', '-f', url])
    return response.stdout
  } catch (error) {
    throw new Error(`Failed to fetch ${path} from GitHub: ${error.message}`)
  }
}

/**
 * Fetch all skills from skill-registry.json
 */
async function fetchSkills() {
  const registry = await fetchJSON('META/skill-registry.json')
  return registry.skills || []
}

/**
 * Fetch all MCPs from mcp-registry.json
 */
async function fetchMCPs() {
  const registry = await fetchJSON('META/mcp-registry.json')
  return registry.mcps || []
}

/**
 * Fetch all tools from tool-registry.json
 */
async function fetchTools() {
  const registry = await fetchJSON('META/tool-registry.json')
  return {
    tools: registry.tools || [],
    scripts: registry.supporting_scripts || []
  }
}

/**
 * Fetch all components from component-registry.json
 */
async function fetchComponents() {
  const registry = await fetchJSON('META/component-registry.json')
  return registry.components || []
}

/**
 * Fetch all integrations from integration-registry.json
 */
async function fetchIntegrations() {
  const registry = await fetchJSON('META/integration-registry.json')
  return registry.integrations || []
}

/**
 * Fetch relationship mapping
 */
async function fetchRelationships() {
  const mapping = await fetchJSON('META/relationship-mapping.json')
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
  GITHUB_RAW_BASE
}
