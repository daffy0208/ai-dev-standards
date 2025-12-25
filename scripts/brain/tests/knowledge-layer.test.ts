import { describe, expect, it } from 'vitest'
import * as fs from 'fs'
import * as path from 'path'
import os from 'os'
import { KnowledgeLayer } from '../knowledge-layer'

interface Registries {
  skillRegistry: any
  mcpRegistry: any
  toolRegistry: any
  componentRegistry: any
  integrationRegistry: any
  relationshipMapping: any
}

function createBaseRegistries(): Registries {
  return {
    skillRegistry: {
      version: '1.0.0',
      last_updated: '2024-01-01',
      description: 'Test skill registry',
      skills: [
        {
          name: 'demo-skill',
          description: 'Demo skill',
          triggers: ['demo'],
          tags: ['demo'],
          category: 'demo',
          difficulty: 'beginner',
          estimated_time: '5m',
          path: 'skills/demo-skill.md',
          status: 'active',
          prerequisites: [],
          related_skills: [],
          frameworks: [],
          languages: []
        },
        {
          name: 'second-skill',
          description: 'Second skill',
          triggers: ['second'],
          tags: ['second'],
          category: 'demo',
          difficulty: 'intermediate',
          estimated_time: '10m',
          path: 'skills/second-skill.md',
          status: 'active',
          prerequisites: [],
          related_skills: [],
          frameworks: [],
          languages: []
        }
      ],
      categories: [],
      difficulty_levels: [],
      usage_notes: {}
    },
    mcpRegistry: {
      version: '1.0.0',
      last_updated: '2024-01-01',
      description: 'Test MCP registry',
      mcps: [
        {
          id: 'demo-mcp',
          name: 'Demo MCP',
          description: 'Demo MCP',
          category: 'demo',
          status: 'active',
          path: 'MCP/demo-mcp.md'
        }
      ],
      categories: []
    },
    toolRegistry: {
      version: '1.0.0',
      last_updated: '2024-01-01',
      description: 'Test tool registry',
      tools: [
        { id: 'tool-one', name: 'Tool One' },
        { id: 'tool-two', name: 'Tool Two' },
        { id: 'tool-three', name: 'Tool Three' }
      ],
      total_tools: 3,
      total_scripts: 0
    },
    componentRegistry: {
      version: '1.0.0',
      last_updated: '2024-01-01',
      description: 'Test component registry',
      components: [{ id: 'component-alpha', name: 'Component Alpha' }],
      total_components: 1
    },
    integrationRegistry: {
      version: '1.0.0',
      last_updated: '2024-01-01',
      description: 'Test integration registry',
      integrations: [
        { id: 'integration-alpha', name: 'Integration Alpha' },
        { id: 'integration-beta', name: 'Integration Beta' }
      ],
      total_integrations: 2
    },
    relationshipMapping: {
      version: '1.0.0',
      last_updated: '2024-01-01',
      description: 'Test relationship mapping',
      skills: {
        'demo-skill': {
          required_mcps: ['demo-mcp'],
          required_tools: ['tool-one'],
          required_components: ['component-alpha'],
          required_integrations: ['integration-alpha'],
          supporting_scripts: []
        },
        'second-skill': {
          required_mcps: ['demo-mcp'],
          required_tools: ['tool-two'],
          required_components: [],
          required_integrations: ['integration-beta'],
          supporting_scripts: []
        }
      }
    }
  }
}

function createTestEnvironment(customize?: (registries: Registries) => void) {
  const registries = createBaseRegistries()
  customize?.(registries)

  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'knowledge-layer-'))
  const metaDir = path.join(root, 'META')
  fs.mkdirSync(metaDir)

  const files: Record<string, any> = {
    'skill-registry.json': registries.skillRegistry,
    'mcp-registry.json': registries.mcpRegistry,
    'tool-registry.json': registries.toolRegistry,
    'component-registry.json': registries.componentRegistry,
    'integration-registry.json': registries.integrationRegistry,
    'relationship-mapping.json': registries.relationshipMapping
  }

  for (const [filename, content] of Object.entries(files)) {
    fs.writeFileSync(path.join(metaDir, filename), JSON.stringify(content, null, 2), 'utf-8')
  }

  return { root, registries }
}

describe('KnowledgeLayer registry integration', () => {
  it('calculates total resources using dynamic registry counts', async () => {
    const { root } = createTestEnvironment()
    const layer = new KnowledgeLayer(root)

    await layer.loadRegistries()
    const initialState = layer.getRepositoryState()
    expect(initialState.skills).toBe(2)
    expect(initialState.mcps).toBe(1)
    expect(initialState.totalResources).toBe(9)

    const toolRegistryPath = path.join(root, 'META', 'tool-registry.json')
    const toolRegistry = JSON.parse(fs.readFileSync(toolRegistryPath, 'utf-8'))
    toolRegistry.tools.push({ id: 'tool-four', name: 'Tool Four' })
    fs.writeFileSync(toolRegistryPath, JSON.stringify(toolRegistry, null, 2), 'utf-8')

    await layer.loadRegistries()
    const updatedState = layer.getRepositoryState()
    expect(updatedState.totalResources).toBe(10)
  })

  it('fails validation when required resources are missing', async () => {
    const { root } = createTestEnvironment(registries => {
      registries.relationshipMapping.skills['demo-skill'].required_tools.push('missing-tool')
      registries.relationshipMapping.skills['demo-skill'].required_components.push(
        'missing-component'
      )
      registries.relationshipMapping.skills['demo-skill'].required_integrations.push(
        'missing-integration'
      )
    })

    const layer = new KnowledgeLayer(root)
    await layer.loadRegistries()

    const validation = layer.validateRegistries()
    expect(validation.valid).toBe(false)
    expect(validation.errors).toContain(
      "Required tool 'missing-tool' for skill 'demo-skill' not found in tool registry"
    )
    expect(validation.errors).toContain(
      "Required component 'missing-component' for skill 'demo-skill' not found in component registry"
    )
    expect(validation.errors).toContain(
      "Required integration 'missing-integration' for skill 'demo-skill' not found in integration registry"
    )
  })
})
