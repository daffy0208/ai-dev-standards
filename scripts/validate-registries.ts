#!/usr/bin/env tsx

/**
 * Validate Registries
 * 
 * Enhanced validation with detailed error messages.
 * Checks that all registries are in sync with directory structure.
 * 
 * Usage: npm run validate:registries
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

// Color codes
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RED = '\x1b[31m';
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';

interface ValidationResult {
  passed: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate skill-registry.json
 */
function validateSkillRegistry(): ValidationResult {
  console.log(`${BLUE}📝 Validating skill-registry.json${RESET}`);

  const result: ValidationResult = {
    passed: true,
    errors: [],
    warnings: []
  };

  // Check registry file exists
  const registryPath = path.join(ROOT, 'META', 'skill-registry.json');
  if (!fs.existsSync(registryPath)) {
    result.errors.push('skill-registry.json does not exist');
    result.passed = false;
    return result;
  }

  // Load registry
  let registry: any;
  try {
    registry = JSON.parse(fs.readFileSync(registryPath, 'utf-8'));
  } catch (e) {
    result.errors.push(`skill-registry.json is not valid JSON: ${e}`);
    result.passed = false;
    return result;
  }

  // Check required fields
  if (!registry.skills || !Array.isArray(registry.skills)) {
    result.errors.push('skill-registry.json missing "skills" array');
    result.passed = false;
  }

  if (registry.total_skills === undefined) {
    result.errors.push('skill-registry.json missing "total_skills" field');
    result.passed = false;
  }

  // Count actual skill directories
  const skillsDir = path.join(ROOT, 'SKILLS');
  const actualSkills = fs.readdirSync(skillsDir)
    .filter(dir => {
      const stat = fs.statSync(path.join(skillsDir, dir));
      return stat.isDirectory() && dir !== '_TEMPLATE';
    });

  // Validate count matches
  if (registry.skills && registry.total_skills !== registry.skills.length) {
    result.errors.push(
      `total_skills (${registry.total_skills}) doesn't match skills array length (${registry.skills.length})`
    );
    result.passed = false;
  }

  if (registry.skills && registry.skills.length !== actualSkills.length) {
    result.errors.push(
      `Registry has ${registry.skills.length} skills but SKILLS/ directory has ${actualSkills.length} directories`
    );
    result.passed = false;
  }

  // Check for orphaned registry entries
  if (registry.skills) {
    const registryNames = new Set(registry.skills.map((s: any) => s.name));
    const actualNames = new Set(actualSkills);

    for (const name of registryNames) {
      if (!actualNames.has(name)) {
        result.errors.push(`Orphaned registry entry: ${name} (directory doesn't exist)`);
        result.passed = false;
      }
    }

    for (const name of actualNames) {
      if (!registryNames.has(name)) {
        result.errors.push(`Missing registry entry: ${name} (directory exists but not in registry)`);
        result.passed = false;
      }
    }
  }

  // Check for duplicate IDs
  if (registry.skills) {
    const names = registry.skills.map((s: any) => s.name);
    const uniqueNames = new Set(names);
    if (names.length !== uniqueNames.size) {
      result.errors.push('Duplicate skill names detected');
      result.passed = false;
    }
  }

  // Validate each skill has required fields
  if (registry.skills) {
    for (const skill of registry.skills) {
      if (!skill.name) {
        result.errors.push(`Skill missing "name" field`);
        result.passed = false;
      }
      if (!skill.description) {
        result.warnings.push(`Skill ${skill.name} missing "description" field`);
      }
      if (!skill.triggers || !Array.isArray(skill.triggers) || skill.triggers.length === 0) {
        result.warnings.push(`Skill ${skill.name} missing or empty "triggers" array`);
      }
    }
  }

  if (result.passed) {
    console.log(`${GREEN}✅ skill-registry.json is valid (${registry.skills?.length || 0} skills)${RESET}`);
  }

  return result;
}

/**
 * Validate mcp-registry.json
 */
