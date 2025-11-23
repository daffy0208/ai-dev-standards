/**
 * PATH VALIDATION UTILITIES
 *
 * Security utilities to prevent path traversal attacks
 * and ensure file operations stay within workspace bounds.
 */

const path = require('path')
const fs = require('fs-extra')

/**
 * Validate and normalize a file path to prevent path traversal
 *
 * @param {string} filePath - User-provided file path
 * @param {string} workspaceRoot - Root directory (defaults to cwd)
 * @param {string} context - Context for error messages
 * @returns {string} - Normalized, validated absolute path
 * @throws {Error} - If path is invalid or outside workspace
 */
function validateFilePath(filePath, workspaceRoot = process.cwd(), context = 'file path') {
  if (!filePath || typeof filePath !== 'string') {
    throw new Error(`${context} is required and must be a string`)
  }

  const trimmed = filePath.trim()

  if (trimmed.length === 0) {
    throw new Error(`${context} cannot be empty`)
  }

  // Normalize workspace root
  const normalizedRoot = path.resolve(workspaceRoot)

  // Resolve the file path (handles .., ., etc.)
  const resolvedPath = path.resolve(normalizedRoot, trimmed)

  // Ensure the resolved path is within the workspace
  if (!resolvedPath.startsWith(normalizedRoot + path.sep) && resolvedPath !== normalizedRoot) {
    throw new Error(
      `Invalid ${context}: path traversal detected. ` +
        `Path must be within the project directory. ` +
        `Attempted path: "${filePath}"`
    )
  }

  return resolvedPath
}

/**
 * Validate environment file path (.env, .env.local, etc.)
 *
 * @param {string} envPath - Path to environment file
 * @param {string} workspaceRoot - Root directory (defaults to cwd)
 * @returns {string} - Validated absolute path
 * @throws {Error} - If path is invalid
 */
function validateEnvPath(envPath, workspaceRoot = process.cwd()) {
  // Default to .env.local if not provided
  const actualPath = envPath || '.env.local'

  // Validate the path
  const validated = validateFilePath(actualPath, workspaceRoot, 'environment file path')

  // Ensure it's an .env file
  const basename = path.basename(validated)
  if (!basename.startsWith('.env')) {
    throw new Error(
      `Invalid environment file: must be a .env file (.env, .env.local, .env.production, etc.). ` +
        `Got: "${basename}"`
    )
  }

  return validated
}

/**
 * Validate report output path
 *
 * @param {string} reportPath - Path to report file
 * @param {string} workspaceRoot - Root directory (defaults to cwd)
 * @returns {string} - Validated absolute path
 * @throws {Error} - If path is invalid
 */
function validateReportPath(reportPath, workspaceRoot = process.cwd()) {
  if (!reportPath) {
    throw new Error('Report path is required')
  }

  // Validate the path
  const validated = validateFilePath(reportPath, workspaceRoot, 'report file path')

  // Ensure it's a .json file
  if (path.extname(validated) !== '.json') {
    throw new Error(
      `Invalid report file: must be a .json file. ` + `Got: "${path.basename(validated)}"`
    )
  }

  return validated
}

/**
 * Validate URL for specific service (exact host matching)
 *
 * @param {string} url - URL to validate
 * @param {string} serviceName - Service name for error messages
 * @param {string[]} allowedHosts - Array of allowed hostnames
 * @returns {string} - Validated URL
 * @throws {Error} - If URL is invalid
 */
function validateServiceURL(url, serviceName, allowedHosts) {
  if (!url || typeof url !== 'string') {
    throw new Error(`${serviceName} URL is required`)
  }

  const trimmed = url.trim()

  // Parse URL
  let parsedURL
  try {
    parsedURL = new URL(trimmed)
  } catch (error) {
    throw new Error(`Invalid ${serviceName} URL format: ${error.message}`)
  }

  // Check protocol
  if (parsedURL.protocol !== 'https:' && parsedURL.protocol !== 'http:') {
    throw new Error(`Invalid ${serviceName} URL: must use http:// or https://`)
  }

  // Check hostname against allowed hosts
  const hostname = parsedURL.hostname
  const isAllowed = allowedHosts.some(allowedHost => {
    // Exact match
    if (hostname === allowedHost) return true
    // Subdomain match (e.g., project.supabase.co matches .supabase.co)
    if (allowedHost.startsWith('.') && hostname.endsWith(allowedHost)) return true
    // Subdomain match without leading dot
    if (hostname.endsWith('.' + allowedHost)) return true
    return false
  })

  if (!isAllowed) {
    throw new Error(
      `Invalid ${serviceName} URL: hostname "${hostname}" is not allowed. ` +
        `Expected one of: ${allowedHosts.join(', ')}`
    )
  }

  return trimmed
}

module.exports = {
  validateFilePath,
  validateEnvPath,
  validateReportPath,
  validateServiceURL
}
