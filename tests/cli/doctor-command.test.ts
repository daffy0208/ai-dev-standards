// @ts-nocheck
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

let createDoctorCommand: (typeof import('../../CLI/commands/doctor.js'))['createDoctorCommand']

beforeAll(async () => {
  const mod = await import('../../CLI/commands/doctor.js')
  createDoctorCommand = mod.createDoctorCommand
})

describe('doctor command', () => {
  let execaMock: ReturnType<typeof vi.fn>
  let fsMock: any
  let exitMock: ReturnType<typeof vi.fn>
  let doctorCommand: ReturnType<typeof createDoctorCommand>
  let nodeModulesExists: boolean

  beforeEach(() => {
    nodeModulesExists = true
    execaMock = vi.fn(async (cmd: string, args: string[]) => {
      if (cmd === 'node' && args[0] === '--version') return { stdout: 'v18.19.0' }
      if (cmd === 'npm' && args[0] === '--version') return { stdout: '10.5.0' }
      if (cmd === 'npm' && args[0] === 'outdated') return { stdout: '{}' }
      if (cmd === 'git' && args[0] === '--version') return { stdout: 'git version 2.0.0' }
      return { stdout: '' }
    })

    const statMock = vi.fn(async () => ({
      mode: parseInt('777', 8)
    }))

    const readJsonMock = vi.fn(async (file: string) => {
      if (file.endsWith('package.json')) {
        return { name: 'demo-app', dependencies: { react: '^18.0.0' } }
      }
      if (file.endsWith('.ai-dev.json')) {
        return { version: '1.0.0', aiDevStandardsRoot: '/tmp/ai-dev' }
      }
      if (file.endsWith('settings.json')) {
        return { hooks: { UserPromptSubmit: true } }
      }
      if (file.endsWith('skill-rules.json')) {
        return { demo: {} }
      }
      return {}
    })

    const pathExistsMock = vi.fn(async (target: string) => {
      if (target.includes('node_modules')) return nodeModulesExists
      if (target.includes('tsconfig.json')) return false
      if (target.includes('.eslintrc.js')) return false
      if (target.includes('.prettierrc.json')) return false
      return true
    })

    fsMock = {
      pathExists: pathExistsMock,
      readJson: readJsonMock,
      stat: statMock
    }

    exitMock = vi.fn()

    doctorCommand = createDoctorCommand({
      execa: execaMock,
      fs: fsMock,
      exit: exitMock
    })

    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('reports healthy project when all checks pass', async () => {
    await doctorCommand({ fixAll: false })

    expect(exitMock).not.toHaveBeenCalled()
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('🎉 Your project is healthy'))
  })

  it('runs auto-fix when dependencies missing and fixAll enabled', async () => {
    nodeModulesExists = false

    await doctorCommand({ fixAll: true })

    const installCall = execaMock.mock.calls.find(
      ([cmd, args]) => cmd === 'npm' && args?.[0] === 'install'
    )
    expect(installCall).toBeTruthy()
    expect(exitMock).not.toHaveBeenCalled()
  })
})
