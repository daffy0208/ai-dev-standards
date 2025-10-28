import { describe, it, expect } from 'vitest'

import { MCPIntegrator } from '../../../scripts/brain/mcp-integrator'
import type { MCP } from '../../../scripts/brain/knowledge-layer'

const mcps: MCP[] = [
  {
    id: 'test-mcp',
    name: 'Test MCP',
    description: 'A test MCP',
    category: 'testing',
    status: 'official',
    path: '/MCP/test-mcp'
  },
  {
    id: 'secondary-mcp',
    name: 'Secondary MCP',
    description: 'Another MCP',
    category: 'testing',
    status: 'community',
    path: '/MCP/secondary-mcp'
  }
]

const baseRelationship = {
  version: '1.0.0',
  skills: {
    'test-skill': {
      required_mcps: ['test-mcp'],
      required_tools: [],
      required_integrations: []
    }
  }
}

describe('MCPIntegrator warnings', () => {
  const createIntegrator = (relationshipOverrides?: Partial<typeof baseRelationship>) => {
    const merged = JSON.parse(JSON.stringify(baseRelationship))
    if (relationshipOverrides?.skills) {
      merged.skills = relationshipOverrides.skills
    }
    return new MCPIntegrator(mcps, merged)
  }

  it('does not warn when required MCP identifiers exist', () => {
    const integrator = createIntegrator()
    const result = integrator.integrate(['test-skill'])

    expect(result.warnings).toEqual([])
  })

  it('warns when required MCP identifiers are missing', () => {
    const integrator = createIntegrator({
      skills: {
        'test-skill': {
          required_mcps: ['missing-mcp'],
          required_tools: [],
          required_integrations: []
        }
      }
    })

    const result = integrator.integrate(['test-skill'])

    expect(result.warnings).toContain("MCP 'missing-mcp' is required but not yet implemented")
  })

  it('treats friendly MCP names as existing without triggering warnings', () => {
    const integrator = createIntegrator({
      skills: {
        'test-skill': {
          required_mcps: ['Test MCP'],
          required_tools: [],
          required_integrations: []
        }
      }
    })

    const result = integrator.integrate(['test-skill'])

    expect(result.warnings).toEqual([])
  })
})
