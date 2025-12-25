// @ts-nocheck
import path from 'path'
import os from 'os'
import fs from 'fs-extra'
import { beforeAll, afterEach, describe, expect, it, vi } from 'vitest'

const fetchVersionMock = vi.fn(async () => '9.9.9')

vi.mock('../../CLI/utils/local-fetch', () => ({
  fetchAllStandards: vi.fn(async () => ({
    version: '9.9.9',
    skills: [],
    mcps: [],
    tools: [],
    scripts: [],
    components: [],
    integrations: [],
    cursorrules: '',
    gitignore: ''
  })),
  fetchVersion: fetchVersionMock,
  fetchText: vi.fn(async () => ''),
  getAbsolutePath: vi.fn((p: string) => p)
}))

vi.mock('../../CLI/utils/github-fetch', () => ({
  fetchAllStandards: vi.fn(async () => ({
    version: '9.9.9',
    skills: [],
    mcps: [],
    tools: [],
    scripts: [],
    components: [],
    integrations: [],
    cursorrules: '',
    gitignore: ''
  })),
  fetchVersion: vi.fn(async () => '9.9.9')
}))

vi.mock('ora', () => {
  const spinner = {
    start() {
      return spinner
    },
    succeed: vi.fn(),
    fail: vi.fn(),
    text: ''
  }

  return () => spinner
})

let syncModule: typeof import('../../CLI/commands/sync.js')
let createSyncCommand: (typeof import('../../CLI/commands/sync.js'))['createSyncCommand']
const tempDirs: string[] = []
const fakeChalk = {
  blue: (v: string) => v,
  bold: (v: string) => v,
  green: (v: string) => v,
  yellow: (v: string) => v,
  gray: (v: string) => v,
  red: (v: string) => v,
  cyan: (v: string) => v
} as any

beforeAll(async () => {
  syncModule = await import('../../CLI/commands/sync.js')
  createSyncCommand = syncModule.createSyncCommand
})

afterEach(async () => {
  for (const dir of tempDirs.splice(0)) {
    await fs.remove(dir)
  }
})

function createTempProject() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'sync-test-'))
  tempDirs.push(dir)
  return dir
}

describe('loadProjectConfig', () => {
  it('returns null when config missing', async () => {
    const projectDir = createTempProject()
    const result = await syncModule.loadProjectConfig(projectDir)
    expect(result).toBeNull()
  })

  it('fills defaults when config exists', async () => {
    const projectDir = createTempProject()
    await fs.writeJson(path.join(projectDir, '.ai-dev.json'), {
      version: '2.0.0',
      installed: { skills: ['demo-skill'] }
    })

    const result = await syncModule.loadProjectConfig(projectDir)
    expect(result?.version).toBe('2.0.0')
    expect(result?.installed.skills).toEqual(['demo-skill'])
    expect(result?.installed.mcps).toEqual([])
  })
})

function createOraStub() {
  return () => ({
    start() {
      return {
        succeed() {},
        fail() {},
        text: ''
      }
    }
  })
}

