/**
 * INPUT VALIDATION UTILITIES
 *
 * Comprehensive input validation to prevent security vulnerabilities:
 * - Path traversal attacks
 * - Code injection
 * - Invalid identifiers
 * - File system security
 */

/**
 * Sanitize and validate resource names
 * Prevents path traversal attacks
 *
 * @param {string} name - User-provided name
 * @param {string} resourceType - Type of resource (for error messages)
 * @returns {string} - Sanitized name
 * @throws {Error} - If name is invalid
 */
function sanitizeName(name, resourceType = 'resource') {
  if (!name || typeof name !== 'string') {
    throw new Error(`${resourceType} name is required and must be a string`)
  }

  const trimmed = name.trim()

  if (trimmed.length === 0) {
    throw new Error(`${resourceType} name cannot be empty`)
  }

  if (trimmed.length > 100) {
    throw new Error(`${resourceType} name is too long (max 100 characters)`)
  }

  // Check for path separators (path traversal attack)
  if (trimmed.includes('/') || trimmed.includes('\\')) {
    throw new Error(
      `Invalid ${resourceType} name: path separators (/ or \\) are not allowed. ` +
        `Use only letters, numbers, hyphens, and underscores.`
    )
  }

  // Check for parent directory reference (path traversal)
  if (trimmed.includes('..')) {
    throw new Error(`Invalid ${resourceType} name: parent directory reference (..) is not allowed`)
  }

  // Check for hidden files
  if (trimmed.startsWith('.')) {
    throw new Error(`Invalid ${resourceType} name: names cannot start with a dot (hidden files)`)
  }

  // Validate allowed characters (alphanumeric, hyphen, underscore)
  const validNameRegex = /^[a-zA-Z0-9_-]+$/
  if (!validNameRegex.test(trimmed)) {
    throw new Error(
      `Invalid ${resourceType} name: use only letters (a-z, A-Z), numbers (0-9), hyphens (-), and underscores (_). ` +
        `Current name contains invalid characters: "${trimmed}"`
    )
  }

  // Must start with a letter
  if (!/^[a-zA-Z]/.test(trimmed)) {
    throw new Error(`Invalid ${resourceType} name: must start with a letter (a-z or A-Z)`)
  }

  return trimmed
}

/**
 * Validate JavaScript/TypeScript identifiers
 * Prevents code injection attacks
 *
 * @param {string} identifier - Identifier to validate
 * @param {string} context - Context for error messages
 * @returns {string} - Validated identifier
 * @throws {Error} - If identifier is invalid
 */
function validateIdentifier(identifier, context = 'identifier') {
  if (!identifier || typeof identifier !== 'string') {
    throw new Error(`${context} is required and must be a string`)
  }

  const trimmed = identifier.trim()

  // Check for empty
  if (trimmed.length === 0) {
    throw new Error(`${context} cannot be empty`)
  }

  // Check for valid JavaScript identifier
  // Must start with letter, $, or _
  // Can contain letters, numbers, $, or _
  const validIdentifierRegex = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/
  if (!validIdentifierRegex.test(trimmed)) {
    throw new Error(
      `Invalid ${context}: must be a valid JavaScript identifier. ` +
        `Start with a letter, $, or _, and contain only letters, numbers, $, or _. ` +
        `Got: "${trimmed}"`
    )
  }

  // Check for reserved keywords
  const reservedKeywords = [
    'break',
    'case',
    'catch',
    'class',
    'const',
    'continue',
    'debugger',
    'default',
    'delete',
    'do',
    'else',
    'export',
    'extends',
    'finally',
    'for',
    'function',
    'if',
    'import',
    'in',
    'instanceof',
    'let',
    'new',
    'return',
    'super',
    'switch',
    'this',
    'throw',
    'try',
    'typeof',
    'var',
    'void',
    'while',
    'with',
    'yield',
    'enum',
    'await',
    'implements',
    'interface',
    'package',
    'private',
    'protected',
    'public',
    'static'
  ]

  if (reservedKeywords.includes(trimmed.toLowerCase())) {
    throw new Error(`Invalid ${context}: "${trimmed}" is a reserved JavaScript keyword`)
  }

  return trimmed
}

/**
 * Validate component name specifically
 * Must be PascalCase for React components
 *
 * @param {string} name - Component name
 * @returns {string} - Validated component name
 * @throws {Error} - If name is invalid
 */
