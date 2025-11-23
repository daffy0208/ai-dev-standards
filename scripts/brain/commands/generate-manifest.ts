#!/usr/bin/env node
/**
 * BRAIN COMMAND: generate-manifest
 *
 * Generate capability manifests from skill/MCP descriptions using Codex
 * Wrapper for SKILLS/manifest-generator/generate-manifest.sh
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
${colorize('brain generate-manifest', 'bright')} - Generate capability manifest using Codex

${colorize('Usage:', 'bright')}
  brain generate-manifest --path <resource-path> [options]

${colorize('Options:', 'bright')}
  --path <path>          Path to resource directory (required)
  --type <type>          Resource type: skill|mcp|tool|component|integration (default: skill)
  --output <path>        Output path for manifest.yaml (default: <resource-path>/manifest.yaml)
  --help, -h             Show this help message

${colorize('Examples:', 'bright')}
  # Generate manifest for a skill
  brain generate-manifest --path SKILLS/rag-implementer

  # Generate manifest for an MCP
  brain generate-manifest --path MCP-SERVERS/vector-database-mcp --type mcp

  # Specify custom output path
  brain generate-manifest --path SKILLS/api-designer --output /tmp/manifest.yaml

${colorize('Description:', 'bright')}
  Uses OpenAI Codex to analyze skill/MCP descriptions and automatically generate
  capability manifests. Infers preconditions, effects, domains, compatibility,
  and resource requirements from the description and implementation.
`)
}

export async function execute(args: string[], rootPath: string): Promise<void> {
  // Parse arguments
  let resourcePath = ''
  let resourceType = 'skill'
  let outputPath = ''

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--path':
        resourcePath = args[++i]
        break
      case '--type':
        resourceType = args[++i]
        break
      case '--output':
        outputPath = args[++i]
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

  if (!resourcePath) {
    printError('--path is required')
    printUsage()
    process.exit(1)
  }

  // Resolve paths
  const fullResourcePath = path.isAbsolute(resourcePath)
    ? resourcePath
    : path.resolve(rootPath, resourcePath)

  const scriptPath = path.resolve(rootPath, 'SKILLS/manifest-generator/generate-manifest.sh')

  printHeader('Generate Manifest')
  printInfo(`Resource: ${resourcePath}`)
  printInfo(`Type: ${resourceType}`)
  if (outputPath) {
    printInfo(`Output: ${outputPath}`)
  }

  try {
    // Build command
    let cmd = `bash "${scriptPath}" --path "${fullResourcePath}" --type "${resourceType}"`
    if (outputPath) {
      const fullOutputPath = path.isAbsolute(outputPath)
        ? outputPath
        : path.resolve(rootPath, outputPath)
      cmd += ` --output "${fullOutputPath}"`
    }

    printInfo('Running manifest generator...\n')

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

    printSuccess('Manifest generation complete!')
  } catch (error) {
    const err = error as any
    printError('Manifest generation failed')
    if (err.stdout) console.log(err.stdout)
    if (err.stderr) console.error(err.stderr)
    process.exit(1)
  }
}
