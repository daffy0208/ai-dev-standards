#!/usr/bin/env node
/**
 * REPOSITORY BRAIN CLI
 *
 * Command-line interface for the ai-dev-standards brain.
 *
 * Usage:
 *   brain status           - Show repository state
 *   brain health           - Health check
 *   brain validate         - Validate registries
 *   brain list skills      - List all skills
 *   brain list mcps        - List all MCPs
 *   brain search <query>   - Search resources
 *   brain show skill <name> - Show skill details
 *   brain relationships <skill> - Show skill relationships
 *   brain reverse-deps mcp <name> - Show what uses this MCP
 *   brain select-skills <task> - Get skill recommendations
 *   brain select-mcps <skills...> - Get required MCPs
 *   brain decide <scenario> - Get workflow recommendation
 *   brain patterns <problem> - Match architecture patterns (Phase 2)
 *   brain workflow <scenario> - Get detailed workflow with steps (Phase 2)
 *   brain analyze <task> - Comprehensive analysis with all engines (Phase 2)
 */

import * as path from 'path';
import { createBrain } from './brain-core';

const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
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

function printWarning(text: string) {
  console.log(colorize(`⚠ ${text}`, 'yellow'));
}

function printInfo(text: string) {
  console.log(colorize(`→ ${text}`, 'cyan'));
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    printUsage();
    process.exit(0);
  }

  const command = args[0];
  // From scripts/brain/dist/brain.js, go back 3 levels to reach root
  const rootPath = path.resolve(__dirname, '../../..');

  try {
    printInfo('Initializing brain...');
    const brain = await createBrain(rootPath);
    printSuccess('Brain initialized');

    switch (command) {
      case 'status':
        await commandStatus(brain);
        break;
      case 'health':
        await commandHealth(brain);
        break;
      case 'validate':
        await commandValidate(brain);
        break;
      case 'list':
        await commandList(brain, args[1]);
        break;
      case 'search':
        await commandSearch(brain, args.slice(1).join(' '));
        break;
      case 'show':
        await commandShow(brain, args[1], args[2]);
        break;
      case 'relationships':
        await commandRelationships(brain, args[1]);
        break;
      case 'reverse-deps':
        await commandReverseDeps(brain, args[1], args[2]);
        break;
      case 'select-skills':
        await commandSelectSkills(brain, args.slice(1).join(' '));
        break;
      case 'select-mcps':
        await commandSelectMCPs(brain, args.slice(1));
        break;
      case 'decide':
        await commandDecide(brain, args.slice(1).join(' '));
        break;
      case 'patterns':
        await commandPatterns(brain, args.slice(1).join(' '));
        break;
      case 'workflow':
        await commandWorkflow(brain, args.slice(1).join(' '));
        break;
      case 'analyze':
        await commandAnalyze(brain, args.slice(1).join(' '));
        break;
      default:
        printError(`Unknown command: ${command}`);
        printUsage();
        process.exit(1);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    printError(`Error: ${message}`);
    process.exit(1);
  }
}

async function commandStatus(brain: any) {
  printHeader('Repository Status');

  const status = await brain.status();

  console.log(colorize('State:', 'bright'));
  console.log(`  Skills: ${colorize(status.state.skills.toString(), 'cyan')}`);
  console.log(`  MCPs: ${colorize(status.state.mcps.toString(), 'cyan')}`);
  console.log(`  Total Resources: ${colorize(status.state.totalResources.toString(), 'cyan')}`);
  console.log(`  Last Updated: ${colorize(status.state.lastUpdated, 'dim')}`);

  console.log(`\n${colorize('Versions:', 'bright')}`);
  console.log(`  Skill Registry: ${status.state.skillRegistryVersion}`);
  console.log(`  MCP Registry: ${status.state.mcpRegistryVersion}`);
  console.log(`  Relationships: ${status.state.relationshipVersion}`);

  console.log(`\n${colorize('Health:', 'bright')}`);
  const healthColor = status.health === 'healthy' ? 'green' :
                     status.health === 'degraded' ? 'yellow' : 'red';
  console.log(`  ${colorize(status.health.toUpperCase(), healthColor)}`);

  if (status.issues.length > 0) {
    console.log(`\n${colorize('Issues:', 'yellow')}`);
    status.issues.forEach((issue: string) => printWarning(issue));
  } else {
    printSuccess('No issues detected');
  }
}

