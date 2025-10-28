import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest'
import fs from 'fs'
import path from 'path'
import os from 'os'
import { KnowledgeLayer } from '../../../scripts/brain/knowledge-layer'

const metaRelativePath = ['META']

const skillRegistry = {
  version: '1.0.0',
  last_updated: '2024-01-01',
  description: 'Test skills',
  skills: [
    {
      name: 'test-skill',
      description: 'A skill for testing',
      triggers: [],
      tags: [],
      category: 'testing',
      difficulty: 'beginner',
      estimated_time: '5m',
      path: '/SKILLS/test-skill',
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
}

const mcpRegistry = {
  version: '1.0.0',
  last_updated: '2024-01-01',
  description: 'Test MCPs',
  mcps: [
    {
      id: 'test-mcp',
      name: 'Test MCP',
      description: 'Test mcp',
      category: 'testing',
      status: 'official',
      path: '/MCP/test-mcp'
    }
  ],
  categories: []
}

const componentRegistry = {
  version: '1.0.0',
  last_updated: '2024-01-01',
  description: 'Test components',
  components: [
    {
      id: 'test-component',
      name: 'Test Component',
      category: 'testing',
      description: 'Component description',
      path: '/COMPONENTS/test-component',
      status: 'active'
    }
  ]
}

const toolRegistry = {
  version: '1.0.0',
  last_updated: '2024-01-01',
  description: 'Test tools',
  tools: [
    {
      id: 'test-tool',
      name: 'Test Tool',
      category: 'testing',
      description: 'Tool description',
      path: '/TOOLS/test-tool',
      status: 'active'
    }
  ]
}

const integrationRegistry = {
  version: '1.0.0',
  last_updated: '2024-01-01',
  description: 'Test integrations',
  integrations: [
    {
      id: 'test-integration',
      name: 'Test Integration',
      category: 'testing',
      description: 'Integration description',
      path: '/INTEGRATIONS/test-integration',
      status: 'active'
    }
  ]
}

const relationshipMapping = {
  version: '1.0.0',
  last_updated: '2024-01-01',
  description: 'Test relationships',
  skills: {
    'test-skill': {
      required_mcps: ['test-mcp'],
      required_tools: ['test-tool'],
      required_components: ['test-component'],
      required_integrations: ['test-integration'],
      supporting_scripts: []
    }
  }
}

const registryFiles: Record<string, unknown> = {
  'skill-registry.json': skillRegistry,
  'mcp-registry.json': mcpRegistry,
  'component-registry.json': componentRegistry,
  'tool-registry.json': toolRegistry,
  'integration-registry.json': integrationRegistry,
  'relationship-mapping.json': relationshipMapping
}

let tempRoot: string

const writeJson = (filePath: string, data: unknown) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
}

const setupRegistries = () => {
  const metaDir = path.join(tempRoot, ...metaRelativePath)
  fs.rmSync(metaDir, { recursive: true, force: true })
  fs.mkdirSync(metaDir, { recursive: true })

  for (const [fileName, data] of Object.entries(registryFiles)) {
    writeJson(path.join(metaDir, fileName), data)
  }
}

const createKnowledgeLayer = async () => {
  const layer = new KnowledgeLayer(tempRoot)
  await layer.loadRegistries()
  return layer
}

beforeAll(() => {
  tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'knowledge-layer-'))
})

beforeEach(() => {
  setupRegistries()
})

afterAll(() => {
  fs.rmSync(tempRoot, { recursive: true, force: true })
})

const getMetaPath = (fileName: string) => path.join(tempRoot, ...metaRelativePath, fileName)

describe('KnowledgeLayer registry aggregation', () => {
  it('computes repository totals from live registry counts', async () => {
    const layer = await createKnowledgeLayer()
    const state = layer.getRepositoryState()

    expect(state.skills).toBe(1)
    expect(state.mcps).toBe(1)
    expect(state.components).toBe(1)
    expect(state.tools).toBe(1)
    expect(state.integrations).toBe(1)

    const expectedTotal = state.skills + state.mcps + state.components + state.tools + state.integrations
    expect(state.totalResources).toBe(expectedTotal)

    const toolRegistryPath = getMetaPath('tool-registry.json')
    const updatedToolRegistry = JSON.parse(fs.readFileSync(toolRegistryPath, 'utf-8'))
    updatedToolRegistry.tools.push({
      id: 'second-tool',
      name: 'Second Tool',
      category: 'testing',
      description: 'Another tool',
      path: '/TOOLS/second-tool',
      status: 'active'
    })
    writeJson(toolRegistryPath, updatedToolRegistry)

    const updatedLayer = await createKnowledgeLayer()
    const updatedState = updatedLayer.getRepositoryState()

    expect(updatedState.tools).toBe(2)
    const updatedExpectedTotal =
      updatedState.skills +
      updatedState.mcps +
      updatedState.components +
      updatedState.tools +
      updatedState.integrations
    expect(updatedState.totalResources).toBe(updatedExpectedTotal)
  })

  it('validates tier-1 dependencies across tools, components, and integrations', async () => {
    const layer = await createKnowledgeLayer()
    expect(layer.validateRegistries().valid).toBe(true)

    const relationshipPath = getMetaPath('relationship-mapping.json')
    const modifiedRelationships = JSON.parse(fs.readFileSync(relationshipPath, 'utf-8'))
    modifiedRelationships.skills['test-skill'].required_tools.push('missing-tool')
    modifiedRelationships.skills['test-skill'].required_components.push('missing-component')
    modifiedRelationships.skills['test-skill'].required_integrations.push('missing-integration')
    writeJson(relationshipPath, modifiedRelationships)

    const layerWithMissing = await createKnowledgeLayer()
    const validation = layerWithMissing.validateRegistries()

    expect(validation.valid).toBe(false)
    expect(validation.errors).toContain("Required tool 'missing-tool' for skill 'test-skill' not found")
    expect(validation.errors).toContain("Required component 'missing-component' for skill 'test-skill' not found")
    expect(validation.errors).toContain("Required integration 'missing-integration' for skill 'test-skill' not found")
  })
})
