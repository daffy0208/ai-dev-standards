#!/usr/bin/env node
/**
 * BRAIN COMMAND: diagnose
 *
 * Analyze project health and recommend capabilities using Codex
 * Wrapper for SKILLS/system-diagnostician/diagnose.sh
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
${colorize('brain diagnose', 'bright')} - Analyze project health and recommend capabilities

${colorize('Usage:', 'bright')}
  brain diagnose [project-path] [options]

${colorize('Options:', 'bright')}
  --graph <path>         Path to capability-graph.json (default: META/capability-graph.json)
  --focus <areas>        Comma-separated focus areas (e.g., security,performance,testing)
  --metrics              Include detailed metrics in output
  --output <path>        Output path for diagnostic report JSON (optional)
  --help, -h             Show this help message

${colorize('Arguments:', 'bright')}
  [project-path]         Path to project directory (default: current directory)

${colorize('Examples:', 'bright')}
  # Diagnose current project
  brain diagnose

  # Diagnose specific project
  brain diagnose /path/to/project

  # Focus on security and performance
  brain diagnose --focus security,performance

  # Include detailed metrics
  brain diagnose --metrics

  # Save diagnostic report
  brain diagnose --output /tmp/diagnostic-report.json

${colorize('Description:', 'bright')}
  Performs comprehensive project health analysis across 8 dimensions:

  1. Testing - Coverage, quality, test types
  2. Documentation - README, API docs, comments
  3. Security - Vulnerabilities, auth patterns, input validation
  4. Performance - Bottlenecks, optimization opportunities
  5. Code Quality - Linting, formatting, type safety
  6. Architecture - Structure, patterns, scalability
  7. Dependencies - Outdated packages, security issues, bloat
  8. CI/CD - Automation, deployment strategy

  Uses Codex to:
  - Understand project structure and framework
  - Identify missing or incomplete capabilities
  - Detect anti-patterns and code smells
  - Suggest specific capabilities to address issues
  - Prioritize recommendations by impact and effort

  Output includes:
  - Overall health score (0.0-1.0)
  - Scores per dimension
  - Prioritized action plan
  - Quick wins (high impact, low effort)
  - Critical issues requiring immediate attention
`)
}

export async function execute(args: string[], rootPath: string): Promise<void> {
  // Parse arguments
  let projectPath = '.'
  let graphPath = ''
  let focusAreas = ''
  let includeMetrics = false
  let outputPath = ''

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--graph':
        graphPath = args[++i]
        break
      case '--focus':
        focusAreas = args[++i]
        break
      case '--metrics':
        includeMetrics = true
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
          projectPath = args[i]
        } else {
          printError(`Unknown option: ${args[i]}`)
          printUsage()
          process.exit(1)
        }
    }
  }

  // Resolve paths
  const fullProjectPath = path.isAbsolute(projectPath)
    ? projectPath
    : path.resolve(process.cwd(), projectPath)

  const scriptPath = path.resolve(rootPath, 'SKILLS/system-diagnostician/diagnose.sh')

  printHeader('Project Health Diagnostic')
  printInfo(`Project: ${fullProjectPath}`)
  if (graphPath) {
    printInfo(`Graph: ${graphPath}`)
  }
  if (focusAreas) {
    printInfo(`Focus: ${focusAreas}`)
  }
  if (includeMetrics) {
    printInfo('Metrics: enabled')
  }

  try {
    // Build command
    let cmd = `bash "${scriptPath}" "${fullProjectPath}"`

    if (graphPath) {
      const fullGraphPath = path.isAbsolute(graphPath)
        ? graphPath
        : path.resolve(rootPath, graphPath)
      cmd += ` --graph "${fullGraphPath}"`
    }

    if (focusAreas) {
      cmd += ` --focus "${focusAreas}"`
    }

    if (includeMetrics) {
      cmd += ' --metrics'
    }

    if (outputPath) {
      const fullOutputPath = path.isAbsolute(outputPath)
        ? outputPath
        : path.resolve(rootPath, outputPath)
      cmd += ` --output "${fullOutputPath}"`
    }

    printInfo('Analyzing project health...\n')

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

    printSuccess('Diagnostic complete!')
  } catch (error) {
    const err = error as any
    printError('Diagnostic failed')
    if (err.stdout) console.log(err.stdout)
    if (err.stderr) console.error(err.stderr)
    process.exit(1)
  }
}
