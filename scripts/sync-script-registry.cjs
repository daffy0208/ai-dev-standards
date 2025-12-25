#!/usr/bin/env node

/**
 * Sync Script Registry
 *
 * Updates the scripts section in registry.json from scripts/ folder
 * Only includes .js and .ts files (excludes .cjs and other extensions)
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SCRIPTS_DIR = path.join(__dirname);
const REGISTRY_PATH = path.join(ROOT, 'meta', 'registry.json');

const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';

function extractScriptMetadata(fileName) {
  const scriptPath = path.join(SCRIPTS_DIR, fileName);
  
  if (!fs.existsSync(scriptPath)) {
    return null;
  }

  const content = fs.readFileSync(scriptPath, 'utf-8');
  const name = fileName.replace(/\.(js|ts)$/, '');
  
  // Extract description from JSDoc comment or file header
  let description = `Script for ${name.replace(/-/g, ' ')}`;
  const docMatch = content.match(/\/\*\*\s*\n\s*\*\s*(.+?)\s*\n/);
  if (docMatch) {
    description = docMatch[1];
  } else {
    // Try to find description in file header comments
    const headerMatch = content.match(/^\/\*\*[\s\S]*?\*\s*(.+?)(?:\s*\*\s*\n|\s*\*\/)/);
    if (headerMatch) {
      description = headerMatch[1];
    }
  }
  
  return {
    name,
    version: '1.0.0',
    description,
    path: `scripts/${fileName}`,
    tags: extractTags(fileName, content),
    usage: `node scripts/${fileName}`
  };
}

function extractTags(fileName, content) {
  const tags = [];
  const lower = content.toLowerCase();
  
  if (fileName.includes('db-') || lower.includes('database')) tags.push('database');
  if (fileName.includes('deploy') || lower.includes('deployment')) tags.push('deployment');
  if (fileName.includes('test') || lower.includes('testing')) tags.push('testing');
  if (fileName.includes('registry') || lower.includes('registry')) tags.push('registry');
  if (fileName.includes('relationship') || lower.includes('relationship')) tags.push('relationships');
  if (lower.includes('automation')) tags.push('automation');
  
  return tags;
}

function main() {
  console.log(`\n${GREEN}🔄 Syncing scripts section in registry.json${RESET}\n`);
  
  // Get all .js and .ts script files (excluding .cjs)
  const files = fs.readdirSync(SCRIPTS_DIR)
    .filter(f => (f.endsWith('.js') || f.endsWith('.ts')) && !f.endsWith('.cjs'))
    .sort();
  
  console.log(`${YELLOW}Found ${files.length} script files${RESET}\n`);
  
  // Extract metadata for each script
  const scripts = [];
  let successCount = 0;
  
  files.forEach(fileName => {
    const metadata = extractScriptMetadata(fileName);
    if (metadata) {
      scripts.push(metadata);
      console.log(`${GREEN}✅${RESET} ${fileName}`);
      successCount++;
    }
  });
  
  console.log(`\n${GREEN}✅ Processed: ${successCount}${RESET}\n`);
  
  // Update main registry
  const registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf-8'));
  registry.scripts = scripts;
  registry.lastUpdated = new Date().toISOString();
  fs.writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2) + '\n');
  
  console.log(`${GREEN}✨ registry.json scripts section synced!${RESET}`);
  console.log(`   Scripts: ${scripts.length}\n`);
}

if (require.main === module) {
  main();
}

module.exports = { main };