describe('initializeSync', () => {
  it('initializes project with defaults when --yes is passed', async () => {
    const projectDir = createTempProject()
    await fs.ensureDir(path.join(projectDir, '.git'))

    const config = await syncModule.initializeSync(
      projectDir,
      { yes: true },
      {
        fs,
        path,
        ora: createOraStub(),
        localFetch: {
          fetchVersion: async () => '7.7.7',
          fetchAllStandards: async () => ({
            version: '7.7.7',
            skills: [],
            mcps: [],
            tools: [],
            scripts: [],
            components: [],
            integrations: [],
            cursorrules: '',
            gitignore: ''
          }),
          fetchText: async () => '',
          getAbsolutePath: (p: string) => p
        },
        githubFetch: {
          fetchAllStandards: async () => ({
            version: '7.7.7',
            skills: [],
            mcps: [],
            tools: [],
            scripts: [],
            components: [],
            integrations: [],
            cursorrules: '',
            gitignore: ''
          }),
          fetchVersion: async () => '7.7.7'
        }
      }
    )

    const savedConfig = await fs.readJson(path.join(projectDir, '.ai-dev.json'))
    expect(savedConfig.version).toBe('7.7.7')
    expect(savedConfig.tracking).toContain('skills')
    expect(config.version).toBe('7.7.7')

    const hookPath = path.join(projectDir, '.git', 'hooks', 'post-merge')
    expect(await fs.pathExists(hookPath)).toBe(true)
  })

  it('continues when git hook setup fails due to missing .git', async () => {
    const projectDir = createTempProject()
    const config = await syncModule.initializeSync(
      projectDir,
      { yes: true },
      {
        fs,
        path,
        ora: createOraStub(),
        localFetch: {
          fetchVersion: async () => '1.2.3',
          fetchAllStandards: async () => ({
            version: '1.2.3',
            skills: [],
            mcps: [],
            tools: [],
            scripts: [],
            components: [],
            integrations: [],
            cursorrules: '',
            gitignore: ''
          }),
          fetchText: async () => '',
          getAbsolutePath: (p: string) => p
        },
        githubFetch: {
          fetchAllStandards: async () => ({
            version: '1.2.3',
            skills: [],
            mcps: [],
            tools: [],
            scripts: [],
            components: [],
            integrations: [],
            cursorrules: '',
            gitignore: ''
          }),
          fetchVersion: async () => '1.2.3'
        }
      }
    )

    expect(config.version).toBe('1.2.3')
    expect(await fs.pathExists(path.join(projectDir, '.ai-dev.json'))).toBe(true)
  })

  it('respects interactive tracking selections and manual frequency', async () => {
    const projectDir = createTempProject()
    await fs.ensureDir(path.join(projectDir, '.git'))

    const promptMock = vi.fn().mockResolvedValueOnce({
      track: ['skills', 'gitignore'],
      frequency: 'manual'
    })

    const config = await syncModule.initializeSync(
      projectDir,
      {},
      {
        fs,
        path,
        inquirer: { prompt: promptMock },
        ora: createOraStub(),
        localFetch: {
          fetchVersion: async () => '3.3.3',
          fetchAllStandards: async () => ({
            version: '3.3.3',
            skills: [],
            mcps: [],
            tools: [],
            scripts: [],
            components: [],
            integrations: [],
            cursorrules: '',
            gitignore: ''
          }),
          fetchText: async () => '',
          getAbsolutePath: (p: string) => p
        },
        githubFetch: {
          fetchAllStandards: async () => ({
            version: '3.3.3',
            skills: [],
            mcps: [],
            tools: [],
            scripts: [],
            components: [],
            integrations: [],
            cursorrules: '',
            gitignore: ''
          }),
          fetchVersion: async () => '3.3.3'
        }
      }
    )

    expect(config.tracking).toEqual(['skills', 'gitignore'])
    expect(config.frequency).toBe('manual')
    expect(await fs.pathExists(path.join(projectDir, '.git', 'hooks', 'post-merge'))).toBe(false)
  })
})

describe('checkForUpdates', () => {
  it('detects new skills when not installed', async () => {
    const latestData = {
      version: '9.9.9',
      skills: [
        {
          id: 'focus-skill',
          name: 'Focus Skill',
          description: 'Helps focus',
          path: '/skills/focus-skill/'
        }
      ],
      mcps: [],
      tools: [],
      scripts: [],
      components: [],
      integrations: [],
      cursorrules: '',
      gitignore: ''
    }
    const fetchSpy = vi.spyOn(syncModule, 'fetchLatestStandards').mockResolvedValue(latestData)

    const config = {
      version: '9.9.8',
      tracking: ['skills'],
      installed: {
        skills: [],
        mcps: [],
        tools: [],
        scripts: [],
        components: [],
        integrations: []
      }
    }

    const updates = await syncModule.checkForUpdates(config)
    expect(updates.some(u => u.type === 'skill')).toBe(true)

    fetchSpy.mockRestore()
  })

  it('ignores untracked resource types', async () => {
    const latestData = {
      version: '9.9.9',
      skills: [
        {
          id: 'focus-skill',
          name: 'Focus Skill',
          description: 'Helps focus',
          path: '/skills/focus-skill/'
        }
      ],
      mcps: [
        {
          id: 'semantic-search',
          name: 'semantic-search',
          description: 'mcp',
          path: '/MCP/index.js'
        }
      ],
      tools: [{ id: 'tool-1', name: 'Tool', description: 'tool', path: '/tools/tool.ts' }],
      scripts: [{ id: 'script-1', name: 'Script', description: 'script', path: '/scripts/run.sh' }],
      components: [
        { id: 'comp-1', name: 'Comp', description: 'component', path: '/components/ui/Comp.tsx' }
      ],
      integrations: [
        { id: 'int-1', name: 'Int', description: 'integration', path: '/integrations/x.ts' }
      ],
      cursorrules: '',
      gitignore: ''
    }
    const fetchSpy = vi.spyOn(syncModule, 'fetchLatestStandards').mockResolvedValue(latestData)

    const config = {
      version: '9.9.9',
      tracking: ['skills'],
      installed: {
        skills: [],
        mcps: [],
        tools: [],
        scripts: [],
        components: [],
        integrations: []
      }
    }

    const updates = await syncModule.checkForUpdates(config)
    expect(updates.length).toBe(1)
    expect(updates[0].type).toBe('skill')

    fetchSpy.mockRestore()
  })
})

describe('applyUpdate', () => {
  it('adds skill content to project and updates config', async () => {
    const projectDir = createTempProject()
    const config = {
      installed: {
        skills: [],
        mcps: [],
        tools: [],
        scripts: [],
        components: [],
        integrations: []
      }
    }

    const update = {
      type: 'skill',
      name: 'Focus Skill',
      data: {
        id: 'focus-skill',
        name: 'Focus Skill',
        description: 'Helps maintain focus',
        path: '/skills/focus-skill/'
      }
    }

    await syncModule.applyUpdate(projectDir, update, config)

    const claudePath = path.join(projectDir, '.claude', 'claude.md')
    const codexPath = path.join(projectDir, '.codex', 'codex.md')
    expect(await fs.pathExists(claudePath)).toBe(true)
    expect(await fs.pathExists(codexPath)).toBe(true)

    const content = await fs.readFile(claudePath, 'utf8')
    expect(content).toContain('Focus Skill')
    expect(config.installed.skills).toContain('focus-skill')
  })

  it('configures MCP settings for both clients', async () => {
    const projectDir = createTempProject()
    const config = {
      installed: {
        skills: [],
        mcps: [],
        tools: [],
        scripts: [],
        components: [],
        integrations: []
      }
    }

    const update = {
      type: 'mcp',
      name: 'Semantic Search',
      data: {
        id: 'semantic-search',
        name: 'semantic-search',
        description: 'vector search',
        path: '/mcp-servers/semantic-search-mcp/dist/index.js',
        env: { PINECONE_API_KEY: 'test' }
      }
    }

    await syncModule.applyUpdate(projectDir, update, config, { fs, path, chalk: fakeChalk })

    const claudeSettings = await fs.readJson(path.join(projectDir, '.claude', 'mcp-settings.json'))
    const codexSettings = await fs.readJson(path.join(projectDir, '.codex', 'mcp-settings.json'))
    for (const settings of [claudeSettings, codexSettings]) {
      expect(settings.mcpServers['semantic-search']).toMatchObject({
        command: 'node',
        args: ['/mcp-servers/semantic-search-mcp/dist/index.js'],
        env: { PINECONE_API_KEY: 'test' }
      })
    }
    expect(config.installed.mcps).toContain('semantic-search')
  })

  it('writes tool, script, component, and integration files', async () => {
    const projectDir = createTempProject()
    const config = {
      installed: {
        skills: [],
        mcps: [],
        tools: [],
        scripts: [],
        components: [],
        integrations: []
      }
    }

    const localFetch = {
      fetchText: vi.fn(async (p: string) => `// file: ${p}`),
      getAbsolutePath: (p: string) => p
    } as any

    await syncModule.applyUpdate(
      projectDir,
      {
        type: 'tool',
        name: 'health-tool',
        data: {
          id: 'health-tool',
          name: 'health-tool',
          description: 'tool',
          path: '/tools/health-tool.ts'
        }
      },
      config,
      { fs, path, localFetch, chalk: fakeChalk }
    )

    await syncModule.applyUpdate(
      projectDir,
      {
        type: 'script',
        name: 'sync-script',
        data: {
          id: 'sync-script',
          name: 'sync-script',
          description: 'script',
          path: '/scripts/sync-script.sh'
        }
      },
      config,
      { fs, path, localFetch, chalk: fakeChalk }
    )

    await syncModule.applyUpdate(
      projectDir,
      {
        type: 'component',
        name: 'Toast',
        data: {
          id: 'toast',
          name: 'Toast',
          description: 'component',
          category: 'feedback',
          path: '/components/feedback/Toast.tsx'
        }
      },
      config,
      { fs, path, localFetch, chalk: fakeChalk }
    )

    await syncModule.applyUpdate(
      projectDir,
      {
        type: 'integration',
        name: 'stripe',
        data: {
          id: 'stripe',
          name: 'Stripe',
          description: 'integration',
          category: 'payments',
          path: '/integrations/platforms/stripe/client.ts'
        }
      },
      config,
      { fs, path, localFetch, chalk: fakeChalk }
    )

    expect(await fs.pathExists(path.join(projectDir, 'tools', 'health-tool.ts'))).toBe(true)
    expect(await fs.pathExists(path.join(projectDir, 'scripts', 'sync-script.sh'))).toBe(true)
    expect(await fs.pathExists(path.join(projectDir, 'components', 'feedback', 'Toast.tsx'))).toBe(
      true
    )
    expect(
      await fs.pathExists(path.join(projectDir, 'lib', 'integrations', 'payments', 'client.ts'))
    ).toBe(true)

    expect(config.installed.tools).toContain('health-tool')
    expect(config.installed.scripts).toContain('sync-script')
    expect(config.installed.components).toContain('toast')
    expect(config.installed.integrations).toContain('stripe')
  })
})

describe('sync command flow', () => {
  it('skips confirmation when --yes and applies configuration updates', async () => {
    const projectDir = createTempProject()
    await fs.ensureDir(path.join(projectDir, '.git'))
    await fs.writeJson(path.join(projectDir, '.ai-dev.json'), {
      version: '1.0.0',
      tracking: ['gitignore', 'cursorrules'],
      installed: {
        skills: [],
        mcps: [],
        tools: [],
        scripts: [],
        components: [],
        integrations: []
      }
    })

    const fakeStandards = {
      version: '2.0.0',
      skills: [],
      mcps: [],
      tools: [],
      scripts: [],
      components: [],
      integrations: [],
      cursorrules: '# New Rules',
      gitignore: '.env\nnode_modules/\n'
    }

    const localFetchMocks = {
      fetchAllStandards: vi.fn(async () => fakeStandards),
      fetchVersion: vi.fn(async () => '2.0.0'),
      fetchText: vi.fn(async () => ''),
      getAbsolutePath: vi.fn((p: string) => p)
    }

    const syncCommand = createSyncCommand({
      fs,
      path,
      inquirer: { prompt: vi.fn() },
      localFetch: localFetchMocks,
      githubFetch: localFetchMocks,
      ora: () => ({
        start() {
          return { succeed() {}, fail() {}, text: '' }
        }
      })
    })

    const cwdSpy = vi.spyOn(process, 'cwd').mockReturnValue(projectDir)
    await syncCommand({ yes: true, silent: true })
    cwdSpy.mockRestore()

    const cursorRulesPath = path.join(projectDir, '.cursorrules')
    expect(await fs.pathExists(cursorRulesPath)).toBe(true)
    const gitignorePath = path.join(projectDir, '.gitignore')
    expect(await fs.pathExists(gitignorePath)).toBe(true)
    const gitignoreContent = await fs.readFile(gitignorePath, 'utf8')
    expect(gitignoreContent).toContain('.env')

    const config = await fs.readJson(path.join(projectDir, '.ai-dev.json'))
    expect(config.version).toBe('2.0.0')
  })

  it('applies resource updates for skills, MCPs, tools, components, and integrations', async () => {
    const projectDir = createTempProject()
    await fs.ensureDir(path.join(projectDir, '.git'))
    await fs.writeJson(path.join(projectDir, '.ai-dev.json'), {
      version: '1.0.0',
      tracking: [
        'skills',
        'mcps',
        'tools',
        'components',
        'integrations',
        'cursorrules',
        'gitignore'
      ],
      installed: {
        skills: [],
        mcps: [],
        tools: [],
        scripts: [],
        components: [],
        integrations: []
      }
    })

    const registry = {
      version: '2.0.0',
      skills: [
        {
          id: 'focus-skill',
          name: 'Focus Skill',
          description: 'Boost focus',
          path: '/skills/focus-skill/'
        }
      ],
      mcps: [
        {
          id: 'semantic-search',
          name: 'semantic-search',
          description: 'search',
          path: '/mcp-servers/semantic-search-mcp/dist/index.js',
          env: { API_KEY: 'test' }
        }
      ],
      tools: [
        {
          id: 'health-tool',
          name: 'health-tool',
          description: 'tool',
          path: '/tools/health-tool.ts'
        }
      ],
      scripts: [
        {
          id: 'sync-script',
          name: 'sync-script',
          description: 'script',
          path: '/scripts/sync-script.sh'
        }
      ],
      components: [
        {
          id: 'toast',
          name: 'Toast',
          description: 'component',
          category: 'feedback',
          path: '/components/feedback/Toast.tsx'
        }
      ],
      integrations: [
        {
          id: 'stripe',
          name: 'Stripe',
          description: 'integration',
          category: 'payments',
          path: '/integrations/platforms/stripe/client.ts'
        }
      ],
      cursorrules: '# New Rules',
      gitignore: '.env\nnode_modules/\n'
    }

    const localFetchMocks = {
      fetchAllStandards: vi.fn(async () => registry),
      fetchVersion: vi.fn(async () => '2.0.0'),
      fetchText: vi.fn(async (p: string) => `// file: ${p}`),
      getAbsolutePath: vi.fn((p: string) => p)
    }

    const syncCommand = createSyncCommand({
      fs,
      path,
      inquirer: { prompt: vi.fn() },
      localFetch: localFetchMocks,
      githubFetch: localFetchMocks,
      ora: () => ({
        start() {
          return { succeed() {}, fail() {}, text: '' }
        }
      }),
      chalk: fakeChalk
    })

    const cwdSpy = vi.spyOn(process, 'cwd').mockReturnValue(projectDir)
    await syncCommand({ yes: true })
    cwdSpy.mockRestore()

    const claudeConfig = await fs.readFile(path.join(projectDir, '.claude', 'claude.md'), 'utf8')
    expect(claudeConfig).toContain('Focus Skill')

    const mcpSettings = await fs.readJson(path.join(projectDir, '.claude', 'mcp-settings.json'))
    expect(mcpSettings.mcpServers['semantic-search']).toBeDefined()

    expect(await fs.pathExists(path.join(projectDir, 'tools', 'health-tool.ts'))).toBe(true)
    expect(await fs.pathExists(path.join(projectDir, 'scripts', 'sync-script.sh'))).toBe(true)
    expect(await fs.pathExists(path.join(projectDir, 'components', 'feedback', 'Toast.tsx'))).toBe(
      true
    )
    expect(
      await fs.pathExists(path.join(projectDir, 'lib', 'integrations', 'payments', 'client.ts'))
    ).toBe(true)

    const config = await fs.readJson(path.join(projectDir, '.ai-dev.json'))
    expect(config.version).toBe('2.0.0')
    expect(config.installed.skills).toEqual(['focus-skill'])
    expect(config.installed.mcps).toEqual(['semantic-search'])
    expect(config.installed.tools).toEqual(['health-tool'])
    expect(config.installed.scripts).toEqual(['sync-script'])
    expect(config.installed.components).toEqual(['toast'])
    expect(config.installed.integrations).toEqual(['stripe'])
  })

  it('prompts for initialization and exits when user declines', async () => {
    const projectDir = createTempProject()
    const promptMock = vi.fn().mockResolvedValueOnce({ init: false })

    const syncCommand = createSyncCommand({
      fs,
      path,
      inquirer: { prompt: promptMock },
      localFetch: {
        fetchAllStandards: vi.fn(),
        fetchVersion: vi.fn(),
        fetchText: vi.fn(),
        getAbsolutePath: vi.fn()
      },
      githubFetch: {
        fetchAllStandards: vi.fn(),
        fetchVersion: vi.fn()
      },
      ora: createOraStub(),
      chalk: fakeChalk,
      exit: vi.fn()
    })

    const cwdSpy = vi.spyOn(process, 'cwd').mockReturnValue(projectDir)
    await syncCommand({})
    cwdSpy.mockRestore()

    expect(promptMock).toHaveBeenCalled()
    expect(await fs.pathExists(path.join(projectDir, '.ai-dev.json'))).toBe(false)
  })

  it('prompts for confirmation and aborts when user declines updates', async () => {
    const projectDir = createTempProject()
    await fs.ensureDir(path.join(projectDir, '.git'))
    await fs.writeJson(path.join(projectDir, '.ai-dev.json'), {
      version: '1.0.0',
      tracking: ['gitignore'],
      installed: {
        skills: [],
        mcps: [],
        tools: [],
        scripts: [],
        components: [],
        integrations: []
      }
    })

    const promptMock = vi.fn().mockResolvedValueOnce({ confirm: false })

    const localFetchMocks = {
      fetchAllStandards: vi.fn(async () => ({
        version: '2.0.0',
        skills: [],
        mcps: [],
        tools: [],
        scripts: [],
        components: [],
        integrations: [],
        cursorrules: '# updated',
        gitignore: '.env\nnode_modules/\n'
      })),
      fetchVersion: vi.fn(async () => '2.0.0'),
      fetchText: vi.fn(async () => ''),
      getAbsolutePath: vi.fn((p: string) => p)
    }

    const syncCommand = createSyncCommand({
      fs,
      path,
      inquirer: { prompt: promptMock },
      localFetch: localFetchMocks,
      githubFetch: localFetchMocks,
      ora: createOraStub(),
      chalk: fakeChalk
    })

    const cwdSpy = vi.spyOn(process, 'cwd').mockReturnValue(projectDir)
    await syncCommand({})
    cwdSpy.mockRestore()

    expect(promptMock).toHaveBeenCalled()
    expect(await fs.pathExists(path.join(projectDir, '.gitignore'))).toBe(false)
    const config = await fs.readJson(path.join(projectDir, '.ai-dev.json'))
    expect(config.version).toBe('1.0.0')
  })

  it('reports when everything is up to date', async () => {
    const projectDir = createTempProject()
    await fs.ensureDir(path.join(projectDir, '.git'))
    await fs.writeJson(path.join(projectDir, '.ai-dev.json'), {
      version: '9.9.9',
      tracking: ['gitignore', 'cursorrules', 'skills'],
      installed: {
        skills: [],
        mcps: [],
        tools: [],
        scripts: [],
        components: [],
        integrations: []
      }
    })

    // Create empty files to match remote state
    await fs.writeFile(path.join(projectDir, '.gitignore'), '')
    await fs.writeFile(path.join(projectDir, '.cursorrules'), '')

    const localFetchMocks = {
      fetchAllStandards: vi.fn(async () => ({
        version: '9.9.9',
        skills: [],
        mcps: [],
        tools: [],
        scripts: [],
        components: [],
        integrations: [],
        cursorrules: '',
        gitignore: ''
      })),
      fetchVersion: vi.fn(async () => '9.9.9'),
      fetchText: vi.fn(async () => ''),
      getAbsolutePath: vi.fn((p: string) => p)
    }

    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

    const syncCommand = createSyncCommand({
      fs,
      path,
      inquirer: { prompt: vi.fn() },
      localFetch: localFetchMocks,
      githubFetch: localFetchMocks,
      ora: createOraStub(),
      chalk: fakeChalk
    })

    const cwdSpy = vi.spyOn(process, 'cwd').mockReturnValue(projectDir)
    await syncCommand({ yes: true })
    cwdSpy.mockRestore()

    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('✅ Everything is up to date'))
    logSpy.mockRestore()
  })

  it('prints summary counts after applying updates', async () => {
    const projectDir = createTempProject()
    await fs.ensureDir(path.join(projectDir, '.git'))
    await fs.writeJson(path.join(projectDir, '.ai-dev.json'), {
      version: '1.0.0',
      tracking: ['skills', 'mcps'],
      installed: {
        skills: [],
        mcps: [],
        tools: [],
        scripts: [],
        components: [],
        integrations: []
      }
    })

    const registry = {
      version: '2.0.0',
      skills: [
        {
          id: 'focus-skill',
          name: 'Focus Skill',
          description: 'Boost focus',
          path: '/skills/focus-skill/'
        }
      ],
      mcps: [
        {
          id: 'semantic-search',
          name: 'semantic-search',
          description: 'search',
          path: '/mcp-servers/semantic-search-mcp/dist/index.js',
          env: { API_KEY: 'test' }
        }
      ],
      tools: [],
      scripts: [],
      components: [],
      integrations: [],
      cursorrules: '',
      gitignore: ''
    }

    const localFetchMocks = {
      fetchAllStandards: vi.fn(async () => registry),
      fetchVersion: vi.fn(async () => '2.0.0'),
      fetchText: vi.fn(async (p: string) => `// file: ${p}`),
      getAbsolutePath: vi.fn((p: string) => p)
    }

    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

    const syncCommand = createSyncCommand({
      fs,
      path,
      inquirer: { prompt: vi.fn() },
      localFetch: localFetchMocks,
      githubFetch: localFetchMocks,
      ora: createOraStub(),
      chalk: fakeChalk
    })

    const cwdSpy = vi.spyOn(process, 'cwd').mockReturnValue(projectDir)
    await syncCommand({ yes: true })
    cwdSpy.mockRestore()

    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('📊 Summary'))
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('skills added'))
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('MCPs configured'))

    logSpy.mockRestore()
  })
})