function validateMCPRegistry(): ValidationResult {
  console.log(`${BLUE}📝 Validating mcp-registry.json${RESET}`);

  const result: ValidationResult = {
    passed: true,
    errors: [],
    warnings: []
  };

  // Check registry file exists
  const registryPath = path.join(ROOT, 'META', 'mcp-registry.json');
  if (!fs.existsSync(registryPath)) {
    result.errors.push('mcp-registry.json does not exist');
    result.passed = false;
    return result;
  }

  // Load registry
  let registry: any;
  try {
    registry = JSON.parse(fs.readFileSync(registryPath, 'utf-8'));
  } catch (e) {
    result.errors.push(`mcp-registry.json is not valid JSON: ${e}`);
    result.passed = false;
    return result;
  }

  // Check required fields
  if (!registry.mcps || !Array.isArray(registry.mcps)) {
    result.errors.push('mcp-registry.json missing "mcps" array');
    result.passed = false;
  }

  if (registry.total_mcps === undefined) {
    result.errors.push('mcp-registry.json missing "total_mcps" field');
    result.passed = false;
  }

  // Count actual MCP directories
  const mcpDir = path.join(ROOT, 'MCP-SERVERS');
  const actualMCPs = fs.readdirSync(mcpDir)
    .filter(dir => {
      const stat = fs.statSync(path.join(mcpDir, dir));
      return stat.isDirectory();
    });

  // Validate count matches
  if (registry.mcps && registry.total_mcps !== registry.mcps.length) {
    result.errors.push(
      `total_mcps (${registry.total_mcps}) doesn't match mcps array length (${registry.mcps.length})`
    );
    result.passed = false;
  }

  if (registry.mcps && registry.mcps.length !== actualMCPs.length) {
    result.errors.push(
      `Registry has ${registry.mcps.length} MCPs but MCP-SERVERS/ directory has ${actualMCPs.length} directories`
    );
    result.passed = false;
  }

  // Check for orphaned registry entries
  if (registry.mcps) {
    const registryIds = new Set(registry.mcps.map((m: any) => m.id));
    const actualIds = new Set(actualMCPs);

    for (const id of registryIds) {
      if (!actualIds.has(id)) {
        result.errors.push(`Orphaned registry entry: ${id} (directory doesn't exist)`);
        result.passed = false;
      }
    }

    for (const id of actualIds) {
      if (!registryIds.has(id)) {
        result.errors.push(`Missing registry entry: ${id} (directory exists but not in registry)`);
        result.passed = false;
      }
    }
  }

  // Check for duplicate IDs
  if (registry.mcps) {
    const ids = registry.mcps.map((m: any) => m.id);
    const uniqueIds = new Set(ids);
    if (ids.length !== uniqueIds.size) {
      result.errors.push('Duplicate MCP IDs detected');
      result.passed = false;
    }
  }

  if (result.passed) {
    console.log(`${GREEN}✅ mcp-registry.json is valid (${registry.mcps?.length || 0} MCPs)${RESET}`);
  }

  return result;
}

/**
 * Validate tool-registry.json
 */
function validateToolRegistry(): ValidationResult {
  console.log(`${BLUE}📝 Validating tool-registry.json${RESET}`);

  const result: ValidationResult = {
    passed: true,
    errors: [],
    warnings: []
  };

  const registryPath = path.join(ROOT, 'META', 'tool-registry.json');
  if (!fs.existsSync(registryPath)) {
    result.errors.push('tool-registry.json does not exist');
    result.passed = false;
    return result;
  }

  let registry: any;
  try {
    registry = JSON.parse(fs.readFileSync(registryPath, 'utf-8'));
  } catch (e) {
    result.errors.push(`tool-registry.json is not valid JSON: ${e}`);
    result.passed = false;
    return result;
  }

  if (registry.total_tools === undefined) {
    result.errors.push('tool-registry.json missing "total_tools" field');
    result.passed = false;
  }

  if (!registry.tools || !Array.isArray(registry.tools)) {
    result.errors.push('tool-registry.json missing "tools" array');
    result.passed = false;
  }

  if (registry.tools && registry.total_tools !== registry.tools.length) {
    result.errors.push(
      `total_tools (${registry.total_tools}) doesn't match tools array length (${registry.tools.length})`
    );
    result.passed = false;
  }

  if (result.passed) {
    console.log(`${GREEN}✅ tool-registry.json is valid (${registry.tools?.length || 0} tools)${RESET}`);
  }

  return result;
}

/**
 * Validate component-registry.json
 */
