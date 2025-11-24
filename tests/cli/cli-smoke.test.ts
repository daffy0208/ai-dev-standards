import os from 'os'
import path from 'path'
import fs from 'fs-extra'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import doctorCommand from '../../CLI/commands/doctor.js'
import analyzeCommand from '../../CLI/commands/analyze.js'

async function createTempProject(): Promise<string> {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'ai-dev-standards-'))
  await fs.writeJSON(path.join(tempDir, 'package.json'), {
    name: 'cli-smoke-project',
    version: '1.0.0',
    dependencies: {
      lodash: '^4.17.21'
    }
  })
  await fs.writeFile(
    path.join(tempDir, 'index.js'),
    "const _ = require('lodash'); module.exports = _.isString('test');"
  )
  await fs.writeFile(path.join(tempDir, 'README.md'), '# Demo project')
  await fs.writeFile(path.join(tempDir, '.env.example'), 'API_KEY=demo')
  await fs.writeFile(path.join(tempDir, '.env.local'), 'API_KEY=demo')
  await fs.writeFile(path.join(tempDir, 'tsconfig.json'), '{ }')
  await fs.ensureDir(path.join(tempDir, 'node_modules'))
  await fs.ensureDir(path.join(tempDir, '.git'))
  return tempDir
}

describe('CLI smoke tests', () => {
  let tempDir: string
  let cwdSpy: ReturnType<typeof vi.spyOn>

  beforeEach(async () => {
    tempDir = await createTempProject()
    cwdSpy = vi.spyOn(process, 'cwd').mockReturnValue(tempDir)
    process.env.AI_DEV_SKIP_NPM_OUTDATED = '1'
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(async () => {
    await fs.remove(tempDir)
    cwdSpy?.mockRestore()
    delete process.env.AI_DEV_SKIP_NPM_OUTDATED
    vi.restoreAllMocks()
  })

  it('doctor command runs without throwing', async () => {
    await expect(doctorCommand({ fixAll: false })).resolves.toBeUndefined()
  })

  it('doctor command runs in fix mode', async () => {
    await expect(doctorCommand({ fixAll: true })).resolves.toBeUndefined()
  })

  it('analyze command runs on project root', async () => {
    await expect(analyzeCommand({ directory: '.' })).resolves.toBeUndefined()
  })
})
