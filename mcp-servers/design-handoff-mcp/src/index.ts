#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema
} from '@modelcontextprotocol/sdk/types.js'

interface DesignSpec {
  id: string
  component: string
  dimensions: { width: number; height: number }
  colors: string[]
  typography: any[]
  spacing: any[]
  assets: string[]
  timestamp: string
}

const designSpecs: DesignSpec[] = []

const server = new Server(
  { name: 'design-handoff-mcp', version: '1.0.0' },
  { capabilities: { tools: {}, resources: {} } }
)

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'extractSpecs',
      description: 'Extract detailed specifications from design file (Figma, Sketch, Adobe XD)',
      inputSchema: {
        type: 'object',
        properties: {
          designFile: {
            type: 'string',
            description: 'URL or path to design file'
          },
          componentName: {
            type: 'string',
            description: 'Specific component to extract (optional, extracts all if omitted)'
          },
          includeAnnotations: {
            type: 'boolean',
            description: 'Include designer annotations and comments'
          },
          format: {
            type: 'string',
            enum: ['json', 'markdown', 'html'],
            description: 'Output format'
          }
        },
        required: ['designFile']
      }
    },
    {
      name: 'generateCode',
      description: 'Generate code for a component from design specifications',
      inputSchema: {
        type: 'object',
        properties: {
          component: {
            type: 'string',
            description: 'Component name or specification ID'
          },
          framework: {
            type: 'string',
            enum: ['react', 'vue', 'svelte', 'angular', 'html', 'react-native'],
            description: 'Target framework'
          },
          styleApproach: {
            type: 'string',
            enum: ['css-modules', 'styled-components', 'tailwind', 'emotion', 'sass'],
            description: 'Styling approach'
          },
          typescript: {
            type: 'boolean',
            description: 'Generate TypeScript code'
          },
          responsive: {
            type: 'boolean',
            description: 'Include responsive breakpoints'
          }
        },
        required: ['component', 'framework']
      }
    },
    {
      name: 'compareDesignVsCode',
      description: 'Compare implemented code against design specifications',
      inputSchema: {
        type: 'object',
        properties: {
          designFile: {
            type: 'string',
            description: 'URL or path to design file'
          },
          codeFile: {
            type: 'string',
            description: 'Path to implemented component code'
          },
          checkAspects: {
            type: 'array',
            items: {
              type: 'string',
              enum: ['colors', 'typography', 'spacing', 'dimensions', 'layout']
            },
            description: 'Aspects to compare'
          },
          tolerance: {
            type: 'number',
            description: 'Tolerance for numeric differences (in pixels)'
          }
        },
        required: ['designFile', 'codeFile']
      }
    },
    {
      name: 'generateStyleGuide',
      description: 'Generate comprehensive style guide documentation from design file',
      inputSchema: {
        type: 'object',
        properties: {
          designFile: {
            type: 'string',
            description: 'URL or path to design file'
          },
          sections: {
            type: 'array',
            items: {
              type: 'string',
              enum: ['colors', 'typography', 'components', 'spacing', 'icons', 'patterns']
            },
            description: 'Sections to include'
          },
          format: {
            type: 'string',
            enum: ['markdown', 'html', 'pdf', 'storybook'],
            description: 'Output format'
          }
        },
        required: ['designFile']
      }
    }
  ]
}))

server.setRequestHandler(CallToolRequestSchema, async request => {
  try {
    const { name, arguments: args } = request.params

    switch (name) {
      case 'extractSpecs': {
        const {
          designFile,
          componentName,
          includeAnnotations = true,
          format = 'json'
        } = args as any

        if (!designFile) {
          throw new Error('Missing required argument: designFile')
        }

        const spec: DesignSpec = {
          id: `spec-${Date.now()}`,
          component: componentName || 'All Components',
          dimensions: { width: 375, height: 812 },
          colors: ['#4F46E5', '#EC4899', '#10B981'],
          typography: [
            { element: 'h1', size: '2rem', weight: 700, lineHeight: 1.2 },
            { element: 'body', size: '1rem', weight: 400, lineHeight: 1.5 }
          ],
          spacing: [
            { element: 'padding', value: '1rem' },
            { element: 'margin', value: '1.5rem' }
          ],
          assets: ['logo.svg', 'icon-home.svg'],
          timestamp: new Date().toISOString()
        }

        designSpecs.push(spec)

        const result = {
          success: true,
          message: 'Design specifications extracted',
          data: { spec, format, includeAnnotations },
          note: 'Configure design tool API access for real extraction'
        }

        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
        }
      }

      case 'generateCode': {
        const {
          component,
          framework,
          styleApproach = 'css-modules',
          typescript = false,
          responsive = true
        } = args as any

        if (!component || !framework) {
          throw new Error('Missing required arguments: component, framework')
        }

        const ext = typescript
          ? framework === 'react'
            ? 'tsx'
            : 'ts'
          : framework === 'react'
            ? 'jsx'
            : 'js'
        const code = generateComponentCode(
          component,
          framework,
          styleApproach,
          typescript,
          responsive
        )

        const result = {
          success: true,
          message: 'Component code generated',
          data: {
            component,
            framework,
            styleApproach,
            typescript,
            responsive,
            files: [
              { name: `${component}.${ext}`, code: code.component },
              { name: `${component}.module.css`, code: code.styles }
            ]
          },
          note: 'This is generated boilerplate. Refine based on exact design specs.'
        }

        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
        }
      }

      case 'compareDesignVsCode': {
        const {
          designFile,
          codeFile,
          checkAspects = ['colors', 'typography', 'spacing'],
          tolerance = 2
        } = args as any

        if (!designFile || !codeFile) {
          throw new Error('Missing required arguments: designFile, codeFile')
        }

        const differences = [
          {
            aspect: 'colors',
            issue: 'Primary color: Design #4F46E5 vs Code #4F45E5',
            severity: 'minor'
          },
          { aspect: 'spacing', issue: 'Padding: Design 16px vs Code 18px', severity: 'minor' },
          { aspect: 'typography', issue: 'Font weight: Design 600 vs Code 700', severity: 'medium' }
        ]

        const result = {
          success: true,
          message: `Found ${differences.length} differences`,
          data: {
            designFile,
            codeFile,
            checkAspects,
            tolerance,
            differences,
            match: differences.length === 0,
            accuracy: `${(100 - differences.length * 5).toFixed(1)}%`
          },
          note: 'Configure design tool access and provide actual code file for real comparison'
        }

        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
        }
      }

      case 'generateStyleGuide': {
        const {
          designFile,
          sections = ['colors', 'typography', 'components', 'spacing'],
          format = 'markdown'
        } = args as any

        if (!designFile) {
          throw new Error('Missing required argument: designFile')
        }

        const styleGuide = generateStyleGuideContent(sections, format)

        const result = {
          success: true,
          message: 'Style guide generated',
          data: {
            designFile,
            sections,
            format,
            content: styleGuide,
            fileName: `style-guide.${format === 'html' ? 'html' : 'md'}`
          },
          note: 'Configure design tool access for comprehensive style guide'
        }

        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
        }
      }

      default:
        throw new Error(`Unknown tool: ${name}`)
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error instanceof Error ? error.message : String(error)}`
        }
      ],
      isError: true
    }
  }
})

server.setRequestHandler(ListResourcesRequestSchema, async () => ({
  resources: [
    {
      uri: 'design-handoff://specs',
      name: 'Extracted Design Specs',
      description: 'All extracted design specifications',
      mimeType: 'application/json'
    },
    {
      uri: 'design-handoff://workflow',
      name: 'Design Handoff Workflow',
      description: 'Best practices for design-to-development handoff',
      mimeType: 'text/plain'
    }
  ]
}))

server.setRequestHandler(ReadResourceRequestSchema, async request => {
  const { uri } = request.params

  if (uri === 'design-handoff://specs') {
    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify({ specs: designSpecs, count: designSpecs.length }, null, 2)
        }
      ]
    }
  }

  if (uri === 'design-handoff://workflow') {
    const workflow = `Design Handoff Workflow
