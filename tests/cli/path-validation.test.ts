import os from 'os'
import path from 'path'
import fs from 'fs-extra'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import pathValidation from '../../CLI/utils/path-validation.js'

const { validateFilePath, validateEnvPath, validateReportPath, validateServiceURL } = pathValidation

describe('path validation utilities', () => {
  let workspace: string

  beforeEach(async () => {
    workspace = await fs.mkdtemp(path.join(os.tmpdir(), 'path-validation-'))
  })

  afterEach(async () => {
    if (workspace) {
      await fs.remove(workspace)
    }
  })

  it('resolves file paths relative to workspace root', () => {
    const resolved = validateFilePath('logs/output.txt', workspace)
    expect(resolved).toBe(path.join(workspace, 'logs', 'output.txt'))
  })

  it('rejects attempts to escape the workspace', () => {
    expect(() => validateFilePath('../secrets.env', workspace)).toThrow(/path traversal/i)
  })

  it('defaults environment paths to .env.local and enforces .env prefix', () => {
    const defaultEnv = validateEnvPath(undefined, workspace)
    expect(defaultEnv).toBe(path.join(workspace, '.env.local'))

    expect(() => validateEnvPath('config.txt', workspace)).toThrow(/must be a \.env file/i)
  })

  it('validates report paths and requires json extension', () => {
    const reportPath = validateReportPath('reports/audit.json', workspace)
    expect(reportPath).toBe(path.join(workspace, 'reports', 'audit.json'))

    expect(() => validateReportPath('reports/audit.txt', workspace)).toThrow(
      /must be a \.json file/i
    )
  })

  it('enforces allowed hostnames for service URLs', () => {
    const allowed = ['supabase.co', '.supabase.co']
    expect(validateServiceURL('https://project.supabase.co', 'Supabase', allowed)).toBe(
      'https://project.supabase.co'
    )

    expect(() => validateServiceURL('https://example.com', 'Supabase', allowed)).toThrow(
      /not allowed/i
    )
  })
})
