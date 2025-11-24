#!/usr/bin/env node
/**
 * BRAIN COMMAND: validate-skill
 *
 * Validate implementations match manifests using Codex
 * Wrapper for SKILLS/skill-validator/validate.sh
 */

import * as path from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m'
}

function colorize(text: string, color: keyof typeof COLORS): string {
  return `${COLORS[color]}${text}${COLORS.reset}`
}

function printHeader(text: string) {
  console.log(colorize(`\n━━━ ${text} ━━━\n`, 'bright'))
}

function printSuccess(text: string) {
  console.log(colorize(`✓ ${text}`, 'green'))
}

function printError(text: string) {
  console.log(colorize(`✗ ${text}`, 'red'))
}

function printInfo(text: string) {
  console.log(colorize(`→ ${text}`, 'cyan'))
}

export function printUsage() {
  console.log(`
${colorize('brain validate-skill', 'bright')} - Validate implementation matches manifest

${colorize('Usage:', 'bright')}
  brain validate-skill <resource-path> [options]

${colorize('Options:', 'bright')}
  --manifest <path>      Path to manifest.yaml (default: <resource-path>/manifest.yaml)
  --implementation <path> Path to implementation file (default: auto-detect)
  --strict               Fail on warnings (default: false)
  --output <path>        Output path for validation report JSON (optional)
  --help, -h             Show this help message

${colorize('Arguments:', 'bright')}
  <resource-path>        Path to skill/MCP directory (required)

${colorize('Examples:', 'bright')}
  # Validate a skill
  brain validate-skill SKILLS/rag-implementer

  # Validate with strict mode (fail on warnings)
  brain validate-skill SKILLS/api-designer --strict

  # Specify custom manifest and implementation paths
  brain validate-skill SKILLS/frontend-builder \\
    --manifest /tmp/manifest.yaml \\
    --implementation src/index.ts

  # Save validation report
  brain validate-skill MCP-SERVERS/vector-database-mcp --output /tmp/report.json

${colorize('Description:', 'bright')}
  Uses Codex to perform semantic analysis comparing manifest descriptions,
  preconditions, and effects against actual implementation code. Detects:

  - Description-implementation drift
  - Missing or incomplete features
  - Unenforced preconditions
  - Unimplemented effects
  - Undocumented functionality
  - API surface inconsistencies

  Generates a validation report with:
  - Overall score (0.0-1.0)
  - Detailed scores per dimension
  - List of issues with severity levels
  - Actionable suggestions for fixes
`)
}

export async function execute(args: string[], rootPath: string): Promise<void> {
  // Parse arguments
  let resourcePath = ''
  let manifestPath = ''
  let implementationPath = ''
  let strict = false
  let outputPath = ''

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--manifest':
        manifestPath = args[++i]
        break
      case '--implementation':
        implementationPath = args[++i]
        break
      case '--strict':
        strict = true
        break
      case '--output':
        outputPath = args[++i]
        break
      case '--help':
      case '-h':
        printUsage()
        return
      default:
        if (!args[i].startsWith('--')) {
          resourcePath = args[i]
        } else {
          printError(`Unknown option: ${args[i]}`)
          printUsage()
          process.exit(1)
        }
    }
  }

  if (!resourcePath) {
    printError('Resource path is required')
    printUsage()
    process.exit(1)
  }

  // Resolve paths
  const fullResourcePath = path.isAbsolute(resourcePath)
    ? resourcePath
    : path.resolve(rootPath, resourcePath)

  const scriptPath = path.resolve(rootPath, 'SKILLS/skill-validator/validate.sh')

  printHeader(`Validate Skill: ${path.basename(resourcePath)}`)
  printInfo(`Resource: ${resourcePath}`)
  if (manifestPath) {
    printInfo(`Manifest: ${manifestPath}`)
  }
  if (implementationPath) {
    printInfo(`Implementation: ${implementationPath}`)
  }
  if (strict) {
    printInfo('Mode: strict (fail on warnings)')
  }

  try {
    // Build command
    let cmd = `bash "${scriptPath}" "${fullResourcePath}"`

    if (manifestPath) {
      const fullManifestPath = path.isAbsolute(manifestPath)
        ? manifestPath
        : path.resolve(rootPath, manifestPath)
      cmd += ` --manifest "${fullManifestPath}"`
    }

    if (implementationPath) {
      const fullImplPath = path.isAbsolute(implementationPath)
        ? implementationPath
        : path.resolve(rootPath, implementationPath)
      cmd += ` --implementation "${fullImplPath}"`
    }

    if (strict) {
      cmd += ' --strict'
    }

    if (outputPath) {
      const fullOutputPath = path.isAbsolute(outputPath)
        ? outputPath
        : path.resolve(rootPath, outputPath)
      cmd += ` --output "${fullOutputPath}"`
    }

    printInfo('Running validation...\n')

    // Execute the script
    const { stdout, stderr } = await execAsync(cmd, {
      cwd: rootPath,
      maxBuffer: 10 * 1024 * 1024 // 10MB buffer
    })

    if (stdout) {
      console.log(stdout)
    }
    if (stderr) {
      console.error(stderr)
    }

    printSuccess('Validation complete!')
  } catch (error) {
    const err = error as any
    printError('Validation failed')
    if (err.stdout) console.log(err.stdout)
    if (err.stderr) console.error(err.stderr)
    process.exit(1)
  }
}
