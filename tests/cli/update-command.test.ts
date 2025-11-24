import { beforeAll, beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import path from 'path'
import os from 'os'
import fs from 'fs-extra'

let updateModule: typeof import('../../CLI/commands/update.js')
let createUpdateCommand: (typeof import('../../CLI/commands/update.js'))['createUpdateCommand']
const tempDirs: string[] = []

beforeAll(async () => {
  updateModule = (await import('../../CLI/commands/update.js')) as any
  createUpdateCommand = updateModule.createUpdateCommand
})

beforeEach(() => {
  vi.restoreAllMocks()
})

afterEach(async () => {
  for (const dir of tempDirs.splice(0)) {
    await fs.remove(dir)
  }
})

function createTempProject() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'update-test-'))
  tempDirs.push(dir)
  return dir
}

const fakeChalk = {
  blue: (v: string) => v,
  bold: (v: string) => v,
  green: (v: string) => v,
  red: (v: string) => v,
  yellow: (v: string) => v,
  gray: (v: string) => v
}

function createOraMock() {
  return vi.fn(() => {
    const spinner = {
      start: vi.fn(),
      succeed: vi.fn(),
      stop: vi.fn()
    }
    spinner.start.mockReturnValue(spinner)
    return spinner
  })
}

describe('update command', () => {
  it('adds selected skills to config', async () => {
    const projectDir = createTempProject()
    await fs.writeJson(path.join(projectDir, '.ai-dev.json'), { installed: { skills: [] } })
    const promptMock = vi.fn(async () => ({ selected: ['Focus Skill'] }))

    const updateCommand = createUpdateCommand({
      chalk: fakeChalk,
      fs,
      path,
      inquirer: { prompt: promptMock },
      fetchAvailableSkills: async () => [{ name: 'Focus Skill', description: 'Boosts focus' }],
      exit: vi.fn(),
      cwd: () => projectDir,
      projectGeneratorFactory: () => ({})
    })

    await updateCommand('skills', { all: false })
    const config = await fs.readJson(path.join(projectDir, '.ai-dev.json'))
    expect(config.installed.skills).toContain('Focus Skill')
    expect(await fs.pathExists(path.join(projectDir, '.claude', 'claude.md'))).toBe(true)
  })

  it('updates cursor rules with confirmation', async () => {
    const projectDir = createTempProject()
    await fs.ensureDir(projectDir)
    const promptMock = vi.fn(async () => ({ confirm: true }))
    await fs.writeFile(path.join(projectDir, '.cursorrules'), 'old rules')

    const updateCommand = createUpdateCommand({
      chalk: fakeChalk,
      fs,
      path,
      inquirer: { prompt: promptMock },
      fetchLatestCursorRules: async () => '# new rules',
      exit: vi.fn(),
      cwd: () => projectDir
    })

    await updateCommand('cursorrules', {})
    const newContent = await fs.readFile(path.join(projectDir, '.cursorrules'), 'utf8')
    expect(newContent).toContain('# new rules')
    expect(await fs.pathExists(path.join(projectDir, '.cursorrules.backup'))).toBe(true)
  })

  it('configures selected MCP servers', async () => {
    const projectDir = createTempProject()
    await fs.writeJson(path.join(projectDir, '.ai-dev.json'), { installed: { mcps: [] } })
    const promptMock = vi.fn().mockResolvedValue({ selected: ['semantic-search'] })
    const updateCommand = createUpdateCommand({
      chalk: fakeChalk,
      fs,
      path,
      inquirer: { prompt: promptMock },
      fetchAvailableMcps: async () => [
        {
          name: 'semantic-search',
          description: 'Vector search',
          path: '/tmp/mcp.js',
          env: { TOKEN: 'test' }
        }
      ],
      ora: createOraMock(),
      cwd: () => projectDir,
      exit: vi.fn()
    })

    await updateCommand('mcps', {})

    const config = await fs.readJson(path.join(projectDir, '.ai-dev.json'))
    expect(config.installed.mcps).toEqual(['semantic-search'])

    const claudeSettings = await fs.readJson(path.join(projectDir, '.claude', 'mcp-settings.json'))
    const codexSettings = await fs.readJson(path.join(projectDir, '.codex', 'mcp-settings.json'))

    for (const settings of [claudeSettings, codexSettings]) {
      expect(settings.mcpServers['semantic-search']).toMatchObject({
        command: 'node',
        args: ['/tmp/mcp.js'],
        env: { TOKEN: 'test' }
      })
    }
  })

  it('merges gitignore patterns without duplicates', async () => {
    const projectDir = createTempProject()
    await fs.writeFile(path.join(projectDir, '.gitignore'), 'node_modules/\n.env\n')

    const updateCommand = createUpdateCommand({
      chalk: fakeChalk,
      fs,
      path,
      ora: createOraMock(),
      fetchLatestGitignore: async () => 'node_modules/\n.env\nbuild/\ncoverage/\n',
      cwd: () => projectDir,
      exit: vi.fn()
    })

    await updateCommand('gitignore', {})

    const patterns = await fs.readFile(path.join(projectDir, '.gitignore'), 'utf8')
    expect(patterns.split('\n').filter(Boolean)).toEqual([
      'node_modules/',
      '.env',
      'build/',
      'coverage/'
    ])
  })

  it('installs selected tools into project', async () => {
    const projectDir = createTempProject()
    await fs.writeJson(path.join(projectDir, '.ai-dev.json'), { installed: { tools: [] } })
    const promptMock = vi.fn().mockResolvedValue({ selected: ['health-check'] })

    const updateCommand = createUpdateCommand({
      chalk: fakeChalk,
      fs,
      path,
      inquirer: { prompt: promptMock },
      fetchAvailableTools: async () => [
        {
          name: 'health-check',
          framework: 'node',
          description: 'health tool',
          content: '// tool code'
        }
      ],
      ora: createOraMock(),
      cwd: () => projectDir,
      exit: vi.fn()
    })

    await updateCommand('tools', {})

    const config = await fs.readJson(path.join(projectDir, '.ai-dev.json'))
    expect(config.installed.tools).toEqual(['health-check'])
    expect(await fs.pathExists(path.join(projectDir, 'tools', 'health-check.ts'))).toBe(true)
  })

  it('runs all update targets when using "all"', async () => {
    const projectDir = createTempProject()
    const promptMock = vi
      .fn()
      .mockResolvedValueOnce({ selected: ['Focus Skill'] })
      .mockResolvedValueOnce({ selected: ['semantic-search'] })
      .mockResolvedValueOnce({ confirm: true })
      .mockResolvedValueOnce({ selected: ['health-check'] })

    const updateCommand = createUpdateCommand({
      chalk: fakeChalk,
      fs,
      path,
      inquirer: { prompt: promptMock },
      fetchAvailableSkills: async () => [{ name: 'Focus Skill', description: 'Boosts focus' }],
      fetchAvailableMcps: async () => [
        { name: 'semantic-search', description: 'Vector search', path: '/tmp/mcp.js' }
      ],
      fetchAvailableTools: async () => [
        {
          name: 'health-check',
          framework: 'node',
          description: 'health tool',
          content: '// tool code'
        }
      ],
      fetchLatestCursorRules: async () => '# updated rules',
      fetchLatestGitignore: async () => '.env\nnode_modules/\n',
      ora: createOraMock(),
      cwd: () => projectDir,
      exit: vi.fn()
    })

    await updateCommand('all', {})

    const config = await fs.readJson(path.join(projectDir, '.ai-dev.json'))
    expect(config.installed.skills).toContain('Focus Skill')
    expect(config.installed.mcps).toContain('semantic-search')
    expect(config.installed.tools).toContain('health-check')

    const cursorContent = await fs.readFile(path.join(projectDir, '.cursorrules'), 'utf8')
    expect(cursorContent).toBe('# updated rules')

    const gitignoreContent = await fs.readFile(path.join(projectDir, '.gitignore'), 'utf8')
    expect(gitignoreContent).toContain('.env')

    expect(await fs.pathExists(path.join(projectDir, 'tools', 'health-check.ts'))).toBe(true)
  })

  it('throws on unknown target', async () => {
    const exitSpy = vi.fn()
    const updateCommand = createUpdateCommand({
      exit: exitSpy,
      chalk: fakeChalk
    })
    await expect(updateCommand('unknown', {})).rejects.toThrow()
  })
})
