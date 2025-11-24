// @ts-nocheck
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

let createGenerateCommand: (typeof import('../../CLI/commands/generate.js'))['createGenerateCommand']

beforeAll(async () => {
  const mod = await import('../../CLI/commands/generate.js')
  createGenerateCommand = mod.createGenerateCommand
})

describe('generate command', () => {
  let fsMock: any
  let oraMock: ReturnType<typeof vi.fn>
  let exitMock: ReturnType<typeof vi.fn>
  let componentGenerator: { generate: ReturnType<typeof vi.fn> }
  let generateCommand: ReturnType<typeof createGenerateCommand>
  let configContent: string

  beforeEach(() => {
    configContent = `components:\n  - name: Button\n    tests: true\n`
    fsMock = {
      pathExists: vi.fn(async (target: string) => target.endsWith('.yaml')),
      readFile: vi.fn(async () => configContent),
      ensureDir: vi.fn(async () => {}),
      writeFile: vi.fn(async () => {})
    }

    oraMock = vi.fn(() => ({
      start: vi.fn(function start() {
        return this
      }),
      succeed: vi.fn()
    }))

    componentGenerator = {
      generate: vi.fn(async () => [
        { path: 'components/Button.tsx', content: 'export const Button = () => null' }
      ])
    }

    exitMock = vi.fn()

    generateCommand = createGenerateCommand({
      fs: fsMock,
      ora: oraMock,
      componentGeneratorFactory: () => componentGenerator,
      mcpGeneratorFactory: () => ({
        generate: vi.fn(async () => [])
      }),
      integrationGeneratorFactory: () => ({
        generate: vi.fn(async () => [])
      }),
      exit: exitMock
    })

    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('exits when config file missing', async () => {
    fsMock.pathExists.mockResolvedValue(false)
    await generateCommand({ config: 'missing.yaml', output: '.', dryRun: false })
    expect(exitMock).toHaveBeenCalledWith(1)
  })

  it('performs dry run without writing files', async () => {
    await generateCommand({ config: 'ai-dev.config.yaml', output: '.', dryRun: true })
    expect(fsMock.ensureDir).not.toHaveBeenCalled()
    expect(exitMock).not.toHaveBeenCalled()
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('DRY RUN'))
  })

  it('generates files using component generator', async () => {
    await generateCommand({ config: 'ai-dev.config.yaml', output: 'src', dryRun: false })
    expect(componentGenerator.generate).toHaveBeenCalledWith({ name: 'Button', tests: true })
    expect(fsMock.writeFile).toHaveBeenCalledWith(
      'src/components/Button.tsx',
      'export const Button = () => null'
    )
    expect(exitMock).not.toHaveBeenCalled()
  })
})
