#!/usr/bin/env node

/**
 * Sync Skill Registry
 *
 * Rebuilds skill-registry.json from SKILLS/ folder (single source of truth)
 * Extracts metadata from SKILL.md files
 * This is the ONLY way to update skill-registry.json
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SKILLS_DIR = path.join(ROOT, 'SKILLS');
const SKILL_REGISTRY_PATH = path.join(ROOT, 'META', 'skill-registry.json');

const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';

// Category mappings (default categories for skills)
const CATEGORY_MAP = {
  'product': 'product-development',
  'ai': 'ai-native',
  'technical': 'technical',
  'design': 'ux-design',
  'content': 'content',
  'specialized': 'specialized',
  'infrastructure': 'infrastructure',
  'devops': 'infrastructure',
  'adhd-support': 'adhd-support'
};

function extractMetadataFromSKILL(skillName) {
  const skillPath = path.join(SKILLS_DIR, skillName, 'SKILL.md');

  if (!fs.existsSync(skillPath)) {
    console.warn(`⚠️  No SKILL.md found for ${skillName}`);
    return null;
  }

  const content = fs.readFileSync(skillPath, 'utf-8');

  // Extract YAML frontmatter
  const frontmatterMatch = content.match(/^---\n([\s\S]+?)\n---/);
  if (!frontmatterMatch) {
    console.warn(`⚠️  No frontmatter in SKILL.md for ${skillName}`);
    return null;
  }

  const frontmatter = frontmatterMatch[1];

  // Extract fields
  const name = frontmatter.match(/^name:\s*(.+)$/m)?.[1]?.trim() || skillName;
  const description = frontmatter.match(/^description:\s*(.+)$/m)?.[1]?.trim() || `Expert in ${skillName.replace(/-/g, ' ')}`;
  const version = frontmatter.match(/^version:\s*(.+)$/m)?.[1]?.trim() || '1.0.0';
  const category = frontmatter.match(/^category:\s*(.+)$/m)?.[1]?.trim() || 'specialized';
  const difficulty = frontmatter.match(/^difficulty:\s*(.+)$/m)?.[1]?.trim() || 'intermediate';
  const estimatedTime = frontmatter.match(/^estimated_time:\s*(.+)$/m)?.[1]?.trim() || '1-3 hours';

  // Extract triggers (multi-line array)
  const triggersMatch = frontmatter.match(/triggers:\s*\n((?:\s*-\s*.+\n?)+)/);
  const triggers = triggersMatch
    ? triggersMatch[1].split('\n').map(line => line.trim().replace(/^-\s*/, '')).filter(Boolean)
    : [skillName, skillName.replace(/-/g, ' ')];

  // Extract tags (multi-line array)
  const tagsMatch = frontmatter.match(/tags:\s*\n((?:\s*-\s*.+\n?)+)/);
  const tags = tagsMatch
    ? tagsMatch[1].split('\n').map(line => line.trim().replace(/^-\s*/, '')).filter(Boolean)
    : [category];

  // Extract MCP tools if present
  const mcpToolsMatch = frontmatter.match(/mcp-tools:\s*\n((?:\s*-\s*.+\n?)+)/);
  const mcpTools = mcpToolsMatch
    ? mcpToolsMatch[1].split('\n').map(line => line.trim().replace(/^-\s*/, '')).filter(Boolean)
    : undefined;

  return {
    name: skillName, // Use folder name as canonical name
    description,
    triggers,
    tags,
    category: CATEGORY_MAP[category] || category,
    difficulty,
    estimated_time: estimatedTime,
    path: `/SKILLS/${skillName}/`,
    status: 'active',
    prerequisites: [],
    related_skills: [],
    frameworks: ['all'],
    languages: ['all'],
    ...(mcpTools && mcpTools.length > 0 ? { mcp_tools: mcpTools } : {})
  };
}

function main() {
  console.log(`\n${GREEN}🔄 Syncing skill-registry.json from SKILLS/ folder${RESET}\n`);

  // Get all skill folders (excluding _TEMPLATE)
  const skillFolders = fs.readdirSync(SKILLS_DIR)
    .filter(f => f !== '_TEMPLATE' && fs.statSync(path.join(SKILLS_DIR, f)).isDirectory())
    .sort();

  console.log(`${YELLOW}Found ${skillFolders.length} skill folders${RESET}\n`);

  // Extract metadata for each skill
  const skills = [];
  let successCount = 0;
  let failCount = 0;

  skillFolders.forEach(skillName => {
    const metadata = extractMetadataFromSKILL(skillName);
    if (metadata) {
      skills.push(metadata);
      console.log(`${GREEN}✅${RESET} ${skillName}`);
      successCount++;
    } else {
      console.error(`❌ Failed to extract metadata for ${skillName}`);
      failCount++;
    }
  });

  console.log(`\n${GREEN}✅ Processed: ${successCount}${RESET}`);
  if (failCount > 0) {
    console.log(`${YELLOW}⚠️  Failed: ${failCount}${RESET}`);
  }

  // Read existing registry to preserve structure
  const existingRegistry = JSON.parse(fs.readFileSync(SKILL_REGISTRY_PATH, 'utf-8'));

  // Build new registry
  const newRegistry = {
    version: existingRegistry.version.split('.').map((v, i) => i === 1 ? parseInt(v) + 1 : v).join('.'), // Bump minor version
    last_updated: new Date().toISOString().split('T')[0],
    description: existingRegistry.description.replace(/\d+ active skills/, `${skills.length} active skills`),
    skills: skills,
    categories: existingRegistry.categories || [],
    difficulty_levels: existingRegistry.difficulty_levels || [],
    usage_notes: existingRegistry.usage_notes || {}
  };

  // Write new registry
  fs.writeFileSync(SKILL_REGISTRY_PATH, JSON.stringify(newRegistry, null, 2) + '\n');

  console.log(`\n${GREEN}✨ skill-registry.json synced!${RESET}`);
  console.log(`   Skills: ${skills.length}`);
  console.log(`   Version: ${newRegistry.version}`);
  console.log(`   Date: ${newRegistry.last_updated}\n`);
}

main();