========================

Phase 1: Design Review
- Review design in tool (Figma, Sketch, XD)
- Check for missing states (hover, active, disabled)
- Verify responsive breakpoints
- Confirm color/typography tokens
- Review annotations and comments

Phase 2: Extract Specifications
- Use extractSpecs tool
- Document all measurements
- Export assets at correct sizes
- List all states and variants
- Note interaction patterns

Phase 3: Generate Code
- Use generateCode tool
- Choose appropriate framework
- Select styling approach
- Generate component structure
- Implement responsiveness

Phase 4: Implementation
- Code component from specs
- Apply design tokens
- Handle all states
- Implement interactions
- Add accessibility

Phase 5: Quality Assurance
- Use compareDesignVsCode tool
- Visual QA against design
- Test all breakpoints
- Verify colors and spacing
- Check typography

Phase 6: Documentation
- Generate style guide
- Document component API
- Add usage examples
- Create Storybook stories
- Update design system

Best Practices:
1. Start with mobile design
2. Use design tokens, not hard-coded values
3. Implement all states (not just default)
4. Test with real content
5. Ensure accessibility
6. Document deviations from design
7. Maintain design-code sync

Common Issues:
- Missing hover/focus states
- Incorrect spacing
- Wrong font weights
- Color mismatches
- Missing responsive behavior
- Accessibility gaps

Tools Integration:
- Figma: Use Figma API
- Sketch: Use Sketch API or plugins
- Adobe XD: Use XD plugins
- Zeplin: Use Zeplin API
- InVision: Use InVision DSM

Handoff Checklist:
□ All components documented
□ Design tokens exported
□ Assets at all sizes
□ Responsive specs defined
□ Interactions documented
□ Accessibility notes
□ Browser requirements
□ Performance targets
`
    return {
      contents: [
        {
          uri,
          mimeType: 'text/plain',
          text: workflow
        }
      ]
    }
  }

  throw new Error(`Unknown resource: ${uri}`)
})

function generateComponentCode(
  name: string,
  framework: string,
  styleApproach: string,
  typescript: boolean,
  responsive: boolean
): { component: string; styles: string } {
  const tsType = typescript ? ': React.FC<{}>  ' : ''

  const reactCode = `import React from 'react';
import styles from './${name}.module.css';

${typescript ? 'interface Props {}' : ''}

export const ${name}${tsType} = (${typescript ? 'props: Props' : ''}) => {
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>${name}</h2>
    </div>
  );
};`

  const css = `.container {
  padding: 1rem;
  ${responsive ? '\n  @media (min-width: 768px) {\n    padding: 2rem;\n  }' : ''}
}

.title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-primary);
}`

  return { component: reactCode, styles: css }
}

function generateStyleGuideContent(sections: string[], format: string): string {
  if (format === 'markdown') {
    return `# Design System Style Guide

## Colors
- Primary: #4F46E5
- Secondary: #EC4899
- Success: #10B981

## Typography
- Heading: 2rem / 700
- Body: 1rem / 400

## Components
- Button: See component library
- Card: See component library

## Spacing
- Base unit: 0.25rem (4px)
- Scale: 4, 8, 12, 16, 24, 32, 48, 64
`
  }
  return 'Style guide content'
}

async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
  console.error('design-handoff-mcp v1.0.0 running on stdio')
}

main().catch(error => {
  console.error('Server error:', error)
  process.exit(1)
})
