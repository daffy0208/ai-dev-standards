#!/usr/bin/env node

/**
 * Sync Schema Registry
 *
 * Rebuilds schema-registry.json from schemas/ folder (single source of truth)
 * Extracts metadata from schema files
 * This is the ONLY way to update schema-registry.json
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SCHEMAS_DIR = path.join(ROOT, 'SCHEMAS');
const SCHEMA_REGISTRY_PATH = path.join(ROOT, 'META', 'schema-registry.json');

const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';

function extractMetadataFromSchema(fileName) {
  const schemaPath = path.join(SCHEMAS_DIR, fileName);

  if (!fs.existsSync(schemaPath)) {
    return null;
  }

  const format = fileName.endsWith('.json') ? 'json-schema' : 'yaml-schema';
  const name = fileName.replace(/\.(json|yaml|yml)$/, '');

  // Determine what this schema validates
  let validates = [];
  let description = `Schema for validating ${name.replace(/-/g, ' ')}`;

  if (name.includes('skill')) {
    validates = ['skills/*/SKILL.md'];
    description = 'JSON schema for validating skill definitions. Defines required metadata, triggers, dependencies, and documentation structure for AI agent skills.';
  } else if (name.includes('mcp')) {
    validates = ['mcp-servers/*'];
    description = 'JSON schema for validating MCP (Model Context Protocol) server definitions. Defines server configuration, tools, resources, and metadata structure.';
  } else if (name.includes('component')) {
    validates = ['components/*'];
    description = 'YAML schema for validating component structure and metadata. Defines required fields, dependencies, props, and documentation for React components.';
  } else if (name.includes('ai-dev')) {
    validates = ['.ai-dev.json'];
    description = 'YAML schema for validating .ai-dev.json project configuration files. Defines structure for tracked resources, sync preferences, and CLI settings.';
  }

  return {
    name,
    title: name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
    description,
    format,
    version: '1.0.0',
    path: `/schemas/${fileName}`,
    status: 'active',
    validates,
    related_skills: [],
    related_components: [],
    tags: ['schema', 'validation', name.split('-')[0]]
  };
}

function main() {
  console.log(`\n${GREEN}🔄 Syncing schema-registry.json from schemas/ folder${RESET}\n`);

  // Read all schemas
  const files = fs.readdirSync(SCHEMAS_DIR)
    .filter(file => file.endsWith('.json') || file.endsWith('.yaml') || file.endsWith('.yml'))
    .sort();

  console.log(`Found ${files.length} schemas`);

  // Extract metadata
  const schemas = files.map(file => {
    console.log(`  📄 Processing ${file}`);
    return extractMetadataFromSchema(file);
  }).filter(Boolean);

  // Count formats
  const formatCounts = { 'json-schema': 0, 'yaml-schema': 0 };
  schemas.forEach(schema => {
    formatCounts[schema.format]++;
  });

  // Build registry
  const registry = {
    version: '1.0.0',
    last_updated: new Date().toISOString().split('T')[0],
    description: `Registry of all validation schemas in ai-dev-standards. Schemas define the structure and validation rules for skills, MCPs, components, and project configuration. Now includes ${schemas.length} schemas covering all core resource types.`,
    schemas,
    formats: {
      'json-schema': {
        description: 'JSON Schema Draft 7 for validating JSON structures',
        count: formatCounts['json-schema'],
        specification: 'https://json-schema.org/draft-07/schema'
      },
      'yaml-schema': {
        description: 'YAML-based schema definitions for configuration validation',
        count: formatCounts['yaml-schema'],
        specification: 'Custom YAML schema format'
      }
    },
    statistics: {
      total_schemas: schemas.length,
      formats_count: Object.keys(formatCounts).filter(k => formatCounts[k] > 0).length,
      active_schemas: schemas.filter(s => s.status === 'active').length,
      planned_schemas: schemas.filter(s => s.status === 'planned').length,
      json_schemas: formatCounts['json-schema'],
      yaml_schemas: formatCounts['yaml-schema']
    }
  };

  // Write registry
  fs.writeFileSync(SCHEMA_REGISTRY_PATH, JSON.stringify(registry, null, 2) + '\n');

  console.log(`\n${GREEN}✓ Synced ${schemas.length} schemas to schema-registry.json${RESET}`);
  console.log(`${YELLOW}  Formats: JSON (${formatCounts['json-schema']}), YAML (${formatCounts['yaml-schema']})${RESET}\n`);

  // Also update main registry.json
  const MAIN_REGISTRY_PATH = path.join(ROOT, 'META', 'registry.json');
  if (fs.existsSync(MAIN_REGISTRY_PATH)) {
    const mainRegistry = JSON.parse(fs.readFileSync(MAIN_REGISTRY_PATH, 'utf-8'));
    mainRegistry.schemas = schemas;
    mainRegistry.lastUpdated = new Date().toISOString();
    fs.writeFileSync(MAIN_REGISTRY_PATH, JSON.stringify(mainRegistry, null, 2) + '\n');
    console.log(`${GREEN}✓ Updated schemas in main registry.json${RESET}\n`);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };
