# Security Validation Quick Reference

## For Developers Adding New Generators

### Required Steps

1. **Import validation utilities:**

```javascript
const {
  sanitizeName, // Path traversal prevention
  validateIdentifier, // JavaScript identifier validation
  validateComponentName, // Component-specific validation
  toPascalCase, // Convert to PascalCase
  toSnakeCase, // Convert to snake_case
  toKebabCase // Convert to kebab-case
} = require('../utils/validation')
```

2. **Sanitize all user input:**

```javascript
// ALWAYS do this first
const sanitizedName = sanitizeName(name, 'resource type')
```

3. **Validate identifiers if used in code:**

```javascript
// For JavaScript/TypeScript classes or functions
validateIdentifier(identifier, 'context name')

// For Python (CrewAI) functions
validatePythonIdentifier(identifier, 'context name')
```

4. **Convert naming conventions as needed:**

```javascript
// For React components: kebab-case → PascalCase
const componentName = toPascalCase(sanitizedName)
validateIdentifier(componentName, 'component name')

// For Python tools: kebab-case → snake_case
const toolName = toSnakeCase(sanitizedName)
validatePythonIdentifier(toolName, 'tool name')
```

---

## Decision Tree

```
User Input Received
    ↓
[1] Call sanitizeName() ← ALWAYS DO THIS
    ↓
[2] Is name used in code as identifier?
    ├─ Yes → Convert case + validateIdentifier()
    └─ No  → Use sanitizedName directly
    ↓
[3] Use for file paths and code generation
```

---

## Generator Patterns

### Pattern 1: Directory Name Only (MCPs)

```javascript
// Name is only used for directories, not in code
const sanitizedName = sanitizeName(name, 'MCP server')

// Use directly in paths
path: `mcp-servers/${sanitizedName}-mcp/index.js`
```

### Pattern 2: Used in JavaScript Code (Components, Integrations)

```javascript
// Name is used in class names
const sanitizedName = sanitizeName(name, 'component')
const identifier = toPascalCase(sanitizedName)
validateIdentifier(identifier, 'component name')

// Use sanitizedName for paths, identifier for code
path: `components/${sanitizedName}/index.tsx`
code: `export class ${identifier} { ... }`
```

### Pattern 3: Multi-Language Support (Tools)

```javascript
const sanitizedName = sanitizeName(name, 'tool')

let identifier
if (framework === 'crewai') {
  identifier = toSnakeCase(sanitizedName)
  validatePythonIdentifier(identifier, 'tool name')
} else {
  identifier = toPascalCase(sanitizedName)
  validateIdentifier(identifier, 'tool name')
}
```

---

## Common Mistakes to Avoid

### ❌ DON'T: Skip sanitization

```javascript
// WRONG - directly use user input
path: `components/${name}/index.tsx`
```

### ✅ DO: Always sanitize first

```javascript
// CORRECT
const sanitizedName = sanitizeName(name, 'component')
path: `components/${sanitizedName}/index.tsx`
```

### ❌ DON'T: Validate before sanitizing

```javascript
// WRONG - validate raw input
validateIdentifier(name, 'component')
```

### ✅ DO: Sanitize then validate

```javascript
// CORRECT
const sanitizedName = sanitizeName(name, 'component')
const identifier = toPascalCase(sanitizedName)
validateIdentifier(identifier, 'component')
```

### ❌ DON'T: Use sanitizedName with hyphens as identifier

```javascript
// WRONG - hyphens are not valid in identifiers
const sanitizedName = sanitizeName('my-component', 'component')
validateIdentifier(sanitizedName) // Will fail!
```

### ✅ DO: Convert to appropriate case first

```javascript
// CORRECT
const sanitizedName = sanitizeName('my-component', 'component')
const identifier = toPascalCase(sanitizedName) // 'MyComponent'
validateIdentifier(identifier) // Pass!
```

---

## Validation Functions Reference

### sanitizeName(name, resourceType)

**Purpose:** Prevent path traversal attacks
**Checks:**

