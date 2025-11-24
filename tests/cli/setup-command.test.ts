// @ts-nocheck
import { beforeAll, beforeEach, afterEach, describe, expect, it, vi } from 'vitest'

const promptMock = vi.fn()
const execaMock = vi.fn(async () => ({ stdout: '', stderr: '' }))
const ensureDirMock = vi.fn(async () => {})
const writeFileMock = vi.fn(async () => {})
const appendFileMock = vi.fn(async () => {})
const envPathMock = vi.fn(() => '/tmp/project/.env.local')

const chalkMock = {
  blue: (value: string) => value,
  bold: (value: string) => value,
  gray: (value: string) => value,
  cyan: (value: string) => value,
  green: (value: string) => value,
  red: (value: string) => value,
  yellow: (value: string) => value
}

const createSpinner = () => {
  const spinner = {
    text: '',
    start: vi.fn(() => spinner),
    succeed: vi.fn(),
    fail: vi.fn()
  }
  return spinner
}

let createSetupCommandFactory:
  | ((
      overrides?: Record<string, unknown>
    ) => (integration: string, options: Record<string, unknown>) => Promise<void>)
  | undefined
let setupCommand: (integration: string, options: Record<string, unknown>) => Promise<void>
let oraMock: ReturnType<typeof vi.fn>

beforeAll(async () => {
  const mod = await import('../../CLI/commands/setup.js')
  createSetupCommandFactory =
    mod.createSetupCommand || (mod.default && mod.default.createSetupCommand)
  if (!createSetupCommandFactory) {
    throw new Error('createSetupCommand export not found')
  }
})

