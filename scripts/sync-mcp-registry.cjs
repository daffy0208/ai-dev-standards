#!/usr/bin/env node

/**
 * Sync MCP Registry
 *
 * Updates MCP entries in registry.json from MCP-SERVERS/ folder
 * Extracts metadata from package.json files
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const MCP_DIR = path.join(ROOT, 'MCP-SERVERS');
const REGISTRY_PATH = path.join(ROOT, 'META', 'registry.json');

const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';

function extractMCPMetadata(mcpFolder) {
  const packagePath = path.join(MCP_DIR, mcpFolder, 'package.json');
  const readmePath = path.join(MCP_DIR, mcpFolder, 'README.md');

  // MCP name is folder name without -mcp suffix
  const mcpName = mcpFolder.replace(/-mcp$/, '');

  // Try package.json first
  let pkg = null;
  if (fs.existsSync(packagePath)) {
    pkg = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
  }

  // Fall back to README.md if no package.json
  let description = null;
  let enables = [];

  if (fs.existsSync(readmePath)) {
    const readme = fs.readFileSync(readmePath, 'utf-8');

    // Extract first line after title as description
    const descMatch = readme.match(/^#[^\n]+\n\n(.+)$/m);
    if (descMatch) {
      description = descMatch[1].trim();
    }

    // Try to extract which skills this enables
    const enablesMatch = readme.match(/Enables:\s*\*\*([^*]+)\*\*/);
    if (enablesMatch) {
      enables = enablesMatch[1].split(',').map(s => s.trim());
    }
  }

  // If no package.json and no README, warn and skip
  if (!pkg && !description) {
    console.warn(`⚠️  No package.json or README.md found for ${mcpFolder}`);
    return null;
  }

  // If no package.json but have README, mark as placeholder
  const isPlaceholder = !pkg;

  return {
    name: mcpName,
    version: pkg?.version || '0.0.0',
    description: pkg?.description || description || `MCP server for ${mcpName}`,
    path: `MCP-SERVERS/${mcpFolder}`,
    tags: Array.isArray(pkg?.keywords) ? pkg.keywords : ['mcp', mcpName],
    features: ['tools'], // All MCPs provide tools
    dependencies: pkg?.dependencies || {},
    enables: enables.length > 0 ? enables : [],
    status: isPlaceholder ? 'planned' : 'active'
  };
}

function main() {
  console.log(`\n${GREEN}🔄 Syncing MCP entries in registry.json${RESET}\n`);

  // Get all MCP folders
  const mcpFolders = fs.readdirSync(MCP_DIR)
    .filter(f => fs.statSync(path.join(MCP_DIR, f)).isDirectory())
    .sort();

  console.log(`${YELLOW}Found ${mcpFolders.length} MCP folders${RESET}\n`);

  // Extract metadata for each MCP
  const mcps = [];
  let successCount = 0;

  mcpFolders.forEach(mcpFolder => {
    const metadata = extractMCPMetadata(mcpFolder);
    if (metadata) {
      mcps.push(metadata);
      console.log(`${GREEN}✅${RESET} ${mcpFolder} → ${metadata.name}`);
      successCount++;
    }
  });

  console.log(`\n${GREEN}✅ Processed: ${successCount}${RESET}\n`);

  // Read existing registry
  const registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf-8'));

  // Update MCP servers section
  registry.mcpServers = mcps;
  registry.lastUpdated = new Date().toISOString();

  // Write back
  fs.writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2) + '\n');

  console.log(`${GREEN}✨ registry.json MCP section synced!${RESET}`);
  console.log(`   MCPs: ${mcps.length}\n`);
}

main();
