// @ts-nocheck
import { beforeAll, beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import path from 'path'
import os from 'os'
import fs from 'fs-extra'

let initModule: typeof import('../../CLI/commands/init.js')
let createInitCommand: (typeof import('../../CLI/commands/init.js'))['createInitCommand']
const tempDirs: string[] = []

beforeAll(async () => {
  initModule = await import('../../CLI/commands/init.js')
  createInitCommand = initModule.createInitCommand
})

beforeEach(() => {
  vi.resetAllMocks()
})

afterEach(async () => {
  for (const dir of tempDirs.splice(0)) {
    await fs.remove(dir)
  }
})

function createTempDir() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'init-test-'))
  tempDirs.push(dir)
  return dir
}

describe('init command', () => {
  it('generates project and skips install/git when requested', async () => {
    const targetDir = createTempDir()
    const generatorMock = {
      generate: vi.fn(async () => targetDir)
    }
    const execaMock = vi.fn()
    const promptMock = vi.fn(async () => ({ auth: 'supabase' }))

    const initCommand = createInitCommand({
      projectGeneratorFactory: () => generatorMock,
      inquirer: { prompt: promptMock },
      execa: execaMock,
      ora: () => ({
        start() {
          return this
        },
        succeed() {},
        fail() {},
        warn() {}
      })
    })

    await expect(
      initCommand('saas-starter', 'demo-app', { skipInstall: true, skipGit: true })
    ).resolves.toBeUndefined()

    expect(generatorMock.generate).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'demo-app'
      })
    )
    expect(execaMock).not.toHaveBeenCalled()
  })

  it('installs dependencies and initializes git by default', async () => {
    const targetDir = createTempDir()
    const generatorMock = {
      generate: vi.fn(async () => targetDir)
    }
    const execaMock = vi.fn(async () => ({ stdout: '' }))

    const initCommand = createInitCommand({
      projectGeneratorFactory: () => generatorMock,
      inquirer: { prompt: vi.fn(async () => ({ auth: 'supabase' })) },
      execa: execaMock,
      ora: () => ({
        start() {
          return this
        },
        succeed() {},
        fail() {},
        warn() {}
      })
    })

    await expect(initCommand('saas-starter', 'demo-app', {})).resolves.toBeUndefined()

    const installCall = execaMock.mock.calls.find(([cmd]) => cmd === 'npm')
    const gitInitCall = execaMock.mock.calls.find(
      ([cmd, args]) => cmd === 'git' && args[0] === 'init'
    )

    expect(installCall).toBeTruthy()
    expect(gitInitCall).toBeTruthy()
  })

  it('exits for unknown project type', async () => {
    const exitSpy = vi.fn()
    const initCommand = createInitCommand({
      exit: exitSpy,
      inquirer: { prompt: vi.fn() },
      projectGeneratorFactory: () => ({ generate: vi.fn() })
    })

    await expect(initCommand('unknown-type', 'demo', {})).rejects.toThrow('Unknown project type')
    expect(exitSpy).not.toHaveBeenCalled()
  })
})