describe('setup command', () => {
  let logSpy: ReturnType<typeof vi.spyOn>
  let errorSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    vi.clearAllMocks()
    promptMock.mockReset()
    execaMock.mockReset()
    ensureDirMock.mockReset()
    writeFileMock.mockReset()
    appendFileMock.mockReset()
    envPathMock.mockReset()
    execaMock.mockResolvedValue({ stdout: '', stderr: '' })
    envPathMock.mockReturnValue('/tmp/project/.env.local')
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    oraMock = vi.fn(() => createSpinner())
    setupCommand = createSetupCommandFactory!({
      chalk: chalkMock,
      ora: oraMock,
      inquirer: { prompt: promptMock },
      execa: execaMock,
      fs: {
        ensureDir: ensureDirMock,
        writeFile: writeFileMock,
        appendFile: appendFileMock
      },
      validateEnvPath: envPathMock,
      validateServiceURL: vi.fn((value: string) => value)
    })
  })

  afterEach(() => {
    logSpy.mockRestore()
    errorSpy.mockRestore()
  })

  it('installs supabase with auth helpers and writes configuration files', async () => {
    promptMock.mockResolvedValue({
      url: 'https://project.supabase.co',
      anonKey: 'anon-key'
    })

    await setupCommand('supabase', { env: '.env.demo', withAuth: true })

    expect(execaMock).toHaveBeenCalledWith('npm', ['install', '@supabase/supabase-js'])
    expect(execaMock).toHaveBeenCalledWith('npm', ['install', '@supabase/auth-helpers-nextjs'])

    expect(ensureDirMock).toHaveBeenCalledWith('lib')
    expect(writeFileMock).toHaveBeenCalledWith(
      'lib/supabase.ts',
      expect.stringContaining('createClient')
    )
    expect(writeFileMock).toHaveBeenCalledWith('lib/auth.ts', expect.stringContaining('signIn'))

    expect(envPathMock).toHaveBeenCalledWith('.env.demo')
    expect(appendFileMock).toHaveBeenCalledWith(
      '/tmp/project/.env.local',
      expect.stringContaining('NEXT_PUBLIC_SUPABASE_URL=https://project.supabase.co')
    )

    const envAppend = appendFileMock.mock.calls[0]?.[1]
    expect(envAppend).toContain('NEXT_PUBLIC_SUPABASE_ANON_KEY=anon-key')
  })

  it('configures Pinecone with RAG helpers', async () => {
    promptMock.mockResolvedValue({
      apiKey: 'pinecone-key',
      environment: 'us-west1-gcp',
      indexName: 'docs-index'
    })

    await setupCommand('pinecone', { env: '.env.demo', withRag: true })

    expect(execaMock).toHaveBeenCalledWith('npm', ['install', '@pinecone-database/pinecone'])
    expect(execaMock).toHaveBeenCalledWith('npm', ['install', 'langchain', 'openai'])

    expect(writeFileMock).toHaveBeenCalledWith(
      'lib/pinecone.ts',
      expect.stringContaining("pinecone.index('docs-index')")
    )
    expect(writeFileMock).toHaveBeenCalledWith(
      'lib/rag.ts',
      expect.stringContaining('PineconeStore')
    )

    expect(appendFileMock).toHaveBeenCalledWith(
      '/tmp/project/.env.local',
      expect.stringContaining('PINECONE_API_KEY=pinecone-key')
    )
  })

  it('sets up Stripe integration and checkout helper', async () => {
    promptMock.mockResolvedValue({
      secretKey: 'sk_test_123',
      publicKey: 'pk_test_456'
    })

    await setupCommand('stripe', { env: '.env.demo' })

    expect(execaMock).toHaveBeenCalledWith('npm', ['install', 'stripe', '@stripe/stripe-js'])
    expect(writeFileMock).toHaveBeenCalledWith(
      'lib/stripe.ts',
      expect.stringContaining('new Stripe')
    )
    expect(writeFileMock).toHaveBeenCalledWith(
      'lib/checkout.ts',
      expect.stringContaining('createCheckoutSession')
    )

    expect(appendFileMock).toHaveBeenCalledWith(
      '/tmp/project/.env.local',
      expect.stringContaining('STRIPE_SECRET_KEY=sk_test_123')
    )
    const envAppend = appendFileMock.mock.calls.at(-1)?.[1]
    expect(envAppend).toContain('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_456')
    expect(envAppend).toContain('NEXT_PUBLIC_URL=http://localhost:3000')
  })

  it('installs Resend email helper', async () => {
    promptMock.mockResolvedValue({
      apiKey: 're_test_123'
    })

    await setupCommand('resend', { env: '.env.demo' })

    expect(execaMock).toHaveBeenCalledWith('npm', ['install', 'resend'])
    expect(writeFileMock).toHaveBeenCalledWith(
      'lib/email.ts',
      expect.stringContaining('resend.emails.send')
    )
    expect(appendFileMock).toHaveBeenCalledWith(
      '/tmp/project/.env.local',
      expect.stringContaining('RESEND_API_KEY=re_test_123')
    )
  })

  it('configures OpenAI helper with api key', async () => {
    promptMock.mockResolvedValue({
      apiKey: 'sk-test-openai'
    })

    await setupCommand('openai', { env: '.env.demo' })

    expect(execaMock).toHaveBeenCalledWith('npm', ['install', 'openai'])
    expect(writeFileMock).toHaveBeenCalledWith(
      'lib/openai.ts',
      expect.stringContaining('new OpenAI')
    )
    expect(appendFileMock).toHaveBeenCalledWith(
      '/tmp/project/.env.local',
      expect.stringContaining('OPENAI_API_KEY=sk-test-openai')
    )
  })

  it('configures Anthropic helper with api key', async () => {
    promptMock.mockResolvedValue({
      apiKey: 'sk-ant-abc'
    })

    await setupCommand('anthropic', { env: '.env.demo' })

    expect(execaMock).toHaveBeenCalledWith('npm', ['install', '@anthropic-ai/sdk'])
    expect(writeFileMock).toHaveBeenCalledWith(
      'lib/anthropic.ts',
      expect.stringContaining('new Anthropic')
    )
    expect(appendFileMock).toHaveBeenCalledWith(
      '/tmp/project/.env.local',
      expect.stringContaining('ANTHROPIC_API_KEY=sk-ant-abc')
    )
  })
})