async function commandHealth(brain: any) {
  printHeader('Health Check');

  const health = await brain.healthCheck();

  const statusColor = health.status === 'healthy' ? 'green' :
                     health.status === 'degraded' ? 'yellow' : 'red';

  console.log(`Status: ${colorize(health.status.toUpperCase(), statusColor)}`);

  if (health.issues.length > 0) {
    console.log(`\n${colorize('Issues Found:', 'yellow')}`);
    health.issues.forEach((issue: string) => printWarning(issue));
  } else {
    printSuccess('All checks passed');
  }

  if (health.recommendations.length > 0) {
    console.log(`\n${colorize('Recommendations:', 'cyan')}`);
    health.recommendations.forEach((rec: string) => printInfo(rec));
  }
}

async function commandValidate(brain: any) {
  printHeader('Validation');

  const result = await brain.validate();

  if (result.passed) {
    printSuccess('All validations passed!');
    console.log(colorize('  ✓ All registries valid', 'green'));
    console.log(colorize('  ✓ All relationships correct', 'green'));
    console.log(colorize('  ✓ Ready to commit', 'green'));
  } else {
    printError(`Validation failed with ${result.errors.length} errors:`);
    result.errors.forEach((error: string) => printError(error));
    process.exit(1);
  }
}

async function commandList(brain: any, type: string) {
  if (type === 'skills') {
    printHeader('All Skills');
    const skills = await brain.listSkills();
    skills.forEach((skill: any) => {
      console.log(`${colorize(skill.name, 'cyan')}`);
      console.log(`  ${colorize(skill.description, 'dim')}`);
      console.log(`  Category: ${skill.category} | Difficulty: ${skill.difficulty}`);
      console.log();
    });
    console.log(colorize(`Total: ${skills.length} skills`, 'bright'));
  } else if (type === 'mcps') {
    printHeader('All MCPs');
    const mcps = await brain.listMCPs();
    mcps.forEach((mcp: any) => {
      console.log(`${colorize(mcp.name, 'magenta')}`);
      console.log(`  ${colorize(mcp.description, 'dim')}`);
      console.log(`  Category: ${mcp.category} | Status: ${mcp.status}`);
      console.log();
    });
    console.log(colorize(`Total: ${mcps.length} MCPs`, 'bright'));
  } else {
    printError(`Unknown list type: ${type}. Use 'skills' or 'mcps'`);
    process.exit(1);
  }
}

async function commandSearch(brain: any, query: string) {
  if (!query) {
    printError('Please provide a search query');
    process.exit(1);
  }

  printHeader(`Search Results: "${query}"`);

  const results = await brain.search(query);

  if (results.skills.length > 0) {
    console.log(colorize('Skills:', 'bright'));
    results.skills.forEach((skill: any) => {
      console.log(`  ${colorize(skill.name, 'cyan')} - ${skill.description}`);
    });
  }

  if (results.mcps.length > 0) {
    console.log(`\n${colorize('MCPs:', 'bright')}`);
    results.mcps.forEach((mcp: any) => {
      console.log(`  ${colorize(mcp.name, 'magenta')} - ${mcp.description}`);
    });
  }

  const totalResults = results.skills.length + results.mcps.length;
  if (totalResults === 0) {
    printWarning('No results found');
  } else {
    console.log(colorize(`\nTotal: ${totalResults} results`, 'bright'));
  }
}

async function commandShow(brain: any, type: string, name: string) {
  if (type === 'skill') {
    printHeader(`Skill: ${name}`);
    const skill = await brain.getSkill(name);
    if (!skill) {
      printError(`Skill '${name}' not found`);
      process.exit(1);
    }
    console.log(colorize('Description:', 'bright'));
    console.log(`  ${skill.description}\n`);
    console.log(colorize('Details:', 'bright'));
    console.log(`  Category: ${skill.category}`);
    console.log(`  Difficulty: ${skill.difficulty}`);
    console.log(`  Estimated Time: ${skill.estimated_time}`);
    console.log(`  Status: ${skill.status}`);
    console.log(`  Path: ${skill.path}`);
    console.log(`\n${colorize('Triggers:', 'bright')}`);
    skill.triggers.forEach((t: string) => console.log(`  - ${t}`));
    if (skill.related_skills.length > 0) {
      console.log(`\n${colorize('Related Skills:', 'bright')}`);
      skill.related_skills.forEach((s: string) => console.log(`  - ${s}`));
    }
  } else {
    printError(`Unknown type: ${type}. Use 'skill'`);
    process.exit(1);
  }
}

