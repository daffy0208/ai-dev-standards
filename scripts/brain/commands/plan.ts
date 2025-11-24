#!/usr/bin/env node
/**
 * BRAIN COMMAND: plan
 *
 * Plan multi-step workflows using Claude Code orchestration
 * Creates orchestration request for Claude Code to execute
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
${colorize('brain plan', 'bright')} - Create planning request for Claude Code orchestration

${colorize('Usage:', 'bright')}
  brain plan <goal> [options]

${colorize('Options:', 'bright')}
  --project <path>       Project directory to analyze (default: current directory)
  --priority <level>     Priority: low|medium|high|urgent (default: medium)
  --help, -h             Show this help message

${colorize('Arguments:', 'bright')}
  <goal>                 High-level goal to plan for (required)

${colorize('Examples:', 'bright')}
  # Plan RAG system implementation
  brain plan "implement RAG system"

  # Plan with high priority
  brain plan "add authentication" --priority high

  # Plan for specific project
  brain plan "optimize performance" --project /path/to/project

${colorize('Description:', 'bright')}
  Creates an orchestration request for Claude Code to execute. Claude Code will:
  1. Analyze the goal to identify required effects
  2. Find capabilities from the graph that produce those effects
  3. Validate preconditions against current project state
  4. Build execution plan with dependencies
  5. Provide detailed recommendations

  After creating the request, you'll need to tell Claude Code to execute it.
`)
}

export async function execute(args: string[], rootPath: string): Promise<void> {
  // Parse arguments
  let goal = ''
  let projectPath = ''
  let priority = 'medium'

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--project':
        projectPath = args[++i]
        break
      case '--priority':
        priority = args[++i]
        break
      case '--help':
      case '-h':
        printUsage()
        return
      default:
        if (!args[i].startsWith('--')) {
          // First non-flag argument is the goal (only take this one argument)
          goal = args[i]
        } else {
          printError(`Unknown option: ${args[i]}`)
          printUsage()
          process.exit(1)
        }
    }
  }

  if (!goal) {
    printError('Goal is required')
    printUsage()
    process.exit(1)
  }

  const createRequestScript = path.resolve(rootPath, 'scripts/orchestration/create-request.sh')

  printHeader(`Creating Planning Request: "${goal}"`)
  if (projectPath) {
    printInfo(`Project: ${projectPath}`)
  }
  printInfo(`Priority: ${priority}`)

  try {
    // Build command
    let cmd = `bash "${createRequestScript}" plan "${goal}" --priority ${priority}`

    if (projectPath) {
      const fullProjectPath = path.isAbsolute(projectPath)
        ? projectPath
        : path.resolve(rootPath, projectPath)
      cmd += ` --project-path "${fullProjectPath}"`
    } else {
      cmd += ` --project-path "${rootPath}"`
    }

    printInfo('Creating orchestration request...\n')

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

    printSuccess('Orchestration request created successfully!')
  } catch (error) {
    const err = error as any
    printError('Failed to create orchestration request')
    if (err.stdout) console.log(err.stdout)
    if (err.stderr) console.error(err.stderr)
    process.exit(1)
  }
}
