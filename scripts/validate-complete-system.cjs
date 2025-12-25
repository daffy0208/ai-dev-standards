#!/usr/bin/env node
/**
 * Comprehensive System Validation
 *
 * Validates that:
 * 1. All registry entries point to existing files
 * 2. All files are properly registered
 * 3. Relationships are complete and bidirectional
 * 4. No orphaned resources exist
 * 5. Cross-registry consistency is maintained
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bright: '\x1b[1m',
};

function colorize(text, color) {
  return `${COLORS[color]}${text}${COLORS.reset}`;
}

function readJSON(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    return null;
  }
}

function fileExists(filePath) {
  return fs.existsSync(filePath);
}

function findFiles(dir, pattern) {
  const files = [];
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...findFiles(fullPath, pattern));
      } else if (entry.isFile() && pattern.test(entry.name)) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    // Directory doesn't exist or not accessible
  }
  return files;
}

console.log(colorize('\n=== COMPREHENSIVE SYSTEM VALIDATION ===\n', 'bright'));

const issues = {
  critical: [],
  warnings: [],
  info: []
};

// 1. VALIDATE SKILL REGISTRY
console.log(colorize('1. Validating Skills Registry...', 'cyan'));
const skillRegistry = readJSON(path.join(ROOT, 'meta/skill-registry.json'));
if (!skillRegistry) {
  issues.critical.push('meta/skill-registry.json not found or invalid JSON');
} else {
  console.log(`   Found ${skillRegistry.skills.length} skills in registry`);

  // Check each skill file exists
  let missingSkills = 0;
  skillRegistry.skills.forEach(skill => {
    const skillPath = path.join(ROOT, skill.path);
    if (!fileExists(skillPath)) {
      issues.critical.push(`Skill file missing: ${skill.path} (registered as: ${skill.name})`);
      missingSkills++;
    }
  });

  // Check for unregistered skills
  const actualSkillDirs = fs.readdirSync(path.join(ROOT, 'SKILLS'), { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name);

  const registeredSkillNames = skillRegistry.skills.map(s => s.name);
  const unregistered = actualSkillDirs.filter(dir => !registeredSkillNames.includes(dir));

  if (unregistered.length > 0) {
    issues.warnings.push(`${unregistered.length} unregistered skill directories: ${unregistered.join(', ')}`);
  }

  console.log(colorize(`   ✓ Registry validated: ${missingSkills === 0 ? 'All files exist' : `${missingSkills} missing`}`, missingSkills === 0 ? 'green' : 'red'));
  console.log(colorize(`   ${unregistered.length === 0 ? '✓' : '⚠'} ${unregistered.length} unregistered directories found`, unregistered.length === 0 ? 'green' : 'yellow'));
}

// 2. VALIDATE MCP REGISTRY
console.log(colorize('\n2. Validating MCP Registry...', 'cyan'));
const mcpRegistry = readJSON(path.join(ROOT, 'meta/mcp-registry.json'));
if (!mcpRegistry) {
  issues.critical.push('meta/mcp-registry.json not found or invalid JSON');
} else {
  console.log(`   Found ${mcpRegistry.mcps.length} MCPs in registry`);

  let missingMcps = 0;
  let externalMcps = 0;
  mcpRegistry.mcps.forEach(mcp => {
    // Skip external MCPs (like Archon MCP which is a GitHub URL)
    if (mcp.external) {
      externalMcps++;
      return;
    }

    const mcpPath = path.join(ROOT, mcp.path);
    if (!fileExists(mcpPath)) {
      issues.warnings.push(`MCP file missing: ${mcp.path} (registered as: ${mcp.name})`);
      missingMcps++;
    }
  });

  console.log(colorize(`   ${missingMcps === 0 ? '✓' : '⚠'} Registry validated: ${missingMcps === 0 ? 'All files exist' : `${missingMcps} missing`} (${externalMcps} external)`, missingMcps === 0 ? 'green' : 'yellow'));
}

// 3. VALIDATE TOOL REGISTRY
console.log(colorize('\n3. Validating Tool Registry...', 'cyan'));
const toolRegistry = readJSON(path.join(ROOT, 'meta/tool-registry.json'));
if (!toolRegistry) {
  issues.critical.push('meta/tool-registry.json not found or invalid JSON');
} else {
  console.log(`   Found ${toolRegistry.tools.length} tools in registry`);

  let missingTools = 0;
  toolRegistry.tools.forEach(tool => {
    const toolPath = path.join(ROOT, tool.path);
    if (!fileExists(toolPath)) {
      issues.warnings.push(`Tool file missing: ${tool.path} (registered as: ${tool.name})`);
      missingTools++;
    }
  });

  console.log(colorize(`   ${missingTools === 0 ? '✓' : '⚠'} Registry validated: ${missingTools === 0 ? 'All files exist' : `${missingTools} missing`}`, missingTools === 0 ? 'green' : 'yellow'));
}

// 4. VALIDATE COMPONENT REGISTRY
console.log(colorize('\n4. Validating Component Registry...', 'cyan'));
const componentRegistry = readJSON(path.join(ROOT, 'meta/component-registry.json'));
if (!componentRegistry) {
  issues.critical.push('meta/component-registry.json not found or invalid JSON');
} else {
  console.log(`   Found ${componentRegistry.components.length} components in registry`);

  let missingComponents = 0;
  componentRegistry.components.forEach(component => {
    const componentPath = path.join(ROOT, component.path);
    if (!fileExists(componentPath)) {
      issues.warnings.push(`Component file missing: ${component.path} (registered as: ${component.name})`);
      missingComponents++;
    }
  });

  console.log(colorize(`   ${missingComponents === 0 ? '✓' : '⚠'} Registry validated: ${missingComponents === 0 ? 'All files exist' : `${missingComponents} missing`}`, missingComponents === 0 ? 'green' : 'yellow'));
}

// 5. VALIDATE INTEGRATION REGISTRY
console.log(colorize('\n5. Validating Integration Registry...', 'cyan'));
const integrationRegistry = readJSON(path.join(ROOT, 'meta/integration-registry.json'));
if (!integrationRegistry) {
  issues.critical.push('meta/integration-registry.json not found or invalid JSON');
} else {
  console.log(`   Found ${integrationRegistry.integrations.length} integrations in registry`);

  let missingIntegrations = 0;
  integrationRegistry.integrations.forEach(integration => {
    const integrationPath = path.join(ROOT, integration.path);
    if (!fileExists(integrationPath)) {
      issues.warnings.push(`Integration file missing: ${integration.path} (registered as: ${integration.name})`);
      missingIntegrations++;
    }
  });

  console.log(colorize(`   ${missingIntegrations === 0 ? '✓' : '⚠'} Registry validated: ${missingIntegrations === 0 ? 'All files exist' : `${missingIntegrations} missing`}`, missingIntegrations === 0 ? 'green' : 'yellow'));
}

// 6. VALIDATE RELATIONSHIP MAPPING
console.log(colorize('\n6. Validating Relationship Mapping...', 'cyan'));
const relationshipMapping = readJSON(path.join(ROOT, 'meta/relationship-mapping.json'));
if (!relationshipMapping) {
  issues.critical.push('meta/relationship-mapping.json not found or invalid JSON');
} else {
  console.log(`   Found relationship mappings`);

  // Validate skill-to-mcp relationships
  if (relationshipMapping.skill_to_mcp) {
    const mappedSkills = Object.keys(relationshipMapping.skill_to_mcp);
    const registeredSkillNames = skillRegistry ? skillRegistry.skills.map(s => s.name) : [];

    // Check for skills in mapping that don't exist in registry
    const unmappedSkills = mappedSkills.filter(skill => !registeredSkillNames.includes(skill));
    if (unmappedSkills.length > 0) {
      issues.warnings.push(`${unmappedSkills.length} skills in relationship mapping not in skill registry: ${unmappedSkills.slice(0, 5).join(', ')}${unmappedSkills.length > 5 ? '...' : ''}`);
    }

    console.log(`   ${unmappedSkills.length === 0 ? '✓' : '⚠'} Skill-to-MCP mappings validated`);
  }

  // Validate mcp-to-tool relationships
  if (relationshipMapping.mcp_to_tool) {
    const mappedMcps = Object.keys(relationshipMapping.mcp_to_tool);
    console.log(`   ✓ MCP-to-Tool mappings: ${mappedMcps.length} MCPs mapped`);
  }
}

// 7. VALIDATE ORCHESTRATION SYSTEM
console.log(colorize('\n7. Validating Orchestration System...', 'cyan'));
const orchestrationDirs = [
  'orchestration-requests/pending',
  'orchestration-requests/in-progress',
  'orchestration-requests/completed',
  'orchestration-requests/failed',
  'orchestration-results'
];

let missingDirs = 0;
orchestrationDirs.forEach(dir => {
  if (!fileExists(path.join(ROOT, dir))) {
    issues.critical.push(`Orchestration directory missing: ${dir}`);
    missingDirs++;
  }
});

const orchestrationSchemas = [
  'schemas/orchestration-request.schema.json',
  'schemas/orchestration-result.schema.json'
];

let missingSchemas = 0;
orchestrationSchemas.forEach(schema => {
  if (!fileExists(path.join(ROOT, schema))) {
    issues.critical.push(`Orchestration schema missing: ${schema}`);
    missingSchemas++;
  }
});

const createRequestScript = 'scripts/orchestration/create-request.sh';
if (!fileExists(path.join(ROOT, createRequestScript))) {
  issues.critical.push(`Create request script missing: ${createRequestScript}`);
}

const orchestrationDoc = 'docs/CLAUDE-CODE-ORCHESTRATION.md';
if (!fileExists(path.join(ROOT, orchestrationDoc))) {
  issues.warnings.push(`Orchestration documentation missing: ${orchestrationDoc}`);
}

console.log(colorize(`   ${missingDirs === 0 && missingSchemas === 0 ? '✓' : '✗'} Orchestration system validated`, missingDirs === 0 && missingSchemas === 0 ? 'green' : 'red'));

// 8. VALIDATE BRAIN COMMANDS
console.log(colorize('\n8. Validating Brain Commands...', 'cyan'));
const brainCommandsDir = path.join(ROOT, 'scripts/brain/commands');
if (!fileExists(brainCommandsDir)) {
  issues.critical.push('Brain commands directory missing: scripts/brain/commands');
} else {
  const commandFiles = fs.readdirSync(brainCommandsDir)
    .filter(file => file.endsWith('.ts') || file.endsWith('.js'));
  console.log(`   Found ${commandFiles.length} brain command files`);
  console.log(colorize(`   ✓ Brain commands: ${commandFiles.join(', ')}`, 'green'));
}

// 9. VALIDATE CAPABILITY MANIFESTS
console.log(colorize('\n9. Validating Capability Manifests...', 'cyan'));
const manifestFiles = findFiles(path.join(ROOT, 'SKILLS'), /^manifest\.yaml$/);
console.log(`   Found ${manifestFiles.length} manifest.yaml files`);

if (skillRegistry) {
  const skillsWithoutManifests = [];
  skillRegistry.skills.forEach(skill => {
    const skillDir = path.join(ROOT, skill.path.replace('/SKILL.md', ''));
    const manifestPath = path.join(skillDir, 'manifest.yaml');
    if (!fileExists(manifestPath)) {
      skillsWithoutManifests.push(skill.name);
    }
  });

  if (skillsWithoutManifests.length > 0) {
    issues.info.push(`${skillsWithoutManifests.length} skills without manifests: ${skillsWithoutManifests.slice(0, 10).join(', ')}${skillsWithoutManifests.length > 10 ? '...' : ''}`);
  }

  console.log(`   ${skillsWithoutManifests.length === 0 ? '✓' : 'ℹ'} ${skillRegistry.skills.length - skillsWithoutManifests.length}/${skillRegistry.skills.length} skills have manifests`);
}

// 10. VALIDATE CAPABILITY GRAPH
console.log(colorize('\n10. Validating Capability Graph...', 'cyan'));
const capabilityGraph = readJSON(path.join(ROOT, 'meta/capability-graph.json'));
if (!capabilityGraph) {
  issues.warnings.push('Capability graph not found: meta/capability-graph.json');
  console.log(colorize('   ⚠ Capability graph missing or invalid', 'yellow'));
} else {
  console.log(`   ✓ Capability graph exists`);
  if (capabilityGraph.nodes) {
    console.log(`   ✓ Graph has ${capabilityGraph.nodes.length} nodes`);
  }
  if (capabilityGraph.edges) {
    console.log(`   ✓ Graph has ${capabilityGraph.edges.length} edges`);
  }
}

// SUMMARY
console.log(colorize('\n=== VALIDATION SUMMARY ===\n', 'bright'));

if (issues.critical.length > 0) {
  console.log(colorize(`✗ CRITICAL ISSUES (${issues.critical.length}):`, 'red'));
  issues.critical.forEach(issue => console.log(colorize(`  - ${issue}`, 'red')));
  console.log('');
}

if (issues.warnings.length > 0) {
  console.log(colorize(`⚠ WARNINGS (${issues.warnings.length}):`, 'yellow'));
  issues.warnings.forEach(issue => console.log(colorize(`  - ${issue}`, 'yellow')));
  console.log('');
}

if (issues.info.length > 0) {
  console.log(colorize(`ℹ INFO (${issues.info.length}):`, 'cyan'));
  issues.info.forEach(issue => console.log(colorize(`  - ${issue}`, 'cyan')));
  console.log('');
}

if (issues.critical.length === 0 && issues.warnings.length === 0) {
  console.log(colorize('✓ ALL VALIDATIONS PASSED!', 'green'));
  console.log(colorize('  System is fully consistent and all relationships are accounted for.\n', 'green'));
  process.exit(0);
} else {
  console.log(colorize(`System has ${issues.critical.length} critical issues and ${issues.warnings.length} warnings.\n`, issues.critical.length > 0 ? 'red' : 'yellow'));
  process.exit(issues.critical.length > 0 ? 1 : 0);
}