async function commandRelationships(brain: any, skillName: string) {
  if (!skillName) {
    printError('Please provide a skill name');
    process.exit(1);
  }

  printHeader(`Relationships: ${skillName}`);

  const rels = await brain.getRelationships(skillName);

  console.log(colorize('Skill:', 'bright'));
  console.log(`  ${rels.skill.name} - ${rels.skill.description}\n`);

  if (rels.relatedSkills.length > 0) {
    console.log(colorize('Related Skills:', 'bright'));
    rels.relatedSkills.forEach((s: string) => console.log(`  - ${s}`));
  }

  console.log(`\n${colorize('Dependencies:', 'bright')}`);

  if (rels.dependencies.mcps.length > 0) {
    console.log(colorize('  MCPs:', 'magenta'));
    rels.dependencies.mcps.forEach((m: string) => console.log(`    - ${m}`));
  }

  if (rels.dependencies.tools.length > 0) {
    console.log(colorize('  Tools:', 'yellow'));
    rels.dependencies.tools.forEach((t: string) => console.log(`    - ${t}`));
  }

  if (rels.dependencies.components.length > 0) {
    console.log(colorize('  Components:', 'blue'));
    rels.dependencies.components.forEach((c: string) => console.log(`    - ${c}`));
  }

  if (rels.dependencies.integrations.length > 0) {
    console.log(colorize('  Integrations:', 'green'));
    rels.dependencies.integrations.forEach((i: string) => console.log(`    - ${i}`));
  }
}

async function commandReverseDeps(brain: any, type: string, name: string) {
  if (type !== 'mcp') {
    printError(`Unknown type: ${type}. Use 'mcp'`);
    process.exit(1);
  }

  if (!name) {
    printError('Please provide an MCP name');
    process.exit(1);
  }

  printHeader(`Reverse Dependencies: ${name}`);

  const deps = await brain.getReverseDependencies(name);

  console.log(colorize('MCP:', 'bright'));
  console.log(`  ${deps.mcp.name} - ${deps.mcp.description}\n`);

  if (deps.usedBySkills.length > 0) {
    console.log(colorize('Used by Skills:', 'bright'));
    deps.usedBySkills.forEach((s: string) => console.log(`  - ${s}`));
  } else {
    printWarning('Not used by any skills');
  }
}

async function commandSelectSkills(brain: any, task: string) {
  if (!task) {
    printError('Please provide a task description');
    process.exit(1);
  }

  printHeader(`Skill Selection: "${task}"`);

  const selection = await brain.selectSkills(task);

  console.log(colorize('Recommended Skills:', 'bright'));
  if (selection.recommended.length > 0) {
    selection.recommended.forEach((s: string) => printSuccess(s));
  } else {
    printWarning('No strong recommendations');
  }

  console.log(`\n${colorize('Reasoning:', 'dim')}`);
  console.log(`  ${selection.reasoning}`);

  if (selection.alternatives.length > 0) {
    console.log(`\n${colorize('Alternatives:', 'yellow')}`);
    selection.alternatives.forEach((s: string) => console.log(`  - ${s}`));
  }
}

async function commandSelectMCPs(brain: any, skillNames: string[]) {
  if (skillNames.length === 0) {
    printError('Please provide at least one skill name');
    process.exit(1);
  }

  printHeader(`MCP Selection for: ${skillNames.join(', ')}`);

  const selection = await brain.getRequiredMCPs(skillNames);

  console.log(colorize('Required MCPs:', 'bright'));
  if (selection.mcps.length > 0) {
    selection.mcps.forEach((m: string) => console.log(`  ${colorize('→', 'magenta')} ${m}`));
  } else {
    printInfo('No MCPs required');
  }

  console.log(`\n${colorize('Breakdown:', 'dim')}`);
  Object.entries(selection.breakdown).forEach(([skill, mcps]: [string, any]) => {
    console.log(`  ${skill}:`);
    if (mcps.length > 0) {
      mcps.forEach((m: string) => console.log(`    - ${m}`));
    } else {
      console.log(`    (none)`);
    }
  });
}

async function commandDecide(brain: any, scenario: string) {
  if (!scenario) {
    printError('Please provide a scenario description');
    process.exit(1);
  }

  printHeader(`Workflow Decision: "${scenario}"`);

  const decision = await brain.decideWorkflow(scenario);

  console.log(colorize('Recommended Workflow:', 'bright'));
  decision.workflow.forEach((step: string, i: number) => {
    console.log(`  ${i + 1}. ${step}`);
  });

  console.log(`\n${colorize('Recommended Skills:', 'bright')}`);
  decision.skills.forEach((s: string) => console.log(`  - ${colorize(s, 'cyan')}`));

  console.log(`\n${colorize('Required MCPs:', 'bright')}`);
  if (decision.mcps.length > 0) {
    decision.mcps.forEach((m: string) => console.log(`  - ${colorize(m, 'magenta')}`));
  } else {
    console.log(`  (none)`);
  }

  console.log(`\n${colorize('Estimated Time:', 'yellow')} ${decision.estimatedTime}`);

  console.log(`\n${colorize('Reasoning:', 'dim')}`);
  console.log(`  ${decision.reasoning}`);
}