function validateComponentName(name) {
  const sanitized = sanitizeName(name, 'component')

  // Convert to PascalCase if needed
  const pascalCase = sanitized
    .split(/[-_]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('')

  // Validate it's a valid identifier
  validateIdentifier(pascalCase, 'component name')

  return pascalCase
}

/**
 * Validate framework name
 *
 * @param {string} framework - Framework name
 * @param {string[]} allowedFrameworks - List of allowed frameworks
 * @returns {string} - Validated framework
 * @throws {Error} - If framework is invalid
 */
function validateFramework(framework, allowedFrameworks) {
  if (!framework || typeof framework !== 'string') {
    throw new Error(`Framework is required. Allowed values: ${allowedFrameworks.join(', ')}`)
  }

  const trimmed = framework.trim().toLowerCase()

  if (!allowedFrameworks.includes(trimmed)) {
    throw new Error(
      `Invalid framework: "${framework}". ` + `Allowed values: ${allowedFrameworks.join(', ')}`
    )
  }

  return trimmed
}

/**
 * Validate project type
 *
 * @param {string} type - Project type
 * @param {string[]} allowedTypes - List of allowed types
 * @returns {string} - Validated type
 * @throws {Error} - If type is invalid
 */
function validateProjectType(type, allowedTypes) {
  if (!type || typeof type !== 'string') {
    throw new Error(`Project type is required. Allowed values: ${allowedTypes.join(', ')}`)
  }

  const trimmed = type.trim().toLowerCase()

  if (!allowedTypes.includes(trimmed)) {
    throw new Error(
      `Invalid project type: "${type}". ` + `Allowed values: ${allowedTypes.join(', ')}`
    )
  }

  return trimmed
}

/**
 * Validate Python identifier
 *
 * @param {string} identifier - Python identifier
 * @param {string} context - Context for error messages
 * @returns {string} - Validated identifier
 * @throws {Error} - If identifier is invalid
 */
function validatePythonIdentifier(identifier, context = 'identifier') {
  if (!identifier || typeof identifier !== 'string') {
    throw new Error(`${context} is required and must be a string`)
  }

  const trimmed = identifier.trim()

  // Python identifier: start with letter or _, contain letters, numbers, or _
  const validPythonRegex = /^[a-zA-Z_][a-zA-Z0-9_]*$/
  if (!validPythonRegex.test(trimmed)) {
    throw new Error(
      `Invalid Python ${context}: must start with a letter or underscore, ` +
        `and contain only letters, numbers, or underscores. Got: "${trimmed}"`
    )
  }

  // Python reserved keywords
  const pythonKeywords = [
    'False',
    'None',
    'True',
    'and',
    'as',
    'assert',
    'async',
    'await',
    'break',
    'class',
    'continue',
    'def',
    'del',
    'elif',
    'else',
    'except',
    'finally',
    'for',
    'from',
    'global',
    'if',
    'import',
    'in',
    'is',
    'lambda',
    'nonlocal',
    'not',
    'or',
    'pass',
    'raise',
    'return',
    'try',
    'while',
    'with',
    'yield'
  ]

  if (pythonKeywords.includes(trimmed)) {
    throw new Error(`Invalid Python ${context}: "${trimmed}" is a reserved Python keyword`)
  }

  return trimmed
}

/**
 * Convert kebab-case or snake_case to PascalCase
 *
 * @param {string} str - Input string
 * @returns {string} - PascalCase string
 */
function toPascalCase(str) {
  return str
    .split(/[-_]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('')
}

/**
 * Convert PascalCase or kebab-case to snake_case
 *
 * @param {string} str - Input string
 * @returns {string} - snake_case string
 */
function toSnakeCase(str) {
  return str
    .replace(/([A-Z])/g, '_$1')
    .toLowerCase()
    .replace(/^_/, '')
    .replace(/-/g, '_')
}

/**
 * Convert PascalCase or snake_case to kebab-case
 *
 * @param {string} str - Input string
 * @returns {string} - kebab-case string
 */
function toKebabCase(str) {
  return str
    .replace(/([A-Z])/g, '-$1')
    .toLowerCase()
    .replace(/^-/, '')
    .replace(/_/g, '-')
}

module.exports = {
  sanitizeName,
  validateIdentifier,
  validateComponentName,
  validateFramework,
  validateProjectType,
  validatePythonIdentifier,
  toPascalCase,
  toSnakeCase,
  toKebabCase
}
