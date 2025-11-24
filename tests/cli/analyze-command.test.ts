// @ts-nocheck
import { beforeAll, beforeEach, afterEach, describe, expect, it, vi } from 'vitest'

const spinnerFactory = () => {
  const spinner = {
    start: vi.fn(() => spinner),
    succeed: vi.fn(),
    fail: vi.fn(),
    text: ''
  }
  return spinner
}

const fakePath = {
  resolve: (...segments: string[]) => segments.join('/'),
  join: (...segments: string[]) => segments.join('/')
}

let createAnalyzeCommand: (typeof import('../../CLI/commands/analyze.js'))['createAnalyzeCommand']

beforeAll(async () => {
  const mod = await import('../../CLI/commands/analyze.js')
  createAnalyzeCommand = mod.createAnalyzeCommand
})

describe('analyze command', () => {
  let oraMock: ReturnType<typeof vi.fn>
  let fsMock: any
  let globMock: ReturnType<typeof vi.fn>
  let validateReportPathMock: ReturnType<typeof vi.fn>
  let exitMock: ReturnType<typeof vi.fn>
  let analyzeCommand: ReturnType<typeof createAnalyzeCommand>

  beforeEach(() => {
    const spinner = spinnerFactory()
    oraMock = vi.fn(() => spinner)
    globMock = vi.fn(async () => [])
    validateReportPathMock = vi.fn((p: string) => `/abs/${p}`)
    exitMock = vi.fn()

    fsMock = {
      pathExists: vi.fn(async () => false),
      readJson: vi.fn(async () => ({})),
      writeJson: vi.fn(async () => {}),
      readFile: vi.fn(async () => '')
    }

    analyzeCommand = createAnalyzeCommand({
      ora: oraMock,
      fs: fsMock,
      path: fakePath,
      glob: globMock,
      validateReportPath: validateReportPathMock,
      exit: exitMock
    })

    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('fails fast when package.json is missing', async () => {
    fsMock.pathExists.mockResolvedValue(false)

    await analyzeCommand({ directory: '.' })

    expect(exitMock).toHaveBeenCalledWith(1)
    const spinner = oraMock.mock.results[0]?.value
    expect(spinner.fail).toHaveBeenCalled()
  })

  it('produces a report with detected issues and warnings', async () => {
    fsMock.pathExists.mockImplementation(async (file: string) => {
      if (file.includes('package.json')) return true
      if (file.includes('tsconfig.json')) return false
      if (file.includes('.env.example')) return false
      if (file.includes('.env.local')) return true
      if (file.includes('README.md')) return false
      return false
    })
    fsMock.readJson.mockResolvedValue({
      name: 'demo-app',
      dependencies: { react: '^18.0.0' },
      devDependencies: {}
    })
    const writeJsonSpy = fsMock.writeJson

    await analyzeCommand({ directory: '.', report: 'out/report.json' })

    expect(exitMock).not.toHaveBeenCalled()
    expect(validateReportPathMock).toHaveBeenCalledWith('out/report.json')
    expect(writeJsonSpy).toHaveBeenCalled()
    const [, report] = writeJsonSpy.mock.calls[0]
    expect(report.project).toBe('demo-app')
    expect(report.issues.some((issue: any) => issue.type === 'missing-tests')).toBe(true)
    expect(report.warnings.some((warning: any) => warning.type === 'env-example')).toBe(true)
    expect(report.warnings.some((warning: any) => warning.type === 'unused-deps')).toBe(true)
  })
})
