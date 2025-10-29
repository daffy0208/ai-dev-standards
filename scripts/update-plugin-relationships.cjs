#!/usr/bin/env node
/**
 * Update Relationship Mapping with Plugin Relationships
 *
 * Reads plugin-registry.json and updates relationship-mapping.json
 * to include plugin-to-skill relationships.
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

function writeJSON(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
}

console.log(colorize('\n=== UPDATING PLUGIN RELATIONSHIPS ===\n', 'bright'));

// Read registries
const pluginRegistry = readJSON(path.join(ROOT, 'META/plugin-registry.json'));
const relationshipMapping = readJSON(path.join(ROOT, 'META/relationship-mapping.json'));

if (!pluginRegistry) {
  console.log(colorize('✗ Could not read plugin-registry.json', 'red'));
  process.exit(1);
}

if (!relationshipMapping) {
  console.log(colorize('✗ Could not read relationship-mapping.json', 'red'));
  process.exit(1);
}

// Initialize plugin sections if they don't exist
if (!relationshipMapping.plugin_to_skill) {
  relationshipMapping.plugin_to_skill = {};
}

if (!relationshipMapping.plugin_to_mcp) {
  relationshipMapping.plugin_to_mcp = {};
}

console.log(colorize('1. Processing Plugin-to-Skill Relationships...', 'cyan'));

let updatedCount = 0;
pluginRegistry.plugins.forEach(plugin => {
  const pluginId = plugin.id;
  const enhancedSkills = plugin.enhances_skills || [];

  if (enhancedSkills.length > 0) {
    relationshipMapping.plugin_to_skill[pluginId] = enhancedSkills;
    console.log(`   ✓ ${pluginId} → ${enhancedSkills.join(', ')}`);
    updatedCount++;
  }
});

console.log(colorize(`\n   Updated ${updatedCount} plugin-to-skill relationships`, 'green'));

console.log(colorize('\n2. Mapping MCP Server Plugins...', 'cyan'));

let mcpCount = 0;
pluginRegistry.plugins.forEach(plugin => {
  if (plugin.mcp_server) {
    // MCP server plugins may provide additional capabilities
    relationshipMapping.plugin_to_mcp[plugin.id] = {
      type: 'mcp-server',
      description: plugin.description,
      enhances_skills: plugin.enhances_skills || []
    };
    console.log(`   ✓ ${plugin.id} (MCP Server)`);
    mcpCount++;
  }
});

console.log(colorize(`\n   Mapped ${mcpCount} MCP server plugins`, 'green'));

console.log(colorize('\n3. Adding Plugin Metadata...', 'cyan'));

if (!relationshipMapping._metadata) {
  relationshipMapping._metadata = {};
}

relationshipMapping._metadata.plugins = {
  total: pluginRegistry.metadata.total_plugins,
  mcp_servers: pluginRegistry.metadata.mcp_servers,
  ai_instructions: pluginRegistry.metadata.ai_instructions,
  agent_skills: pluginRegistry.metadata.agent_skills,
  last_updated: new Date().toISOString().split('T')[0]
};

console.log('   ✓ Added plugin metadata to relationship mapping');

console.log(colorize('\n4. Writing Updated Relationships...', 'cyan'));

const outputPath = path.join(ROOT, 'META/relationship-mapping.json');
writeJSON(outputPath, relationshipMapping);

console.log(colorize('   ✓ relationship-mapping.json updated', 'green'));

console.log(colorize('\n=== UPDATE COMPLETE ===\n', 'bright'));
console.log(colorize(`✓ ${updatedCount} plugin-to-skill relationships added`, 'green'));
console.log(colorize(`✓ ${mcpCount} MCP server plugins mapped`, 'green'));
console.log(colorize('✓ Plugin metadata updated\n', 'green'));

console.log(colorize('Next Steps:', 'cyan'));
console.log('  1. Run: node scripts/validate-complete-system.cjs');
console.log('  2. Run: node scripts/test-plugins.cjs');
console.log('  3. Commit changes to Git\n');

process.exit(0);
