#!/usr/bin/env node

/**
 * Complete Validation Script
 * Validates ALL consistency across the entire framework
 * FAILS LOUDLY with clear error messages
 * Single source of truth: SKILLS/ and MCP-SERVERS/ folders
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const SKILLS_DIR = path.join(ROOT, 'SKILLS');
const MCP_DIR = path.join(ROOT, 'MCP-SERVERS');
const PLAYBOOKS_DIR = path.join(ROOT, 'PLAYBOOKS');
const STANDARDS_DIR = path.join(ROOT, 'STANDARDS');
const TEMPLATES_DIR = path.join(ROOT, 'TEMPLATES');
const SCHEMAS_DIR = path.join(ROOT, 'SCHEMAS');
const UTILS_DIR = path.join(ROOT, 'UTILS');
const EXAMPLES_DIR = path.join(ROOT, 'EXAMPLES');
const INSTALLERS_DIR = path.join(ROOT, 'INSTALLERS');
const DOCS_DIR = path.join(ROOT, 'DOCS');

// Color codes for output
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';

let errors = [];
let warnings = [];
let checks = 0;

function error(message) {
  errors.push(message);
  console.error(`${RED}❌ ${message}${RESET}`);
}

function warn(message) {
  warnings.push(message);
  console.warn(`${YELLOW}⚠️  ${message}${RESET}`);
}

function success(message) {
  checks++;
  console.log(`${GREEN}✅ ${message}${RESET}`);
}

function section(title) {
  console.log(`\n${YELLOW}=== ${title} ===${RESET}\n`);
}

// Get actual skill and MCP counts from filesystem
function getActualCounts() {
  const skillFolders = fs.readdirSync(SKILLS_DIR)
    .filter(f => f !== '_TEMPLATE' && fs.statSync(path.join(SKILLS_DIR, f)).isDirectory());

  const mcpFolders = fs.readdirSync(MCP_DIR)
    .filter(f => fs.statSync(path.join(MCP_DIR, f)).isDirectory());

  // MCP names: strip -mcp suffix for comparison with registry
  const mcpNames = mcpFolders.map(f => f.replace(/-mcp$/, '')).sort();

  return {
    skills: skillFolders.length,
    skillNames: skillFolders.sort(),
    mcps: mcpFolders.length,
    mcpNames: mcpNames,
    mcpFolders: mcpFolders.sort()
  };
}

// Validate skill-registry.json
function validateSkillRegistry(actual) {
  section('Validating skill-registry.json');

  const registryPath = path.join(ROOT, 'META', 'skill-registry.json');
  const registry = JSON.parse(fs.readFileSync(registryPath, 'utf-8'));

  const registryCount = registry.skills.length;
  const registryNames = registry.skills.map(s => s.name).sort();

  if (registryCount !== actual.skills) {
    error(`skill-registry.json has ${registryCount} skills, but SKILLS/ has ${actual.skills}`);
  } else {
    success(`skill-registry.json count matches (${actual.skills})`);
  }

  // Check for missing skills
  const missing = actual.skillNames.filter(name => !registryNames.includes(name));
  const extra = registryNames.filter(name => !actual.skillNames.includes(name));

  if (missing.length > 0) {
    error(`Skills missing from skill-registry.json: ${missing.join(', ')}`);
  }
  if (extra.length > 0) {
    error(`Skills in skill-registry.json but not in SKILLS/: ${extra.join(', ')}`);
  }
  if (missing.length === 0 && extra.length === 0) {
    success('All skills present in skill-registry.json');
  }

  // Check all skills have triggers
  const noTriggers = registry.skills.filter(s => !s.triggers || s.triggers.length === 0);
  if (noTriggers.length > 0) {
    warn(`Skills without triggers: ${noTriggers.map(s => s.name).join(', ')}`);
  } else {
    success('All skills have triggers defined');
  }

  return registryNames;
}

// Validate registry.json
function validateMainRegistry(actual) {
  section('Validating registry.json');

  const registryPath = path.join(ROOT, 'META', 'registry.json');
  const registry = JSON.parse(fs.readFileSync(registryPath, 'utf-8'));

  const skillCount = registry.skills.length;
  const mcpCount = registry.mcpServers.length;
  const skillNames = registry.skills.map(s => s.name).sort();
  const mcpNames = registry.mcpServers.map(m => m.name).sort();

  if (skillCount !== actual.skills) {
    error(`registry.json has ${skillCount} skills, but SKILLS/ has ${actual.skills}`);
  } else {
    success(`registry.json skill count matches (${actual.skills})`);
  }

  if (mcpCount !== actual.mcps) {
    error(`registry.json has ${mcpCount} MCPs, but MCP-SERVERS/ has ${actual.mcps}`);
  } else {
    success(`registry.json MCP count matches (${actual.mcps})`);
  }

  // Check for missing/extra
  const missingSkills = actual.skillNames.filter(name => !skillNames.includes(name));
  const extraSkills = skillNames.filter(name => !actual.skillNames.includes(name));
  const missingMcps = actual.mcpNames.filter(name => !mcpNames.includes(name));
  const extraMcps = mcpNames.filter(name => !actual.mcpNames.includes(name));

  if (missingSkills.length > 0) error(`Skills missing from registry.json: ${missingSkills.join(', ')}`);
  if (extraSkills.length > 0) error(`Extra skills in registry.json: ${extraSkills.join(', ')}`);
  if (missingMcps.length > 0) error(`MCPs missing from registry.json: ${missingMcps.join(', ')}`);
  if (extraMcps.length > 0) error(`Extra MCPs in registry.json: ${extraMcps.join(', ')}`);

  if (missingSkills.length === 0 && extraSkills.length === 0) {
    success('All skills present in registry.json');
  }
  if (missingMcps.length === 0 && extraMcps.length === 0) {
    success('All MCPs present in registry.json');
  }

  return { skillNames, mcpNames };
}

// Validate Tier 2 registries
function validateTier2Registries() {
  section('Validating Tier 2 Registries');

  const tier2Registries = [
    { name: 'playbook-registry.json', dir: PLAYBOOKS_DIR, fileExt: '.md', expectedKey: 'playbooks' },
    { name: 'standard-registry.json', dir: STANDARDS_DIR, fileExt: '.md', expectedKey: 'standards', hasSubdirs: true },
    { name: 'template-registry.json', dir: TEMPLATES_DIR, fileExt: null, expectedKey: 'templates', hasSubdirs: true },
    { name: 'schema-registry.json', dir: SCHEMAS_DIR, fileExt: null, expectedKey: 'schemas' },
    { name: 'util-registry.json', dir: UTILS_DIR, fileExt: '.ts', expectedKey: 'utilities', hasSubdirs: true },
    { name: 'example-registry.json', dir: EXAMPLES_DIR, fileExt: null, expectedKey: 'examples', hasSubdirs: true },
    { name: 'installer-registry.json', dir: INSTALLERS_DIR, fileExt: null, expectedKey: 'installers', hasSubdirs: true },
    { name: 'docs-registry.json', dir: DOCS_DIR, fileExt: '.md', expectedKey: 'docs', hasSubdirs: true }
  ];

  let totalTier2 = 0;

  tier2Registries.forEach(({ name, dir, expectedKey }) => {
    if (!fs.existsSync(dir)) {
      warn(`${name}: Directory not found - ${dir}`);
      return;
    }

    const registryPath = path.join(ROOT, 'META', name);
    if (!fs.existsSync(registryPath)) {
      error(`${name}: Registry file not found`);
      return;
    }

    const registry = JSON.parse(fs.readFileSync(registryPath, 'utf-8'));
    const count = registry[expectedKey]?.length || 0;
    totalTier2 += count;

    if (count > 0) {
      success(`${name}: ${count} resources tracked`);
    } else {
      warn(`${name}: No resources found`);
    }
  });

  success(`Total Tier 2 resources: ${totalTier2}`);
  return totalTier2;
}

// Validate relationship-mapping.json
function validateRelationships(actual) {
  section('Validating relationship-mapping.json');

  const relationshipsPath = path.join(ROOT, 'META', 'relationship-mapping.json');
  const relationships = JSON.parse(fs.readFileSync(relationshipsPath, 'utf-8'));

  const skillMappings = relationships.relationships?.skills_to_mcps || relationships.skills || {};
  const getMappedMcps = (skill) => {
    const mapping = skillMappings[skill];
    if (!mapping) return [];
    if (Array.isArray(mapping)) return mapping;
    if (Array.isArray(mapping.required_mcps)) return mapping.required_mcps;
    return [];
  };

  const mappedSkills = Object.keys(skillMappings);
  const unmappedCount = actual.skills - mappedSkills.length;

  if (unmappedCount > 0) {
    const unmapped = actual.skillNames.filter(name => !mappedSkills.includes(name));
    warn(`${unmappedCount} skills without relationship mapping: ${unmapped.slice(0, 5).join(', ')}${unmapped.length > 5 ? '...' : ''}`);
  } else {
    success('All skills have relationship mapping');
  }

  const tier2TrackedSkills = actual.skillNames.filter((skillName) => {
    const skillData = relationships.skills?.[skillName];
    if (!skillData) return false;
    const tier2Keys = [
      'related_playbooks',
      'related_standards',
      'related_templates',
      'related_schemas',
      'related_utils',
      'related_examples',
      'related_installers',
      'related_docs'
    ];
    return tier2Keys.some((key) => Array.isArray(skillData[key]) && skillData[key].length > 0);
  });

  if (tier2TrackedSkills.length === 0) {
    console.log(`${YELLOW}ℹ️  Tier 2 relationship metadata not recorded; skipping detailed check${RESET}`);
  } else if (tier2TrackedSkills.length === actual.skills) {
    success(`All ${actual.skills} skills have Tier 2 relationships`);
  } else {
    warn(`${actual.skills - tier2TrackedSkills.length} skills missing Tier 2 relationships`);
  }

  success(`Relationship mapping: ${mappedSkills.length}/${actual.skills} skills mapped (${Math.round(mappedSkills.length / actual.skills * 100)}%)`);
}

// Validate documentation files
function validateDocumentation(actual) {
  section('Validating Documentation Files');

  const files = [
    { path: 'README.md', regex: /(\d+)\s+Specialized Skills/ },
    // BUILD_FOCUS.md moved to .archive/planning/ - no longer active
    { path: 'DOCS/INDEX.md', regex: /explore\s+(\d+)\s+specialized/ },
    { path: 'DOCS/MCP-DEVELOPMENT-ROADMAP.md', regex: /Current:\*\*\s*(\d+)\s+skills/ }
  ];

  files.forEach(({ path: filePath, regex }) => {
    const fullPath = path.join(ROOT, filePath);
    if (!fs.existsSync(fullPath)) {
      error(`File not found: ${filePath}`);
      return;
    }

    const content = fs.readFileSync(fullPath, 'utf-8');
    const match = content.match(regex);

    if (!match) {
      warn(`Could not find skill count in ${filePath}`);
      return;
    }

    const count = parseInt(match[1]);
    if (count !== actual.skills) {
      error(`${filePath} shows ${count} skills, but actual is ${actual.skills}`);
    } else {
      success(`${filePath} skill count correct (${actual.skills})`);
    }
  });

  // Check MCP counts
  const mcpFiles = [
    { path: 'README.md', regex: /(\d+)\s+MCP Tools/ },
    // BUILD_FOCUS.md moved to .archive/planning/ - no longer active
    { path: 'DOCS/INDEX.md', regex: /MCPs:\s*(\d+)/ }
  ];

  mcpFiles.forEach(({ path: filePath, regex }) => {
    const fullPath = path.join(ROOT, filePath);
    const content = fs.readFileSync(fullPath, 'utf-8');
    const match = content.match(regex);

    if (!match) {
      warn(`Could not find MCP count in ${filePath}`);
      return;
    }

    const count = parseInt(match[1]);
    if (count !== actual.mcps) {
      error(`${filePath} shows ${count} MCPs, but actual is ${actual.mcps}`);
    } else {
      success(`${filePath} MCP count correct (${actual.mcps})`);
    }
  });
}

// Validate .claude/claude.md
function validateClaudeConfig(skillNames) {
  section('Validating .claude/claude.md');

  const claudePath = path.join(ROOT, '.claude', 'claude.md');
  if (!fs.existsSync(claudePath)) {
    error('.claude/claude.md not found');
    return;
  }

  const content = fs.readFileSync(claudePath, 'utf-8');
  const skillSections = content.match(/^### (.+)$/gm) || [];
  const claudeSkills = skillSections.map(s => s.replace('### ', '').trim());

  if (claudeSkills.length < 5) {
    warn(`.claude/claude.md only has ${claudeSkills.length} skills documented (should have all ${skillNames.length})`);
  } else {
    success(`.claude/claude.md has ${claudeSkills.length} skills documented`);
  }
}

function validateCodexConfig(skillNames) {
  section('Validating .codex/codex.md');

  const codexPath = path.join(ROOT, '.codex', 'codex.md');
  if (!fs.existsSync(codexPath)) {
    error('.codex/codex.md not found');
    return;
  }

  const content = fs.readFileSync(codexPath, 'utf-8');
  const skillSections = content.match(/^### (.+)$/gm) || [];
  const codexSkills = skillSections.map(s => s.replace('### ', '').trim());

  if (codexSkills.length < 5) {
    warn(`.codex/codex.md only has ${codexSkills.length} skills documented (should have all ${skillNames.length})`);
  } else {
    success(`.codex/codex.md has ${codexSkills.length} skills documented`);
  }
}

// Validate root configuration files
function validateRootFiles(actual) {
  section('Validating Root Configuration Files');

  // Validate .cursorrules
  const cursorrules = path.join(ROOT, '.cursorrules');
  if (fs.existsSync(cursorrules)) {
    const content = fs.readFileSync(cursorrules, 'utf-8');

    // Check skill count
    const skillMatch = content.match(/SKILLS\/\*\*\s*-\s*(\d+)\s+specialized skills/);
    if (skillMatch && parseInt(skillMatch[1]) !== actual.skills) {
      error(`.cursorrules shows ${skillMatch[1]} skills, but actual is ${actual.skills}`);
    } else if (skillMatch) {
      success(`.cursorrules skill count correct (${actual.skills})`);
    }

    // Check MCP count
    const mcpMatch = content.match(/MCP-SERVERS\/\*\*\s*-\s*(\d+)\s+MCP server/);
    if (mcpMatch && parseInt(mcpMatch[1]) !== actual.mcps) {
      error(`.cursorrules shows ${mcpMatch[1]} MCPs, but actual is ${actual.mcps}`);
    } else if (mcpMatch) {
      success(`.cursorrules MCP count correct (${actual.mcps})`);
    }

    // Check ratio
    const ratioMatch = content.match(/Ratio:\*\*\s*([\d.]+):1/);
    const expectedRatio = (actual.skills / actual.mcps).toFixed(1);
    if (ratioMatch && ratioMatch[1] !== expectedRatio) {
      error(`.cursorrules shows ${ratioMatch[1]}:1 ratio, but actual is ${expectedRatio}:1`);
    } else if (ratioMatch) {
      success(`.cursorrules ratio correct (${expectedRatio}:1)`);
    }
  } else {
    warn('.cursorrules not found');
  }

  // Validate CHANGELOG.md
  const changelog = path.join(ROOT, 'CHANGELOG.md');
  if (fs.existsSync(changelog)) {
    const content = fs.readFileSync(changelog, 'utf-8');

    const skillMatch = content.match(/\*\*(\d+)\s+Specialized Skills\*\*/);
    if (skillMatch && parseInt(skillMatch[1]) !== actual.skills) {
      error(`CHANGELOG.md shows ${skillMatch[1]} skills, but actual is ${actual.skills}`);
    } else if (skillMatch) {
      success(`CHANGELOG.md skill count correct (${actual.skills})`);
    }

    const mcpMatch = content.match(/\*\*(\d+)\s+MCP Servers\*\*/);
    if (mcpMatch && parseInt(mcpMatch[1]) !== actual.mcps) {
      error(`CHANGELOG.md shows ${mcpMatch[1]} MCPs, but actual is ${actual.mcps}`);
    } else if (mcpMatch) {
      success(`CHANGELOG.md MCP count correct (${actual.mcps})`);
    }
  } else {
    warn('CHANGELOG.md not found');
  }
}