async function commandPatterns(brain: any, problem: string) {
  if (!problem) {
    printError('Please provide a problem description');
    process.exit(1);
  }

  printHeader(`Architecture Patterns: "${problem}"`);

  const matches = await brain.matchPatterns(problem);

  if (matches.length === 0) {
    printWarning('No matching patterns found');
    return;
  }

  console.log(colorize('Top Matches:', 'bright'));
  matches.slice(0, 3).forEach((match: any, i: number) => {
    console.log(`\n${colorize(`${i + 1}. ${match.pattern.name}`, 'cyan')} (confidence: ${match.confidence}%)`);
    console.log(`   ${colorize(match.pattern.description, 'dim')}`);
    console.log(`   ${colorize('Complexity:', 'yellow')} ${match.pattern.complexity} | ${colorize('Time:', 'yellow')} ${match.pattern.estimated_time}`);

    if (match.matchReasons.length > 0) {
      console.log(`   ${colorize('Reasons:', 'dim')} ${match.matchReasons.slice(0, 2).join(', ')}`);
    }

    // Show pros/cons
    console.log(`   ${colorize('Pros:', 'green')} ${match.pattern.tradeoffs.pros.slice(0, 2).join(', ')}`);
    console.log(`   ${colorize('Cons:', 'red')} ${match.pattern.tradeoffs.cons.slice(0, 2).join(', ')}`);

    // Show required skills
    if (match.pattern.skills.length > 0) {
      console.log(`   ${colorize('Skills:', 'cyan')} ${match.pattern.skills.slice(0, 3).join(', ')}`);
    }
  });

  console.log(`\n${colorize(`Total patterns analyzed: ${matches.length}`, 'bright')}`);
}

async function commandWorkflow(brain: any, scenario: string) {
  if (!scenario) {
    printError('Please provide a scenario description');
    process.exit(1);
  }

  printHeader(`Detailed Workflow: "${scenario}"`);

  const workflow = await brain.decideWorkflowAdvanced(scenario);

  console.log(colorize('Workflow Type:', 'bright'));
  console.log(`  ${colorize(workflow.workflowType, 'yellow')}\n`);

  console.log(colorize('Steps:', 'bright'));
  workflow.steps.forEach((step: any) => {
    const optional = step.optional ? colorize('[optional]', 'dim') : '';
    console.log(`  ${colorize(step.order.toString(), 'cyan')}. ${step.action} ${optional}`);
    console.log(`     ${colorize(step.description, 'dim')}`);
    console.log(`     ${colorize('Time:', 'yellow')} ${step.estimatedTime} | ${colorize('Skills:', 'cyan')} ${step.requiredSkills.join(', ')}`);
    console.log();
  });

  console.log(colorize('Required Resources:', 'bright'));

  if (workflow.skills && workflow.skills.length > 0) {
    console.log(`  ${colorize('Skills:', 'cyan')} ${workflow.skills.join(', ')}`);
  }

  if (workflow.mcps && workflow.mcps.length > 0) {
    console.log(`  ${colorize('MCPs:', 'magenta')} ${workflow.mcps.join(', ')}`);
  }

  if (workflow.tools && workflow.tools.length > 0) {
    console.log(`  ${colorize('Tools:', 'yellow')} ${workflow.tools.join(', ')}`);
  }

  if (workflow.integrations && workflow.integrations.length > 0) {
    console.log(`  ${colorize('Integrations:', 'green')} ${workflow.integrations.join(', ')}`);
  }

  console.log(`\n${colorize('Estimated Time:', 'yellow')} ${workflow.estimatedTime}`);

  if (workflow.alternatives && workflow.alternatives.length > 0) {
    console.log(`\n${colorize('Alternative Approaches:', 'bright')}`);
    workflow.alternatives.forEach((alt: string) => console.log(`  - ${alt}`));
  }

  if (workflow.warnings && workflow.warnings.length > 0) {
    console.log(`\n${colorize('Warnings:', 'yellow')}`);
    workflow.warnings.forEach((warning: string) => printWarning(warning));
  }
}

