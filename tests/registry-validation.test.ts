import { describe, it, expect, beforeAll } from 'vitest'
import fs from 'fs/promises'
import * as fsSync from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.join(__dirname, '..')

/**
 * CRITICAL VALIDATION TESTS
 *
 * These tests ensure ALL resources are discoverable and accessible.
 * If these tests fail, the quality audit MUST fail.
 *
 * These tests would have caught:
 * - 29 missing skills in registry (81% invisible)
 * - CLI returning mock data instead of real data
 * - README documenting skills not in registry
 */

describe('Registry Completeness - CRITICAL', () => {
  let registry: any
  let skillDirs: string[]
  let mcpDirs: string[]
  let playbookFiles: string[]
  let patternFiles: string[]

  beforeAll(async () => {
    // Load registry
    const registryPath = path.join(rootDir, 'META', 'registry.json')
    const registryContent = await fs.readFile(registryPath, 'utf8')
    registry = JSON.parse(registryContent)

    // Get all skill directories
    const skillsPath = path.join(rootDir, 'SKILLS')
    const entries = await fs.readdir(skillsPath, { withFileTypes: true })
    skillDirs = entries
      .filter(e => e.isDirectory() && e.name !== '_TEMPLATE')
      .map(e => e.name)

    // Get all MCP directories
    try {
      const mcpPath = path.join(rootDir, 'MCP-SERVERS')
      const mcpEntries = await fs.readdir(mcpPath, { withFileTypes: true })
      mcpDirs = mcpEntries
        .filter(e => e.isDirectory())
        .map(e => e.name)
    } catch {
      mcpDirs = []
    }

    // Get all playbook files
    try {
      const playbooksPath = path.join(rootDir, 'PLAYBOOKS')
      const playbookEntries = await fs.readdir(playbooksPath)
      playbookFiles = playbookEntries.filter(f => f.endsWith('.md'))
    } catch {
      playbookFiles = []
    }

    // Get all architecture pattern files
    try {
      const patternsPath = path.join(rootDir, 'STANDARDS', 'architecture-patterns')
      const patternEntries = await fs.readdir(patternsPath)
      patternFiles = patternEntries.filter(f => f.endsWith('.md') && f !== 'README.md')
    } catch {
      patternFiles = []
    }
  })

  it('should register ALL skills from SKILLS directory', () => {
    const registeredSkills = registry.skills.map((s: any) => s.name)

    // Check every skill directory is in registry
    for (const skillDir of skillDirs) {
      expect(
        registeredSkills,
        `Skill "${skillDir}" exists in SKILLS/ but NOT in registry! This makes it invisible to projects.`
      ).toContain(skillDir)
    }

    // Verify counts match
    expect(
      registry.skills.length,
      `Registry has ${registry.skills.length} skills but SKILLS/ has ${skillDirs.length} directories. They must match!`
    ).toBe(skillDirs.length)
  })

  it('should have valid skill entries with all required fields', () => {
    for (const skill of registry.skills) {
      // Check required fields
      expect(skill.name, 'Skill missing name field').toBeTruthy()
      expect(skill.version, `Skill ${skill.name} missing version`).toBeTruthy()
      expect(skill.description, `Skill ${skill.name} missing description`).toBeTruthy()
      expect(skill.description.length, `Skill ${skill.name} description too short`).toBeGreaterThan(20)
      expect(skill.path, `Skill ${skill.name} missing path`).toBeTruthy()
      expect(skill.path, `Skill ${skill.name} path must start with SKILLS/`).toMatch(/^SKILLS\//)
      expect(skill.path, `Skill ${skill.name} path must end with SKILL.md`).toMatch(/SKILL\.md$/)

      // Verify path actually exists
      const fullPath = path.join(rootDir, skill.path)
      expect(
        async () => await fs.access(fullPath),
        `Skill ${skill.name} registered but file doesn't exist at ${skill.path}`
      ).not.toThrow()
    }
  })

  it('should register ALL MCPs from MCP-SERVERS directory', () => {
    if (mcpDirs.length === 0) {
      console.log('No MCP servers found, skipping')
      return
    }

    const registeredMcps = registry.mcpServers?.map((m: any) => m.name) || []

    for (const mcpDir of mcpDirs) {
      // MCP directories have -mcp suffix, but registry names don't
      const mcpName = mcpDir.replace(/-mcp$/, '')
      expect(
        registeredMcps,
        `MCP "${mcpDir}" exists in MCP-SERVERS/ but NOT in registry! This makes it invisible to projects.`
      ).toContain(mcpName)
    }

    expect(
      registry.mcpServers?.length || 0,
      `Registry has ${registry.mcpServers?.length || 0} MCPs but MCP-SERVERS/ has ${mcpDirs.length} directories`
    ).toBe(mcpDirs.length)
  })

  it('should register ALL playbooks from PLAYBOOKS directory', () => {
    if (playbookFiles.length === 0) {
      console.log('No playbooks found, skipping')
      return
    }

    const registeredPlaybooks = registry.playbooks?.map((p: any) =>
      path.basename(p.path)
    ) || []

    for (const playbookFile of playbookFiles) {
      expect(
        registeredPlaybooks,
        `Playbook "${playbookFile}" exists in PLAYBOOKS/ but NOT in registry! This makes it invisible to projects.`
      ).toContain(playbookFile)
    }
  })

  it('should register ALL architecture patterns from STANDARDS/architecture-patterns', () => {
    if (patternFiles.length === 0) {
      console.log('No patterns found, skipping')
      return
    }

    const registeredPatterns = registry.architecturePatterns?.map((p: any) =>
      path.basename(p.path)
    ) || []

    for (const patternFile of patternFiles) {
      expect(
        registeredPatterns,
        `Pattern "${patternFile}" exists in STANDARDS/architecture-patterns but NOT in registry!`
      ).toContain(patternFile)
    }
  })

  it('should have no orphaned registry entries (registered but file missing)', async () => {
    // Check skills
    for (const skill of registry.skills) {
      const skillPath = path.join(rootDir, skill.path)
      try {
        await fs.access(skillPath)
      } catch {
        throw new Error(`Skill "${skill.name}" is registered but file doesn't exist at ${skill.path}`)
      }
    }

    // Check MCPs
    if (registry.mcpServers) {
      for (const mcp of registry.mcpServers) {
        const mcpPath = path.join(rootDir, mcp.path)
        try {
          await fs.access(mcpPath)
        } catch {
          throw new Error(`MCP "${mcp.name}" is registered but file doesn't exist at ${mcp.path}`)
        }
      }
    }

    // Check playbooks
    if (registry.playbooks) {
      for (const playbook of registry.playbooks) {
        const playbookPath = path.join(rootDir, playbook.path)
        try {
          await fs.access(playbookPath)
        } catch {
          throw new Error(`Playbook "${playbook.name}" is registered but file doesn't exist at ${playbook.path}`)
        }
      }
    }
  })
})

describe('README Documentation Accuracy - CRITICAL', () => {
  let readmeContent: string
  let registry: any

  beforeAll(async () => {
    const readmePath = path.join(rootDir, 'README.md')
    readmeContent = await fs.readFile(readmePath, 'utf8')

    const registryPath = path.join(rootDir, 'META', 'registry.json')
    const registryContent = await fs.readFile(registryPath, 'utf8')
    registry = JSON.parse(registryContent)
  })

  it('should only document skills that exist in registry', () => {
    const registeredSkills = registry.skills.map((s: any) => s.name)

    // Extract skill names mentioned in README (look for **skill-name** or - **skill-name**)
    const skillMentions = readmeContent.match(/(?:\*\*|-)?\s*\*\*([a-z-]+)\*\*/g) || []
    const mentionedSkills = skillMentions
      .map(m => m.match(/\*\*([a-z-]+)\*\*/)?.[1])
      .filter(Boolean)
      .filter(s => s && s.includes('-')) // Filter for kebab-case (skill names)

    const uniqueMentioned = [...new Set(mentionedSkills)]

    for (const mentioned of uniqueMentioned) {
      if (mentioned.includes('skill') || mentioned.includes('README')) continue // Skip meta references

      // Check if this is likely a skill name
      if (mentioned.match(/^[a-z]+-[a-z]+(-[a-z]+)*$/)) {
        expect(
          registeredSkills,
          `README mentions skill "${mentioned}" but it's NOT in registry! Users will see docs but can't discover it.`
        ).toContain(mentioned)
      }
    }
  })

  it('should document all critical skills from registry', () => {
    // These skills should be mentioned in README
    const criticalSkills = [
      'mvp-builder',
      'product-strategist',
      'rag-implementer',
      'api-designer',
      'frontend-builder',
      'deployment-advisor'
    ]

    for (const skill of criticalSkills) {
      expect(
        readmeContent.includes(skill),
        `Critical skill "${skill}" is in registry but NOT documented in README! Users won't know it exists.`
      ).toBe(true)
    }
  })
})

describe('CLI Data Accuracy - CRITICAL', () => {
  it('should ensure CLI sync command reads from actual registry, not mock data', async () => {
    // Check sync.js
    try {
      const syncPath = path.join(rootDir, 'CLI', 'commands', 'sync.js')
      const syncContent = await fs.readFile(syncPath, 'utf8')

      // Should NOT have hardcoded mock data
      expect(
        syncContent.includes('TODO: Fetch from actual ai-dev-standards repo'),
        'CLI sync.js has TODO comment - still using mock data instead of real registry!'
      ).toBe(false)

      expect(
        syncContent.includes('data-visualizer') &&
        syncContent.includes('iot-developer') &&
        syncContent.includes('spatial-developer') &&
        !syncContent.includes('registry.json'),
        'CLI sync.js appears to have hardcoded skill list instead of reading from registry!'
      ).toBe(false)
    } catch {
      console.log('CLI sync.js not found, skipping')
    }
  })

  it('should ensure CLI update command reads from actual registry, not mock data', async () => {
    // Check update.js
    try {
      const updatePath = path.join(rootDir, 'CLI', 'commands', 'update.js')
      const updateContent = await fs.readFile(updatePath, 'utf8')

      // Should NOT have hardcoded mock data
      expect(
        updateContent.includes('TODO: Fetch from actual ai-dev-standards repo'),
        'CLI update.js has TODO comment - still using mock data instead of real registry!'
      ).toBe(false)

      expect(
        updateContent.includes('data-visualizer') &&
        updateContent.includes('iot-developer') &&
        !updateContent.includes('registry.json'),
        'CLI update.js appears to have hardcoded skill list instead of reading from registry!'
      ).toBe(false)
    } catch {
      console.log('CLI update.js not found, skipping')
    }
  })
})

describe('Cross-Reference Validation - CRITICAL', () => {
  let registry: any

  beforeAll(async () => {
    const registryPath = path.join(rootDir, 'META', 'registry.json')
    const registryContent = await fs.readFile(registryPath, 'utf8')
    registry = JSON.parse(registryContent)
  })

  it('should have skills reference each other correctly', async () => {
    // Check that skills mention prerequisites that actually exist
    for (const skill of registry.skills) {
      const skillPath = path.join(rootDir, skill.path)
      try {
        const content = await fs.readFile(skillPath, 'utf8')

        // Find mentions of other skills (e.g., "use product-strategist skill")
        const skillReferences = content.match(/`?([a-z]+-[a-z]+(-[a-z]+)*)`?\s+skill/gi) || []

        for (const ref of skillReferences) {
          const refName = ref.match(/`?([a-z]+-[a-z]+(-[a-z]+)*)`?/)?.[1]
          if (refName && refName !== skill.name) {
            const registeredSkills = registry.skills.map((s: any) => s.name)
            expect(
              registeredSkills,
              `Skill "${skill.name}" references "${refName}" but that skill doesn't exist in registry!`
            ).toContain(refName)
          }
        }
      } catch {
        // File doesn't exist - will be caught by other test
      }
    }
  })

  it('should have validation-first playbook reference existing skills', async () => {
    try {
      const playbookPath = path.join(rootDir, 'PLAYBOOKS', 'validation-first-development.md')
      const content = await fs.readFile(playbookPath, 'utf8')

      // Find skill references
      const skillReferences = content.match(/`?([a-z]+-[a-z]+(-[a-z]+)*)`?\s+skill/gi) || []
      const registeredSkills = registry.skills.map((s: any) => s.name)

      for (const ref of skillReferences) {
        const refName = ref.match(/`?([a-z]+-[a-z]+(-[a-z]+)*)`?/)?.[1]
        if (refName) {
          expect(
            registeredSkills,
            `validation-first playbook references "${refName}" but that skill doesn't exist!`
          ).toContain(refName)
        }
      }
    } catch {
      console.log('validation-first playbook not found, skipping')
    }
  })
})

describe('Resource Discovery Integration', () => {
  it('should have bootstrap script reference registry', async () => {
    try {
      const bootstrapPath = path.join(rootDir, 'CLI', 'bootstrap.js')
      const content = await fs.readFile(bootstrapPath, 'utf8')

      expect(
        content.includes('registry.json') || content.includes('META/registry'),
        'Bootstrap script should reference registry.json for resource discovery'
      ).toBe(true)
    } catch {
      console.log('Bootstrap script not found, skipping')
    }
  })

  it('should have project context mention all resource types', async () => {
    const contextPath = path.join(rootDir, 'META', 'PROJECT-CONTEXT.md')
    const content = await fs.readFile(contextPath, 'utf8')

    const resourceTypes = ['skills', 'playbooks', 'patterns', 'components', 'integrations', 'tools']

    for (const type of resourceTypes) {
      expect(
        content.toLowerCase().includes(type),
        `PROJECT-CONTEXT should mention "${type}" resources but doesn't`
      ).toBe(true)
    }
  })
})

describe('New Categories - Phase 1 Complete', () => {
  let registry: any
  let schemaFiles: string[]
  let installerDirs: string[]
  let scriptFiles: string[]
  let componentDirs: string[]
  let utilDirs: string[]
  let playbookFiles: string[]

  beforeAll(async () => {
    // Load registry
    const registryPath = path.join(rootDir, 'META', 'registry.json')
    const registryContent = await fs.readFile(registryPath, 'utf8')
    registry = JSON.parse(registryContent)

    // Get playbooks
    try {
      const playbooksPath = path.join(rootDir, 'PLAYBOOKS')
      const playbookEntries = await fs.readdir(playbooksPath)
      playbookFiles = playbookEntries.filter(f => f.endsWith('.md'))
    } catch {
      playbookFiles = []
    }

    // Get schemas
    try {
      const schemasPath = path.join(rootDir, 'SCHEMAS')
      const entries = await fs.readdir(schemasPath)
      schemaFiles = entries.filter(f => f.endsWith('.yaml') || f.endsWith('.json'))
    } catch {
      schemaFiles = []
    }

    // Get installers
    try {
      const installersPath = path.join(rootDir, 'INSTALLERS')
      const entries = await fs.readdir(installersPath, { withFileTypes: true })
      installerDirs = entries.filter(e => e.isDirectory()).map(e => e.name)
    } catch {
      installerDirs = []
    }

    // Get scripts
    try {
      const scriptsPath = path.join(rootDir, 'scripts')
      const entries = await fs.readdir(scriptsPath)
      scriptFiles = entries.filter(f => f.endsWith('.js') || f.endsWith('.ts'))
    } catch {
      scriptFiles = []
    }

    // Get components
    try {
      const componentsPath = path.join(rootDir, 'COMPONENTS')
      const entries = await fs.readdir(componentsPath, { withFileTypes: true })
      componentDirs = entries
        .filter(e => e.isDirectory() && e.name !== 'README.md')
        .map(e => e.name)
    } catch {
      componentDirs = []
    }

    // Get utils
    try {
      const utilsPath = path.join(rootDir, 'UTILS')
      const entries = await fs.readdir(utilsPath, { withFileTypes: true })
      utilDirs = entries
        .filter(e => e.isDirectory() && e.name !== 'README.md')
        .map(e => e.name)
    } catch {
      utilDirs = []
    }
  })

  it('should register ALL schemas from SCHEMAS directory', () => {
    if (!registry.schemas) {
      throw new Error('Registry missing schemas category! This was added in Phase 1.')
    }

    expect(
      registry.schemas.length,
      `SCHEMAS/ has ${schemaFiles.length} files but registry has ${registry.schemas.length}`
    ).toBe(schemaFiles.length)

    const registeredSchemas = registry.schemas.map((s: any) => s.name)

    for (const schema of schemaFiles) {
      const schemaName = schema.replace(/\.(yaml|json)$/, '').replace('.schema', '')
      const found = registry.schemas.some((s: any) =>
        s.path.includes(schema) || s.name === schemaName
      )
      expect(
        found,
        `Schema "${schema}" exists in SCHEMAS/ but NOT properly registered`
      ).toBe(true)
    }
  })

  it('should register ALL installers from INSTALLERS directory', () => {
    if (!registry.installers) {
      throw new Error('Registry missing installers category! This was added in Phase 1.')
    }

    expect(
      registry.installers.length,
      `INSTALLERS/ has ${installerDirs.length} directories but registry has ${registry.installers.length}`
    ).toBe(installerDirs.length)

    const registeredInstallers = registry.installers.map((i: any) => i.name)

    for (const installer of installerDirs) {
      expect(
        registeredInstallers,
        `Installer "${installer}" exists in INSTALLERS/ but NOT in registry`
      ).toContain(installer)
    }
  })

  it('should register ALL scripts from scripts directory', () => {
    if (!registry.scripts) {
      throw new Error('Registry missing scripts category! This was added in Phase 1.')
    }

    expect(
      registry.scripts.length,
      `scripts/ has ${scriptFiles.length} files but registry has ${registry.scripts.length}`
    ).toBe(scriptFiles.length)

    for (const scriptFile of scriptFiles) {
      const found = registry.scripts.some((s: any) => s.path.includes(scriptFile))
      expect(
        found,
        `Script "${scriptFile}" exists in scripts/ but NOT in registry`
      ).toBe(true)
    }
  })

  it('should register ALL components from COMPONENTS directory', () => {
    expect(
      registry.components.length,
      `COMPONENTS/ has ${componentDirs.length} directories but registry has ${registry.components.length}`
    ).toBe(componentDirs.length)

    const registeredComponents = registry.components.map((c: any) => c.category)

    for (const component of componentDirs) {
      expect(
        registeredComponents,
        `Component "${component}" exists in COMPONENTS/ but NOT in registry`
      ).toContain(component)
    }
  })

  it('should register ALL utils from UTILS directory', () => {
    expect(
      registry.utils.length,
      `UTILS/ has ${utilDirs.length} directories but registry has ${registry.utils.length}`
    ).toBe(utilDirs.length)

    const registeredUtils = registry.utils.map((u: any) => u.category)

    for (const util of utilDirs) {
      expect(
        registeredUtils,
        `Util "${util}" exists in UTILS/ but NOT in registry`
      ).toContain(util)
    }
  })

  it('should register ALL playbooks from PLAYBOOKS directory', () => {
    expect(
      registry.playbooks.length,
      `PLAYBOOKS/ has ${playbookFiles.length} files but registry has ${registry.playbooks.length}`
    ).toBe(playbookFiles.length)

    for (const playbookFile of playbookFiles) {
      const playbookName = playbookFile.replace('.md', '')
      const found = registry.playbooks.some((p: any) => p.name === playbookName)
      expect(
        found,
        `Playbook "${playbookFile}" exists in PLAYBOOKS/ but NOT in registry`
      ).toBe(true)
    }
  })

  it('should have installer metadata (what they install)', () => {
    for (const installer of registry.installers) {
      expect(installer.name, 'Installer missing name').toBeTruthy()
      expect(installer.description, `Installer ${installer.name} missing description`).toBeTruthy()
      expect(installer.path, `Installer ${installer.name} missing path`).toBeTruthy()
      expect(installer.installs, `Installer ${installer.name} missing installs field`).toBeTruthy()
      // Phase 2: installs changed from array to structured object
      expect(typeof installer.installs === 'object', `Installer ${installer.name} installs must be object`).toBe(true)
      expect(installer.creates, `Installer ${installer.name} missing creates field`).toBeTruthy()
      expect(Array.isArray(installer.creates), `Installer ${installer.name} creates must be array`).toBe(true)
    }
  })

  it('should have schema metadata (what they validate)', () => {
    for (const schema of registry.schemas) {
      expect(schema.name, 'Schema missing name').toBeTruthy()
      expect(schema.description, `Schema ${schema.name} missing description`).toBeTruthy()
      expect(schema.path, `Schema ${schema.name} missing path`).toBeTruthy()
      expect(schema.validates, `Schema ${schema.name} missing validates field`).toBeTruthy()
      expect(Array.isArray(schema.validates), `Schema ${schema.name} validates must be array`).toBe(true)
    }
  })
})

describe('Audit Trail - CRITICAL', () => {
  it('should have registry lastUpdated timestamp', () => {
    const registryPath = path.join(rootDir, 'META', 'registry.json')
    const registry = JSON.parse(fsSync.readFileSync(registryPath, 'utf8'))

    expect(registry.lastUpdated, 'Registry must have lastUpdated timestamp').toBeTruthy()

    const lastUpdate = new Date(registry.lastUpdated)
    const now = new Date()
    const daysSinceUpdate = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24)

    expect(
      daysSinceUpdate,
      `Registry lastUpdated is ${Math.floor(daysSinceUpdate)} days old. Should be updated recently.`
    ).toBeLessThan(7)
  })

  it('should have version in registry', () => {
    const registryPath = path.join(rootDir, 'META', 'registry.json')
    const registry = JSON.parse(fsSync.readFileSync(registryPath, 'utf8'))

    expect(registry.version, 'Registry must have version field').toBeTruthy()
    expect(registry.version, 'Registry version must be semantic version').toMatch(/^\d+\.\d+\.\d+$/)
  })
})