/**
 * Validate CLI Commands
 * Check that CLI commands have no TODOs and fetch from GitHub
 */
function validateCLICommands() {
  section('Validating CLI Commands');

  // Check 23: No TODOs in critical CLI paths
  const cliPaths = ['CLI/commands/', 'CLI/generators/', 'CLI/utils/'];
  let todoCount = 0;

  for (const cliPath of cliPaths) {
    try {
      const todos = execSync(`grep -r "TODO\\|FIXME" ${cliPath} --include="*.js" 2>/dev/null || true`, { encoding: 'utf8' });
      if (todos.trim().length > 0) {
        const lines = todos.trim().split('\n').filter(l => l.length > 0);
        todoCount += lines.length;
        error(`Found ${lines.length} TODOs in ${cliPath}:`);
        lines.forEach(line => console.log(`    ${RED}${line}${RESET}`));
      }
    } catch (e) {
      // Path might not exist, that's okay
    }
  }

  if (todoCount === 0) {
    success('No TODOs in critical CLI paths');
  }

  // Check 24: CLI utils exist and export GitHub functions
  if (fs.existsSync('CLI/utils/github-fetch.js')) {
    const utilContent = fs.readFileSync('CLI/utils/github-fetch.js', 'utf8');
    if (utilContent.includes('GITHUB_RAW_BASE') &&
        utilContent.includes('fetchSkills') &&
        utilContent.includes('fetchMCPs')) {
      success('CLI GitHub fetch utility correctly configured');
    } else {
      error('CLI GitHub fetch utility missing required functions');
    }
  } else {
    error('CLI/utils/github-fetch.js not found');
  }

  // Check 25: Critical CLI commands use GitHub fetch utility
  const criticalCommands = ['CLI/commands/sync.js', 'CLI/commands/update.js'];
  for (const cmdPath of criticalCommands) {
    if (fs.existsSync(cmdPath)) {
      const content = fs.readFileSync(cmdPath, 'utf8');
      if (content.includes('github-fetch')) {
        success(`${cmdPath} uses GitHub fetch utility`);
      } else {
        error(`${cmdPath} does not use GitHub fetch utility`);
      }
    } else {
      warn(`${cmdPath} not found`);
    }
  }
}

