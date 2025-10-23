const Handlebars = require('handlebars')
const path = require('path')
const fs = require('fs-extra')
const prettier = require('prettier')

/**
 * Component Generator
 *
 * Generates React/Next.js components with:
 * - TypeScript interfaces
 * - Tailwind CSS styling
 * - Prop validation (Zod)
 * - Test files (Jest + React Testing Library)
 * - Storybook stories
 */
class ComponentGenerator {
  constructor() {
    this.registerHelpers()
  }

  /**
   * Register Handlebars helpers
   */
  registerHelpers() {
    Handlebars.registerHelper('capitalize', function(str) {
      return str.charAt(0).toUpperCase() + str.slice(1)
    })

    Handlebars.registerHelper('lowercase', function(str) {
      return str.toLowerCase()
    })

    Handlebars.registerHelper('kebabCase', function(str) {
      return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
    })
  }

  /**
   * Generate component files
   */
  async generate(config) {
    const { name, props = {}, withTests = true, withStorybook = false, template = 'default' } = config

    const files = []

    // Component file
    files.push({
      path: `components/${name}/${name}.tsx`,
      content: await this.formatCode(this.generateComponent(name, props))
    })

    // Index file
    files.push({
      path: `components/${name}/index.ts`,
      content: this.generateIndex(name)
    })

    // Test file
    if (withTests) {
      files.push({
        path: `components/${name}/${name}.test.tsx`,
        content: await this.formatCode(this.generateTest(name, props))
      })
    }

    // Storybook file
    if (withStorybook) {
      files.push({
        path: `components/${name}/${name}.stories.tsx`,
        content: await this.formatCode(this.generateStory(name, props))
      })
    }

    return files
  }

  /**
   * Generate component code
   */
  generateComponent(name, props) {
    const propNames = Object.keys(props)
    const hasProps = propNames.length > 0

    return `import { z } from 'zod'

const ${name.toLowerCase()}PropsSchema = z.object({
${Object.entries(props).map(([key, type]) => {
  if (type === 'string') {
    return `  ${key}: z.string()`
  } else if (type === 'number') {
    return `  ${key}: z.number()`
  } else if (type === 'boolean') {
    return `  ${key}: z.boolean().optional()`
  } else if (Array.isArray(type)) {
    return `  ${key}: z.enum([${type.map(v => `'${v}'`).join(', ')}]).optional()`
  } else if (type === 'ReactNode') {
    return `  ${key}: z.any()`
  } else if (type === 'function') {
    return `  ${key}: z.function().args(z.any()).returns(z.void()).optional()`
  }
  return `  ${key}: z.any()`
}).join(',\n')}
})

export type ${name}Props = z.infer<typeof ${name.toLowerCase()}PropsSchema>

export function ${name}(props: ${name}Props) {
  const validated = ${name.toLowerCase()}PropsSchema.parse(props)

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold">${name}</h3>
      {/* Add your component implementation here */}
    </div>
  )
}
`
  }

  /**
   * Generate index file
   */
  generateIndex(name) {
    return `export { ${name} } from './${name}'
export type { ${name}Props } from './${name}'
`
  }

  /**
   * Generate test file
   */
  generateTest(name, props) {
    return `import { render, screen } from '@testing-library/react'
import { ${name} } from './${name}'

describe('${name}', () => {
  it('renders without crashing', () => {
    render(<${name}${Object.keys(props).length > 0 ? ' {...mockProps}' : ''} />)
    expect(screen.getByText('${name}')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(
      <${name}${Object.keys(props).length > 0 ? ' {...mockProps}' : ''} className="custom-class" />
    )
    expect(container.firstChild).toHaveClass('custom-class')
  })
})

${Object.keys(props).length > 0 ? `const mockProps = {
${Object.entries(props).map(([key, type]) => {
  if (type === 'string') return `  ${key}: 'test-${key}'`
  if (type === 'number') return `  ${key}: 42`
  if (type === 'boolean') return `  ${key}: true`
  if (Array.isArray(type)) return `  ${key}: '${type[0]}'`
  if (type === 'function') return `  ${key}: jest.fn()`
  return `  ${key}: null`
}).join(',\n')}
}` : ''}
`
  }

  /**
   * Generate Storybook story
   */
  generateStory(name, props) {
    return `import type { Meta, StoryObj } from '@storybook/react'
import { ${name} } from './${name}'

const meta: Meta<typeof ${name}> = {
  title: 'Components/${name}',
  component: ${name},
  tags: ['autodocs'],
  argTypes: {
${Object.entries(props).map(([key, type]) => {
  if (Array.isArray(type)) {
    return `    ${key}: {
      control: 'select',
      options: [${type.map(v => `'${v}'`).join(', ')}]
    }`
  } else if (type === 'boolean') {
    return `    ${key}: { control: 'boolean' }`
  } else if (type === 'number') {
    return `    ${key}: { control: 'number' }`
  } else if (type === 'string') {
    return `    ${key}: { control: 'text' }`
  }
  return ''
}).filter(Boolean).join(',\n')}
  }
}

export default meta
type Story = StoryObj<typeof ${name}>

export const Default: Story = {
  args: {
${Object.entries(props).map(([key, type]) => {
  if (type === 'string') return `    ${key}: 'Example ${key}'`
  if (type === 'number') return `    ${key}: 42`
  if (type === 'boolean') return `    ${key}: false`
  if (Array.isArray(type)) return `    ${key}: '${type[0]}'`
  return ''
}).filter(Boolean).join(',\n')}
  }
}

${Array.isArray(props.variant) ? props.variant.map(variant => `
export const ${variant.charAt(0).toUpperCase() + variant.slice(1)}: Story = {
  args: {
    ...Default.args,
    variant: '${variant}'
  }
}`).join('\n') : ''}
`
  }

  /**
   * Format code with Prettier
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
      // If formatting fails, return unformatted code
      return code
    }
  }
}

module.exports = ComponentGenerator
