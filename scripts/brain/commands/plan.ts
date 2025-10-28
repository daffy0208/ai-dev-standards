#!/usr/bin/env node
/**
 * BRAIN COMMAND: plan
 *
 * Plan multi-step workflows using capability graph and Codex
 * Wrapper for SKILLS/orchestration-planner/plan-workflow.sh
 */

import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

function colorize(text: string, color: keyof typeof COLORS): string {
  return `${COLORS[color]}${text}${COLORS.reset}`;
}

function printHeader(text: string) {
  console.log(colorize(`\n━━━ ${text} ━━━\n`, 'bright'));
}

function printSuccess(text: string) {
  console.log(colorize(`✓ ${text}`, 'green'));
}

function printError(text: string) {
  console.log(colorize(`✗ ${text}`, 'red'));
}

function printInfo(text: string) {
  console.log(colorize(`→ ${text}`, 'cyan'));
}

export function printUsage() {
  console.log(`
${colorize('brain plan', 'bright')} - Plan multi-step workflows using capability graph

${colorize('Usage:', 'bright')}
  brain plan <goal> [options]

${colorize('Options:', 'bright')}
  --graph <path>         Path to capability-graph.json (default: META/capability-graph.json)
  --project <path>       Project directory to analyze (default: current directory)
  --cost-weight <n>      Weight for cost optimization 0.0-1.0 (default: 0.3)
  --risk-weight <n>      Weight for risk minimization 0.0-1.0 (default: 0.3)
  --output <path>        Output path for plan JSON (optional)
  --help, -h             Show this help message

${colorize('Arguments:', 'bright')}
  <goal>                 High-level goal to plan for (required)

${colorize('Examples:', 'bright')}
  # Plan RAG system implementation
  brain plan "implement RAG system"

  # Plan with custom weights (prioritize low risk)
  brain plan "add authentication" --risk-weight 0.5 --cost-weight 0.2

  # Plan for specific project
  brain plan "optimize performance" --project /path/to/project

  # Save plan to file
  brain plan "build API" --output /tmp/api-plan.json

${colorize('Description:', 'bright')}
  Uses Codex to decompose high-level goals into executable workflows by:
  1. Analyzing the goal to identify required effects
  2. Finding capabilities from the graph that produce those effects
  3. Validating preconditions against current project state
  4. Building a Hierarchical Task Network (HTN) with alternatives
  5. Scoring and ranking plans by cost, latency, risk, and diversity

  The output includes:
  - Ordered capability sequence with dependencies
  - Alternative capabilities for each step
  - Precondition checks and validation
  - Cost/latency/risk estimates
  - Detailed reasoning for each decision
`);
}

export async function execute(args: string[], rootPath: string): Promise<void> {
  // Parse arguments
  let goal = '';
  let graphPath = '';
  let projectPath = '';
  let costWeight = '';
  let riskWeight = '';
  let outputPath = '';

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--graph':
        graphPath = args[++i];
        break;
      case '--project':
        projectPath = args[++i];
        break;
      case '--cost-weight':
        costWeight = args[++i];
        break;
      case '--risk-weight':
        riskWeight = args[++i];
        break;
      case '--output':
        outputPath = args[++i];
        break;
      case '--help':
      case '-h':
        printUsage();
        return;
      default:
        if (!args[i].startsWith('--')) {
          // Collect all non-flag arguments as the goal
          goal = args.slice(i).filter(arg => !arg.startsWith('--')).join(' ');
          break;
        } else {
          printError(`Unknown option: ${args[i]}`);
          printUsage();
          process.exit(1);
        }
    }
  }

  if (!goal) {
    printError('Goal is required');
    printUsage();
    process.exit(1);
  }

  const scriptPath = path.resolve(rootPath, 'SKILLS/orchestration-planner/plan-workflow.sh');

  printHeader(`Plan Workflow: "${goal}"`);
  if (graphPath) {
    printInfo(`Graph: ${graphPath}`);
  }
  if (projectPath) {
    printInfo(`Project: ${projectPath}`);
  }

  try {
    // Build command
    let cmd = `bash "${scriptPath}" --goal "${goal}"`;

    if (graphPath) {
      const fullGraphPath = path.isAbsolute(graphPath)
        ? graphPath
        : path.resolve(rootPath, graphPath);
      cmd += ` --graph "${fullGraphPath}"`;
    }

    if (projectPath) {
      const fullProjectPath = path.isAbsolute(projectPath)
        ? projectPath
        : path.resolve(rootPath, projectPath);
      cmd += ` --project "${fullProjectPath}"`;
    }

    if (costWeight) {
      cmd += ` --cost-weight ${costWeight}`;
    }

    if (riskWeight) {
      cmd += ` --risk-weight ${riskWeight}`;
    }

    if (outputPath) {
      const fullOutputPath = path.isAbsolute(outputPath)
        ? outputPath
        : path.resolve(rootPath, outputPath);
      cmd += ` --output "${fullOutputPath}"`;
    }

    printInfo('Planning workflow...\n');

    // Execute the script
    const { stdout, stderr } = await execAsync(cmd, {
      cwd: rootPath,
      maxBuffer: 10 * 1024 * 1024, // 10MB buffer
    });

    if (stdout) {
      console.log(stdout);
    }
    if (stderr) {
      console.error(stderr);
    }

    printSuccess('Workflow planning complete!');
  } catch (error) {
    const err = error as any;
    printError('Planning failed');
    if (err.stdout) console.log(err.stdout);
    if (err.stderr) console.error(err.stderr);
    process.exit(1);
  }
}