function validateComponentRegistry(): ValidationResult {
  console.log(`${BLUE}📝 Validating component-registry.json${RESET}`);

  const result: ValidationResult = {
    passed: true,
    errors: [],
    warnings: []
  };

  const registryPath = path.join(ROOT, 'META', 'component-registry.json');
  if (!fs.existsSync(registryPath)) {
    result.errors.push('component-registry.json does not exist');
    result.passed = false;
    return result;
  }

  let registry: any;
  try {
    registry = JSON.parse(fs.readFileSync(registryPath, 'utf-8'));
  } catch (e) {
    result.errors.push(`component-registry.json is not valid JSON: ${e}`);
    result.passed = false;
    return result;
  }

  if (registry.total_components === undefined) {
    result.errors.push('component-registry.json missing "total_components" field');
    result.passed = false;
  }

  if (!registry.components || !Array.isArray(registry.components)) {
    result.errors.push('component-registry.json missing "components" array');
    result.passed = false;
  }

  if (registry.components && registry.total_components !== registry.components.length) {
    result.errors.push(
      `total_components (${registry.total_components}) doesn't match components array length (${registry.components.length})`
    );
    result.passed = false;
  }

  if (result.passed) {
    console.log(`${GREEN}✅ component-registry.json is valid (${registry.components?.length || 0} components)${RESET}`);
  }

  return result;
}

/**
 * Validate integration-registry.json
 */
function validateIntegrationRegistry(): ValidationResult {
  console.log(`${BLUE}📝 Validating integration-registry.json${RESET}`);

  const result: ValidationResult = {
    passed: true,
    errors: [],
    warnings: []
  };

  const registryPath = path.join(ROOT, 'META', 'integration-registry.json');
  if (!fs.existsSync(registryPath)) {
    result.errors.push('integration-registry.json does not exist');
    result.passed = false;
    return result;
  }

  let registry: any;
  try {
    registry = JSON.parse(fs.readFileSync(registryPath, 'utf-8'));
  } catch (e) {
    result.errors.push(`integration-registry.json is not valid JSON: ${e}`);
    result.passed = false;
    return result;
  }

  if (registry.total_integrations === undefined) {
    result.errors.push('integration-registry.json missing "total_integrations" field');
    result.passed = false;
  }

  if (!registry.integrations || !Array.isArray(registry.integrations)) {
    result.errors.push('integration-registry.json missing "integrations" array');
    result.passed = false;
  }

  if (registry.integrations && registry.total_integrations !== registry.integrations.length) {
    result.errors.push(
      `total_integrations (${registry.total_integrations}) doesn't match integrations array length (${registry.integrations.length})`
    );
    result.passed = false;
  }

  if (result.passed) {
    console.log(`${GREEN}✅ integration-registry.json is valid (${registry.integrations?.length || 0} integrations)${RESET}`);
  }

  return result;
}

/**
 * Main execution
 */
function main(): void {
  console.log(`\n${GREEN}🔍 AI Dev Standards - Registry Validator${RESET}\n`);

  const results: ValidationResult[] = [
    validateSkillRegistry(),
    validateMCPRegistry(),
    validateToolRegistry(),
    validateComponentRegistry(),
    validateIntegrationRegistry()
  ];

  // Collect all errors and warnings
  const allErrors: string[] = [];
  const allWarnings: string[] = [];

  for (const result of results) {
    allErrors.push(...result.errors);
    allWarnings.push(...result.warnings);
  }

  // Print summary
  console.log(`\n${BLUE}📊 Validation Summary:${RESET}`);

  if (allErrors.length > 0) {
    console.log(`\n${RED}❌ Errors (${allErrors.length}):${RESET}`);
    for (const error of allErrors) {
      console.log(`   ${RED}✗${RESET} ${error}`);
    }
  }

  if (allWarnings.length > 0) {
    console.log(`\n${YELLOW}⚠️  Warnings (${allWarnings.length}):${RESET}`);
    for (const warning of allWarnings) {
      console.log(`   ${YELLOW}!${RESET} ${warning}`);
    }
  }

  if (allErrors.length === 0) {
    console.log(`\n${GREEN}✅ All registries are valid!${RESET}`);
    
    if (allWarnings.length > 0) {
      console.log(`${YELLOW}   (${allWarnings.length} warnings)${RESET}`);
    }
    
    console.log();
    process.exit(0);
  } else {
    console.log(`\n${RED}❌ Validation failed with ${allErrors.length} error(s)${RESET}`);
    console.log(`\n${BLUE}To fix, run:${RESET} npm run generate:registries\n`);
    process.exit(1);
  }
}

main();