// Main validation
function main() {
  console.log(`\n${GREEN}🔍 AI Dev Standards - Complete Validation${RESET}\n`);
  console.log('Checking consistency across entire framework...\n');

  const actual = getActualCounts();
  console.log(`${YELLOW}📊 Actual Counts:${RESET}`);
  console.log(`   Skills: ${actual.skills}`);
  console.log(`   MCPs: ${actual.mcps}`);
  console.log(`   Ratio: ${(actual.skills / actual.mcps).toFixed(1)}:1\n`);

  // Run all validations
  const registrySkills = validateSkillRegistry(actual);
  const mainRegistry = validateMainRegistry(actual);
  const tier2Count = validateTier2Registries();
  validateRelationships(actual);
  validateDocumentation(actual);
  validateRootFiles(actual);
  validateClaudeConfig(actual.skillNames);
  validateCodexConfig(actual.skillNames);
  validateCLICommands();

  // Count all Tier 1 resources
  const componentRegistry = JSON.parse(fs.readFileSync(path.join(ROOT, 'META', 'component-registry.json'), 'utf-8'));
  const integrationRegistry = JSON.parse(fs.readFileSync(path.join(ROOT, 'META', 'integration-registry.json'), 'utf-8'));
  const toolRegistry = JSON.parse(fs.readFileSync(path.join(ROOT, 'META', 'tool-registry.json'), 'utf-8'));

  const componentCount = componentRegistry.components?.length || 0;
  const integrationCount = integrationRegistry.integrations?.length || 0;
  const toolCount = (toolRegistry.tools?.length || 0) + (toolRegistry.scripts?.length || 0);

  const tier1Count = actual.skills + actual.mcps + componentCount + integrationCount + toolCount;

  // Update stats with complete count
  console.log(`\n${YELLOW}📊 Complete Resource Count:${RESET}`);
  console.log(`   Tier 1: ${tier1Count} resources (${actual.skills} Skills, ${actual.mcps} MCPs, ${componentCount} Components, ${integrationCount} Integrations, ${toolCount} Tools)`);
  console.log(`   Tier 2: ${tier2Count} resources (14 Playbooks, 20 Standards, 19 Templates, 4 Schemas, 8 Utils, 3 Examples, 3 Installers, 24 Docs)`);
  console.log(`   TOTAL:  ${tier1Count + tier2Count} resources`);

  // Summary
  console.log(`\n${YELLOW}=== Validation Summary ===${RESET}\n`);
  console.log(`${GREEN}✅ Checks passed: ${checks}${RESET}`);
  if (warnings.length > 0) {
    console.log(`${YELLOW}⚠️  Warnings: ${warnings.length}${RESET}`);
  }
  if (errors.length > 0) {
    console.log(`${RED}❌ Errors: ${errors.length}${RESET}`);
  }

  // Exit with appropriate code
  if (errors.length > 0) {
    console.log(`\n${RED}❌ VALIDATION FAILED${RESET}`);
    console.log(`\nTo fix: npm run validate:fix\n`);
    process.exit(1);
  } else if (warnings.length > 0) {
    console.log(`\n${YELLOW}⚠️  VALIDATION PASSED WITH WARNINGS${RESET}`);
    console.log(`\nReview warnings above and fix when possible.\n`);
    process.exit(0);
  } else {
    console.log(`\n${GREEN}✅ ALL VALIDATIONS PASSED${RESET}\n`);
    process.exit(0);
  }
}

main();
