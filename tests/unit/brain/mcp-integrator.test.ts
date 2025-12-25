import { describe, expect, it } from 'vitest'
import { MCPIntegrator } from '../../../scripts/brain/mcp-integrator'
import { MCP } from '../../../scripts/brain/knowledge-layer'

const baseRelationship = {
  skills: {
    'data-engineer': {
      required_mcps: ['vector-database-mcp'],
      required_tools: [],
      required_integrations: []
    },
    'ml-engineer': {
      required_mcps: ['embedding-generator-mcp'],
      required_tools: [],
      required_integrations: []
    },
    'friendly-skill': {
      required_mcps: ['Vector Database MCP'],
      required_tools: [],
      required_integrations: []
    }
  }
}

describe('MCPIntegrator warnings', () => {
  const mcps: MCP[] = [
    {
      id: 'vector-database-mcp',
      name: 'Vector Database MCP',
      description: 'Vector database provider',
      category: 'data',
      status: 'official',
      path: '/mcp-servers/vector-database-mcp'
    }
  ]

  it('does not warn when required MCP identifiers exist in the registry', () => {
    const integrator = new MCPIntegrator(mcps, baseRelationship)
    const integration = integrator.integrate(['data-engineer'])

    expect(integration.warnings).toEqual([])
  })

  it('warns when required MCP identifiers are missing from the registry', () => {
    const integrator = new MCPIntegrator(mcps, baseRelationship)
    const integration = integrator.integrate(['ml-engineer'])

    expect(integration.warnings).toContain(
      "MCP 'Embedding Generator MCP' is required but not yet implemented"
    )
  })

  it('uses MCP identifiers for existence checks while accepting friendly names', () => {
    const integrator = new MCPIntegrator(mcps, baseRelationship)
    const integration = integrator.integrate(['friendly-skill'])

    expect(integration.warnings).toEqual([])
  })
})
