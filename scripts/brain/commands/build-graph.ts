#!/usr/bin/env node
/**
 * BRAIN COMMAND: build-graph
 *
 * Build queryable capability graph from manifests using Codex
 * Wrapper for SKILLS/capability-graph-builder/build-graph.sh
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
${colorize('brain build-graph', 'bright')} - Build capability graph from manifests

${colorize('Usage:', 'bright')}
  brain build-graph [options]

${colorize('Options:', 'bright')}
  --output <path>        Output path for capability-graph.json (default: META/capability-graph.json)
  --validate             Run Codex validation on relationships
  --infer-missing        Use Codex to infer missing relationships
  --help, -h             Show this help message

${colorize('Examples:', 'bright')}
  # Build capability graph with defaults
  brain build-graph

  # Build with validation and inference
  brain build-graph --validate --infer-missing

  # Specify custom output location
  brain build-graph --output /tmp/capability-graph.json

${colorize('Description:', 'bright')}
  Scans all manifest.yaml files in SKILLS/, MCP-SERVERS/, TOOLS/, COMPONENTS/,
  and INTEGRATIONS/ directories to build a queryable graph structure. The graph
  represents capabilities as nodes and their relationships (requires, enables,
  conflicts_with, composes_with) as edges.

  Optionally uses Codex to:
  - Validate bidirectional relationship consistency
  - Infer missing relationships from descriptions
  - Detect circular dependencies and conflicts
`)
}

export async function execute(args: string[], rootPath: string): Promise<void> {
  // Parse arguments
  let outputPath = ''
  let validate = false
  let inferMissing = false

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--output':
        outputPath = args[++i]
        break
      case '--validate':
        validate = true
        break
      case '--infer-missing':
        inferMissing = true
        break
      case '--help':
      case '-h':
        printUsage()
        return
      default:
        printError(`Unknown option: ${args[i]}`)
        printUsage()
        process.exit(1)
    }
  }

  const scriptPath = path.resolve(rootPath, 'SKILLS/capability-graph-builder/build-graph.sh')

  printHeader('Build Capability Graph')
  if (outputPath) {
    printInfo(`Output: ${outputPath}`)
  }
  if (validate) {
    printInfo('Validation: enabled')
  }
  if (inferMissing) {
    printInfo('Inference: enabled')
  }

  try {
    // Build command
    let cmd = `bash "${scriptPath}"`
    if (outputPath) {
      const fullOutputPath = path.isAbsolute(outputPath)
        ? outputPath
        : path.resolve(rootPath, outputPath)
      cmd += ` --output "${fullOutputPath}"`
    }
    if (validate) {
      cmd += ' --validate'
    }
    if (inferMissing) {
      cmd += ' --infer-missing'
    }

    printInfo('Building capability graph...\n')

    // Execute the script
    const { stdout, stderr } = await execAsync(cmd, {
      cwd: rootPath,
      maxBuffer: 20 * 1024 * 1024 // 20MB buffer for large graphs
    })

    if (stdout) {
      console.log(stdout)
    }
    if (stderr) {
      console.error(stderr)
    }

    printSuccess('Capability graph build complete!')
  } catch (error) {
    const err = error as any
    printError('Graph build failed')
    if (err.stdout) console.log(err.stdout)
    if (err.stderr) console.error(err.stderr)
    process.exit(1)
  }
}