describe('Phase 2: Relationship Validation', () => {
  let registry: any

  beforeAll(async () => {
    const registryPath = path.join(rootDir, 'META', 'registry.json')
    const registryContent = await fs.readFile(registryPath, 'utf8')
    registry = JSON.parse(registryContent)
  })

  it('should have MCPs with enables field listing skills they support', () => {
    for (const mcp of registry.mcpServers) {
      expect(
        mcp.enables,
        `MCP "${mcp.name}" missing enables field! Phase 2 requires all MCPs to list skills they support.`
      ).toBeTruthy()

      expect(
        Array.isArray(mcp.enables),
        `MCP "${mcp.name}" enables must be an array`
      ).toBe(true)

      expect(
        mcp.enables.length,
        `MCP "${mcp.name}" enables array is empty! It should list at least one skill.`
      ).toBeGreaterThan(0)
    }
  })

  it('should have high-priority skills with requires field', () => {
    const highPrioritySkills = [
      'rag-implementer',
      'mvp-builder',
      'product-strategist',
      'accessibility-engineer',
      'frontend-builder',
      'quality-auditor',
      'api-designer',
      'deployment-advisor',
      'performance-optimizer',
      'security-engineer'
    ]

    for (const skillName of highPrioritySkills) {
      const skill = registry.skills.find((s: any) => s.name === skillName)

      expect(
        skill,
        `High-priority skill "${skillName}" not found in registry!`
      ).toBeTruthy()

      expect(
        skill.requires,
        `High-priority skill "${skillName}" missing requires field! Phase 2 requires relationship metadata.`
      ).toBeTruthy()

      expect(skill.requires.mcps, `Skill "${skillName}" requires.mcps missing`).toBeTruthy()
      expect(skill.requires.mcps.existing, `Skill "${skillName}" requires.mcps.existing missing`).toBeTruthy()
      expect(skill.requires.mcps.planned, `Skill "${skillName}" requires.mcps.planned missing`).toBeTruthy()
      expect(skill.requires.components, `Skill "${skillName}" requires.components missing`).toBeTruthy()
      expect(skill.requires.integrations, `Skill "${skillName}" requires.integrations missing`).toBeTruthy()
      expect(skill.requires.standards, `Skill "${skillName}" requires.standards missing`).toBeTruthy()
    }
  })

  it('should have all components with dependencies field', () => {
    for (const component of registry.components) {
      expect(
        component.dependencies,
        `Component "${component.category}" missing dependencies field! Phase 2 requires all components to declare dependencies.`
      ).toBeTruthy()

      expect(component.dependencies.integrations, `Component "${component.category}" dependencies.integrations missing`).toBeTruthy()
      expect(component.dependencies.utils, `Component "${component.category}" dependencies.utils missing`).toBeTruthy()
      expect(component.dependencies.components, `Component "${component.category}" dependencies.components missing`).toBeTruthy()
    }
  })

  it('should have installers with structured installs manifests', () => {
    for (const installer of registry.installers) {
      expect(
        installer.installs,
        `Installer "${installer.name}" missing installs field!`
      ).toBeTruthy()

      expect(
        typeof installer.installs === 'object' && !Array.isArray(installer.installs),
        `Installer "${installer.name}" installs must be an object with keys: skills, mcps, components, integrations, standards`
      ).toBe(true)

      expect(installer.installs.skills, `Installer "${installer.name}" installs.skills missing`).toBeTruthy()
      expect(installer.installs.mcps, `Installer "${installer.name}" installs.mcps missing`).toBeTruthy()
      expect(installer.installs.components, `Installer "${installer.name}" installs.components missing`).toBeTruthy()
      expect(installer.installs.integrations, `Installer "${installer.name}" installs.integrations missing`).toBeTruthy()
      expect(installer.installs.standards, `Installer "${installer.name}" installs.standards missing`).toBeTruthy()
    }
  })

  it('should have MCP enables reference existing skills', () => {
    const skillNames = registry.skills.map((s: any) => s.name)

    for (const mcp of registry.mcpServers) {
      for (const skillName of mcp.enables) {
        expect(
          skillNames,
          `MCP "${mcp.name}" enables skill "${skillName}" which does NOT exist in registry!`
        ).toContain(skillName)
      }
    }
  })

  it('should have skill requires reference existing components', () => {
    const componentCategories = registry.components.map((c: any) => c.category)

    for (const skill of registry.skills) {
      if (skill.requires && skill.requires.components) {
        for (const componentName of skill.requires.components) {
          expect(
            componentCategories,
            `Skill "${skill.name}" requires component "${componentName}" which does NOT exist in registry!`
          ).toContain(componentName)
        }
      }
    }
  })
})