async function commandAnalyze(brain: any, task: string) {
  if (!task) {
    printError('Please provide a task description');
    process.exit(1);
  }

  printHeader(`Comprehensive Analysis: "${task}"`);

  const analysis = await brain.analyze(task);

  // Skills Section
  console.log(colorize('═══ Skills ═══', 'bright'));
  console.log(colorize('Primary:', 'green'));
  if (analysis.skills.primary.length > 0) {
    analysis.skills.primary.forEach((s: string) => console.log(`  ✓ ${s}`));
  } else {
    console.log(`  (none)`);
  }

  if (analysis.skills.secondary.length > 0) {
    console.log(colorize('\nSecondary:', 'yellow'));
    analysis.skills.secondary.forEach((s: string) => console.log(`  - ${s}`));
  }

  if (analysis.skills.optional.length > 0) {
    console.log(colorize('\nOptional:', 'dim'));
    analysis.skills.optional.forEach((s: string) => console.log(`  - ${s}`));
  }

  console.log(`\n${colorize('Confidence:', 'cyan')} ${analysis.skills.confidence}%`);
  console.log(colorize('Reasoning:', 'dim'), analysis.skills.reasoning);

  // Workflow Section
  console.log(`\n${colorize('═══ Workflow ═══', 'bright')}`);
  console.log(`${colorize('Type:', 'cyan')} ${analysis.workflow.type}`);
  console.log(`${colorize('Steps:', 'cyan')} ${analysis.workflow.steps.length}`);
  console.log(`${colorize('Estimated Time:', 'yellow')} ${analysis.workflow.estimatedTime}`);

  // MCPs Section
  console.log(`\n${colorize('═══ MCPs ═══', 'bright')}`);
  if (analysis.mcps.required.length > 0) {
    console.log(colorize('Required:', 'green'));
    analysis.mcps.required.forEach((m: string) => console.log(`  ✓ ${m}`));
  }

  if (analysis.mcps.recommended.length > 0) {
    console.log(colorize('\nRecommended:', 'yellow'));
    analysis.mcps.recommended.forEach((m: string) => console.log(`  - ${m}`));
  }

  if (analysis.mcps.warnings.length > 0) {
    console.log(colorize('\nWarnings:', 'red'));
    analysis.mcps.warnings.forEach((w: string) => printWarning(w));
  }

  // Patterns Section
  if (analysis.patterns && analysis.patterns.length > 0) {
    console.log(`\n${colorize('═══ Architecture Patterns ═══', 'bright')}`);
    analysis.patterns.slice(0, 3).forEach((match: any, i: number) => {
      console.log(`${i + 1}. ${colorize(match.pattern.name, 'cyan')} (${match.confidence}% match)`);
      console.log(`   ${colorize(match.pattern.description, 'dim')}`);
    });
  }

  // Complexity Section
  console.log(`\n${colorize('═══ Summary ═══', 'bright')}`);
  console.log(`${colorize('Complexity:', 'cyan')} ${analysis.complexity.complexity}`);
  console.log(`${colorize('Recommended Skills:', 'cyan')} ${analysis.complexity.recommendedSkillCount}`);
  console.log(`${colorize('Total Estimated Time:', 'yellow')} ${analysis.summary.totalEstimatedTime}`);
  console.log(`${colorize('Overall Confidence:', 'green')} ${analysis.summary.confidence}%`);
}

function printUsage() {
  console.log(`
${colorize('Repository Brain CLI', 'bright')}

${colorize('Usage:', 'bright')}
  brain <command> [options]

${colorize('Commands:', 'bright')}

${colorize('Status & Health:', 'cyan')}
  status                      Show repository state
  health                      Run health check
  validate                    Validate registries

${colorize('Query Knowledge:', 'cyan')}
  list skills                 List all skills
  list mcps                   List all MCPs
  search <query>              Search across resources
  show skill <name>           Show skill details

${colorize('Relationships:', 'cyan')}
  relationships <skill>       Show skill relationships
  reverse-deps mcp <name>     Show what uses this MCP

${colorize('Decision Making:', 'cyan')}
  select-skills <task>        Get skill recommendations
  select-mcps <skills...>     Get required MCPs
  decide <scenario>           Get workflow recommendation

${colorize('Phase 2 - Advanced Intelligence:', 'magenta')}
  patterns <problem>          Match architecture patterns
  workflow <scenario>         Get detailed workflow with steps
  analyze <task>              Comprehensive analysis (all engines)

${colorize('Examples:', 'bright')}
  brain status
  brain search "authentication"
  brain show skill mvp-builder
  brain select-skills "build MVP"
  brain decide "add new feature"
  brain patterns "need knowledge base with search"
  brain workflow "implement RAG system"
  brain analyze "build AI chatbot with custom knowledge"
`);
}

// Run the CLI
main().catch(error => {
  printError(`Fatal error: ${error.message}`);
  process.exit(1);
});
