// @ts-nocheck
import { beforeAll, beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import path from 'path'
import os from 'os'
import fs from 'fs-extra'
const fakeChalk = {
  yellow: vi.fn(() => ''),
  gray: vi.fn(() => ''),
  bold: Object.assign((value: string) => value, {
    cyan: vi.fn(() => ''),
    [Symbol.for('call')]: (value: string) => value
  }),
  cyan: vi.fn(() => ''),
  green: vi.fn(() => ''),
  red: vi.fn(() => ''),
  white: vi.fn(() => '')
}

let contextModule: typeof import('../../CLI/commands/context.js')
const tempDirs: string[] = []

beforeAll(async () => {
  contextModule = await import('../../CLI/commands/context.js')
})

beforeEach(() => {
  vi.restoreAllMocks()
})

afterEach(async () => {
  for (const dir of tempDirs.splice(0)) {
    await fs.remove(dir)
  }
})

function createTempContext() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'context-test-'))
  tempDirs.push(dir)
  const contextDir = path.join(dir, '.claude', 'context')
  fs.ensureDirSync(contextDir)
  fs.ensureDirSync(path.join(contextDir, 'sessions'))
  fs.ensureDirSync(path.join(contextDir, 'files'))
  return dir
}

describe('context command helpers', () => {
  it('showContext warns when no active session', () => {
    const dir = createTempContext()
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    contextModule.showContext({
      ...contextModule,
      fs,
      path,
      chalk: {
        yellow: vi.fn(() => 'warn'),
        gray: vi.fn(() => 'gray text'),
        bold: { cyan: vi.fn(() => 'title') }
      },
      cwd: () => dir
    })
    expect(logSpy).toHaveBeenCalled()
    logSpy.mockRestore()
  })

  it('restoreSession creates new active session', () => {
    const dir = createTempContext()
    const { SESSIONS_DIR, ACTIVE_SESSION_FILE } = contextModule.createContextPaths(dir)
    fs.writeJsonSync(path.join(SESSIONS_DIR, 'session-1.json'), {
      sessionId: 'session-1',
      startTime: new Date().toISOString(),
      modifiedFiles: [],
      skillsUsed: ['focus']
    })
    contextModule.restoreSession('session-1', {
      fs,
      path,
      chalk: fakeChalk,
      cwd: () => dir
    })
    expect(fs.existsSync(ACTIVE_SESSION_FILE)).toBe(true)
  })

  it('showContext prints session details when active session exists', () => {
    const dir = createTempContext()
    const { ACTIVE_SESSION_FILE } = contextModule.createContextPaths(dir)
    fs.writeJsonSync(ACTIVE_SESSION_FILE, {
      sessionId: 'session-42',
      startTime: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      modifiedFiles: [{ path: 'src/app.ts', type: 'changed', timestamp: new Date().toISOString() }],
      activeSkills: ['focus'],
      agentsUsed: ['builder'],
      promptCount: 3,
      fileChangeCount: 2
    })
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

    contextModule.showContext({
      ...contextModule.defaultDeps,
      fs,
      path,
      chalk: fakeChalk,
      cwd: () => dir
    })

    expect(logSpy).toHaveBeenCalled()
    logSpy.mockRestore()
  })

  it('restoreSession logs error when session missing', () => {
    const dir = createTempContext()
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    contextModule.restoreSession('missing', {
      fs,
      path,
      chalk: fakeChalk,
      cwd: () => dir
    })
    expect(logSpy).toHaveBeenCalled()
    logSpy.mockRestore()
  })
})

describe('context command actions', () => {
  it('history command lists sessions', () => {
    const dir = createTempContext()
    const { SESSIONS_DIR } = contextModule.createContextPaths(dir)
    fs.writeJsonSync(path.join(SESSIONS_DIR, 'session-1.json'), {
      sessionId: 'session-1',
      startTime: new Date().toISOString()
    })
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

    contextModule.showHistory(
      {},
      {
        ...contextModule.defaultDeps,
        fs,
        path,
        chalk: fakeChalk,
        cwd: () => dir
      }
    )

    expect(logSpy).toHaveBeenCalled()
    logSpy.mockRestore()
  })

  it('clearContext removes old files', () => {
    const dir = createTempContext()
    const { FILES_DIR } = contextModule.createContextPaths(dir)
    const filePath = path.join(FILES_DIR, 'change.json')
    fs.writeJsonSync(filePath, {})
    const pastDate = new Date(Date.now() - 31 * 24 * 60 * 60 * 1000)
    fs.utimesSync(filePath, pastDate, pastDate)

    contextModule.clearContext(
      { olderThan: 30 },
      {
        ...contextModule.defaultDeps,
        fs,
        path,
        chalk: fakeChalk,
        cwd: () => dir
      }
    )

    expect(fs.existsSync(filePath)).toBe(false)
  })

  it('contextCommand routes to stats action', () => {
    const dir = createTempContext()
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const deps = {
      ...contextModule.defaultDeps,
      fs,
      path,
      chalk: fakeChalk,
      cwd: () => dir
    }
    contextModule.default('stats', {}, deps)
    contextModule.default('unknown', {}, deps)
    logSpy.mockRestore()
  })

  it('contextCommand warns on unknown action', () => {
    const dir = createTempContext()
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    contextModule.default(
      'mystery',
      {},
      {
        ...contextModule.defaultDeps,
        fs,
        path,
        chalk: fakeChalk,
        cwd: () => dir
      }
    )
    expect(logSpy).toHaveBeenCalled()
    logSpy.mockRestore()
  })

  it('showStats reports totals when files and sessions exist', () => {
    const dir = createTempContext()
    const { FILES_DIR, SESSIONS_DIR, ACTIVE_SESSION_FILE } = contextModule.createContextPaths(dir)
    fs.writeFileSync(path.join(FILES_DIR, 'change-1.json'), JSON.stringify({ foo: 'bar' }))
    fs.writeJsonSync(path.join(SESSIONS_DIR, 'session-1.json'), {
      sessionId: 'session-1',
      startTime: new Date().toISOString(),
      endTime: new Date().toISOString()
    })
    fs.writeJsonSync(ACTIVE_SESSION_FILE, {
      sessionId: 'active',
      startTime: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      modifiedFiles: []
    })

    const chalkStub = {
      bold: { cyan: vi.fn(() => '') },
      gray: vi.fn(() => '')
    }

    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

    contextModule.showStats({
      ...contextModule.defaultDeps,
      fs,
      path,
      chalk: chalkStub,
      cwd: () => dir
    })

    expect(logSpy).toHaveBeenCalled()
    logSpy.mockRestore()
  })

  it('contextCommand restore creates new active session', () => {
    const dir = createTempContext()
    const { SESSIONS_DIR, ACTIVE_SESSION_FILE } = contextModule.createContextPaths(dir)
    fs.writeJsonSync(path.join(SESSIONS_DIR, 'session-1.json'), {
      sessionId: 'session-1',
      startTime: new Date().toISOString(),
      endTime: new Date().toISOString(),
      modifiedFiles: [{ path: 'file.ts', type: 'changed', timestamp: new Date().toISOString() }],
      skillsUsed: ['focus']
    })

    const deps = {
      ...contextModule.defaultDeps,
      fs,
      path,
      chalk: fakeChalk,
      cwd: () => dir
    }

    contextModule.default('restore', { sessionId: 'session-1' }, deps)

    expect(fs.existsSync(ACTIVE_SESSION_FILE)).toBe(true)
  })
})
