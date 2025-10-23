const prettier = require('prettier')

/**
 * Integration Generator
 *
 * Generates integrations for external services:
 * - Client code with TypeScript types
 * - Error handling
 * - Environment configuration
 * - Example usage
 */
class IntegrationGenerator {
  async generate(config) {
    const {
      name,
      provider = 'custom',
      withAuth = false,
      withRag = false,
      withTypes = true,
      withEnv = true
    } = config

    const files = []

    // Client file
    files.push({
      path: `integrations/${name}/${name}-client.ts`,
      content: await this.formatCode(this.generateClient(name, provider, withAuth))
    })

    // Types file
    if (withTypes) {
      files.push({
        path: `integrations/${name}/types.ts`,
        content: await this.formatCode(this.generateTypes(name, provider))
      })
    }

    // .env.example
    if (withEnv) {
      files.push({
        path: `integrations/${name}/.env.example`,
        content: this.generateEnvExample(name, provider)
      })
    }

    // Index file
    files.push({
      path: `integrations/${name}/index.ts`,
      content: this.generateIndex(name, withTypes)
    })

    // README
    files.push({
      path: `integrations/${name}/README.md`,
      content: this.generateReadme(name, provider, withAuth, withRag)
    })

    return files
  }

  /**
   * Generate client code
   */
  generateClient(name, provider, withAuth) {
    const className = name.charAt(0).toUpperCase() + name.slice(1) + 'Client'

    return `import { ${className}Config, ${className}Response } from './types'

export class ${className} {
  private apiKey: string
  private baseUrl: string

  constructor(config: ${className}Config) {
    this.apiKey = config.apiKey || process.env.${name.toUpperCase()}_API_KEY || ''
    this.baseUrl = config.baseUrl || process.env.${name.toUpperCase()}_API_URL || 'https://api.${name}.com'

    if (!this.apiKey) {
      throw new Error('${name} API key is required')
    }
  }

  /**
   * Make API request
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = \`\${this.baseUrl}\${endpoint}\`

    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': \`Bearer \${this.apiKey}\`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }))
      throw new Error(\`${name} API error: \${error.message}\`)
    }

    return response.json()
  }

  /**
   * Example method - customize based on your integration
   */
  async getData(id: string): Promise<${className}Response> {
    return this.request<${className}Response>(\`/data/\${id}\`)
  }

  /**
   * Example POST method
   */
  async createData(data: Partial<${className}Response>): Promise<${className}Response> {
    return this.request<${className}Response>('/data', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  /**
   * Example UPDATE method
   */
  async updateData(id: string, data: Partial<${className}Response>): Promise<${className}Response> {
    return this.request<${className}Response>(\`/data/\${id}\`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  /**
   * Example DELETE method
   */
  async deleteData(id: string): Promise<void> {
    await this.request<void>(\`/data/\${id}\`, {
      method: 'DELETE'
    })
  }

  ${withAuth ? `
  /**
   * Authenticate user
   */
  async authenticate(credentials: { email: string; password: string }) {
    return this.request<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    })
  }

  /**
   * Get current user
   */
  async getCurrentUser() {
    return this.request<any>('/auth/me')
  }
  ` : ''}
}

// Export singleton instance
export const ${name}Client = new ${className}({
  apiKey: process.env.${name.toUpperCase()}_API_KEY,
  baseUrl: process.env.${name.toUpperCase()}_API_URL
})
`
  }

  /**
   * Generate types
   */
  generateTypes(name, provider) {
    const className = name.charAt(0).toUpperCase() + name.slice(1) + 'Client'

    return `export interface ${className}Config {
  apiKey?: string
  baseUrl?: string
}

export interface ${className}Response {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  // Add more fields based on your API
  [key: string]: any
}

export interface ${className}Error {
  message: string
  code: string
  details?: any
}

export interface Paginated${className}Response {
  data: ${className}Response[]
  total: number
  page: number
  pageSize: number
}
`
  }

  /**
   * Generate .env.example
   */
  generateEnvExample(name, provider) {
    const prefix = name.toUpperCase()

    return `# ${name.charAt(0).toUpperCase() + name.slice(1)} Integration

${prefix}_API_KEY=your-api-key-here
${prefix}_API_URL=https://api.${name}.com

# Optional: Additional configuration
# ${prefix}_TIMEOUT=30000
# ${prefix}_RETRY_ATTEMPTS=3
`
  }

  /**
   * Generate index file
   */
  generateIndex(name, withTypes) {
    const className = name.charAt(0).toUpperCase() + name.slice(1) + 'Client'

    return `export { ${className}, ${name}Client } from './${name}-client'
${withTypes ? `export type * from './types'` : ''}
`
  }

  /**
   * Generate README
   */
  generateReadme(name, provider, withAuth, withRag) {
    const className = name.charAt(0).toUpperCase() + name.slice(1) + 'Client'

    return `# ${name.charAt(0).toUpperCase() + name.slice(1)} Integration

Integration for ${provider !== 'custom' ? provider : name} API.

## Installation

\`\`\`bash
# Add environment variables
cp integrations/${name}/.env.example .env.local
\`\`\`

## Configuration

Add to your \`.env.local\`:

\`\`\`bash
${name.toUpperCase()}_API_KEY=your-api-key-here
${name.toUpperCase()}_API_URL=https://api.${name}.com
\`\`\`

## Usage

\`\`\`typescript
import { ${name}Client } from './integrations/${name}'

// Get data
const data = await ${name}Client.getData('123')

// Create data
const newData = await ${name}Client.createData({
  name: 'Example',
  // ... other fields
})

// Update data
const updated = await ${name}Client.updateData('123', {
  name: 'Updated Name'
})

// Delete data
await ${name}Client.deleteData('123')
\`\`\`

${withAuth ? `
## Authentication

\`\`\`typescript
// Login
const { token, user } = await ${name}Client.authenticate({
  email: 'user@example.com',
  password: 'password'
})

// Get current user
const currentUser = await ${name}Client.getCurrentUser()
\`\`\`
` : ''}

## Error Handling

\`\`\`typescript
try {
  const data = await ${name}Client.getData('123')
} catch (error) {
  console.error('${name} error:', error.message)
}
\`\`\`

## Custom Instance

\`\`\`typescript
import { ${className} } from './integrations/${name}'

const customClient = new ${className}({
  apiKey: 'custom-api-key',
  baseUrl: 'https://custom-api.com'
})
\`\`\`

## TypeScript Types

All methods are fully typed. Import types:

\`\`\`typescript
import type {
  ${className}Config,
  ${className}Response,
  ${className}Error
} from './integrations/${name}'
\`\`\`
`
  }

  /**
   * Format code
   */
  async formatCode(code) {
    try {
      return await prettier.format(code, {
        parser: 'typescript',
        semi: false,
        singleQuote: true,
        trailingComma: 'es5',
        printWidth: 100
      })
    } catch (error) {
      return code
    }
  }
}

module.exports = IntegrationGenerator