- Not empty
- Max 100 chars
- No `/` or `\`
- No `..`
- No leading `.`
- Only letters, numbers, `-`, `_`
- Must start with letter

**Use:** ALWAYS use this first for any user input

### validateIdentifier(identifier, context)

**Purpose:** Prevent code injection (JavaScript)
**Checks:**

- Valid JS identifier regex
- No reserved keywords (32 keywords)
- Can start with letter, `$`, or `_`
- Can contain letters, numbers, `$`, `_`

**Use:** When name is used in JavaScript/TypeScript code

### validatePythonIdentifier(identifier, context)

**Purpose:** Prevent code injection (Python)
**Checks:**

- Valid Python identifier regex
- No reserved keywords (35 keywords)
- Must start with letter or `_`
- Can contain letters, numbers, `_`

**Use:** When name is used in Python code (CrewAI tools)

### validateComponentName(name)

**Purpose:** React component validation
**Does:**

1. Calls `sanitizeName()`
2. Converts to PascalCase
3. Calls `validateIdentifier()`

**Use:** Shortcut for React components

### Case Conversion Functions

```javascript
toPascalCase('my-component') // 'MyComponent'
toSnakeCase('MyComponent') // 'my_component'
toKebabCase('MyComponent') // 'my-component'
```

---

## Error Messages

All validation functions throw clear errors:

```javascript
try {
  const sanitized = sanitizeName('../etc/passwd', 'component')
} catch (error) {
  // Error: Invalid component name: path separators (/ or \) are not allowed.
  // Use only letters, numbers, hyphens, and underscores.
}
```

---

## Testing Your Generator

### 1. Add security tests

```javascript
// In your generator test file
const generator = new YourGenerator()

// Test path traversal
expect(() => generator.generate({ name: '../../../etc/passwd' })).toThrow('path separators')

// Test code injection
expect(() => generator.generate({ name: 'class' })).toThrow('reserved keyword')
```

### 2. Add valid generation tests

```javascript
// Test legitimate use cases
const files = await generator.generate({ name: 'my-resource' })
expect(files.length).toBeGreaterThan(0)
```

### 3. Run existing test suites

```bash
node CLI/test-security.js
node CLI/test-valid-generation.js
```

---

## Security Checklist

When adding a new generator:

- [ ] Import validation utilities
- [ ] Call `sanitizeName()` on all user input
- [ ] Call appropriate validation for identifiers
- [ ] Convert case if needed (`toPascalCase`, `toSnakeCase`)
- [ ] Use sanitized names in file paths
- [ ] Use validated identifiers in code
- [ ] Add security tests for your generator
- [ ] Add valid generation tests
- [ ] Run full test suite
- [ ] Document any special handling

---

## Examples from Existing Generators

### Component Generator (Full Validation)

```javascript
const { sanitizeName, validateComponentName, validateIdentifier } = require('../utils/validation')

async generate(config) {
  const { name, props = {} } = config

  // Validate component name (includes PascalCase conversion)
  const sanitizedName = validateComponentName(name)

  // Validate prop names
  for (const propName of Object.keys(props)) {
    validateIdentifier(propName, `prop name "${propName}"`)
  }

  // Use in generation
  files.push({
    path: `components/${sanitizedName}/index.tsx`,
    content: this.generateComponent(sanitizedName, props)
  })
}
```

### MCP Generator (Directory Only)

```javascript
const { sanitizeName } = require('../utils/validation')

async generate(config) {
  const { name } = config

  // Only sanitize (name not used as identifier)
  const sanitizedName = sanitizeName(name, 'MCP server')

  // Use directly
  files.push({
    path: `mcp-servers/${sanitizedName}-mcp/index.js`,
    content: this.generateServer(sanitizedName)
  })
}
```

### Tool Generator (Multi-Language)

```javascript
const { sanitizeName, validateIdentifier, validatePythonIdentifier, toPascalCase, toSnakeCase } = require('../utils/validation')

async generate(config) {
  const { name, framework } = config

  const sanitizedName = sanitizeName(name, 'tool')

  // Language-specific handling
  let identifier
  if (framework === 'crewai') {
    identifier = toSnakeCase(sanitizedName)
    validatePythonIdentifier(identifier, 'tool name')
  } else {
    identifier = toPascalCase(sanitizedName)
    validateIdentifier(identifier, 'tool name')
  }

  // Use both
  files.push({
    path: `tools/${sanitizedName}-tool.ts`,
    content: this.generateTool(identifier, framework)
  })
}
```

---

## Need Help?

- **Full Documentation:** See `/CLI/utils/validation.js` for inline docs
- **Test Examples:** See `/CLI/test-security.js` for comprehensive examples
- **Security Report:** See `/SECURITY-TEST-REPORT.md` for detailed testing results

---

**Last Updated:** 2025-10-27
**Maintained By:** AI Dev Standards Security Team
