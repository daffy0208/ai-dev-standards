const { execa } = require('execa')

/**
 * GitHub Fetch Utility
 *
 * Centralized utility for fetching from ai-dev-standards GitHub repository.
 * Used by sync, update, and other CLI commands.
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
 * Fetch all MCPs from registry.json
 */
async function fetchMCPs() {
  const registry = await fetchJSON('META/registry.json')
  return registry.mcps || []
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
  const [skills, mcps, cursorrules, gitignore, version] = await Promise.all([
    fetchSkills(),
    fetchMCPs(),
    fetchCursorrules(),
    fetchGitignore(),
    fetchVersion()
  ])

  return {
    version,
    skills,
    mcps,
    tools: [],
    cursorrules,
    gitignore
  }
}

module.exports = {
  fetchJSON,
  fetchText,
  fetchSkills,
  fetchMCPs,
  fetchVersion,
  fetchCursorrules,
  fetchGitignore,
  fetchAllStandards,
  GITHUB_RAW_BASE
}
