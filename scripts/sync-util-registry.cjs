#!/usr/bin/env node

/**
 * Sync Util Registry
 *
 * Rebuilds util-registry.json from UTILS/ folder (single source of truth)
 * Extracts metadata from utility TypeScript/JavaScript files
 * This is the ONLY way to update util-registry.json
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const UTILS_DIR = path.join(ROOT, 'UTILS');
const UTIL_REGISTRY_PATH = path.join(ROOT, 'META', 'util-registry.json');

const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';

function extractMetadataFromUtil(category, fileName) {
  const utilPath = path.join(UTILS_DIR, category, fileName);

  if (!fs.existsSync(utilPath)) {
    return null;
  }

  const content = fs.readFileSync(utilPath, 'utf-8');
  const name = fileName.replace(/\.(ts|js)$/, '');

  // Extract exports from code (look for export statements)
  const exportMatches = content.match(/export\s+(?:const|function|class|interface|type)\s+(\w+)/g) || [];
  const exports = exportMatches.map(match => {
    const nameMatch = match.match(/export\s+(?:const|function|class|interface|type)\s+(\w+)/);
    return nameMatch ? nameMatch[1] : null;
  }).filter(Boolean);

  // Extract description from JSDoc comment
  let description = `Utility for ${name.replace(/-/g, ' ')}`;
  const docMatch = content.match(/\/\*\*\s*\n\s*\*\s*(.+?)\s*\n/);
  if (docMatch) {
    description = docMatch[1];
  }

  // Extract dependencies from imports
  const importMatches = content.match(/import\s+.+\s+from\s+['"]([^'"]+)['"]/g) || [];
  const dependencies = importMatches
    .map(match => {
      const depMatch = match.match(/from\s+['"]([^'"]+)['"]/);
      if (depMatch) {
        const dep = depMatch[1];
        // Only include external dependencies (not relative imports)
        if (!dep.startsWith('.') && !dep.startsWith('/')) {
          return dep;
        }
      }
      return null;
    })
    .filter(Boolean);

  const language = fileName.endsWith('.ts') ? 'typescript' : 'javascript';

  return {
    name,
    title: name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
    description,
    category,
    language,
    path: `/UTILS/${category}/${fileName}`,
    status: 'active',
    exports: exports.length > 0 ? exports.slice(0, 5) : [], // Limit to top 5 exports
    dependencies: [...new Set(dependencies)], // Remove duplicates
    related_skills: [],
    related_playbooks: [],
    related_standards: [],
    tags: [name.split('-')[0], category, language]
  };
}

function main() {
  console.log(`\n${GREEN}🔄 Syncing util-registry.json from UTILS/ folder${RESET}\n`);

  // Read all categories
  const categories = fs.readdirSync(UTILS_DIR)
    .filter(item => {
      const itemPath = path.join(UTILS_DIR, item);
      return fs.statSync(itemPath).isDirectory();
    });

  console.log(`Found ${categories.length} categories`);

  // Extract metadata from all utilities
  const utilities = [];
  categories.forEach(category => {
    const files = fs.readdirSync(path.join(UTILS_DIR, category))
      .filter(file => file.endsWith('.ts') || file.endsWith('.js'))
      .sort();

    console.log(`  📁 ${category}: ${files.length} utilities`);

    files.forEach(file => {
      console.log(`    📄 Processing ${file}`);
      const util = extractMetadataFromUtil(category, file);
      if (util) {
        utilities.push(util);
      }
    });
  });

  // Count categories and languages
  const categoryCounts = {};
  const languageCounts = { typescript: 0, javascript: 0 };
  utilities.forEach(util => {
    categoryCounts[util.category] = (categoryCounts[util.category] || 0) + 1;
    languageCounts[util.language]++;
  });

  // Build registry
  const registry = {
    version: '1.0.0',
    last_updated: new Date().toISOString().split('T')[0],
    description: `Registry of all utility modules in ai-dev-standards. Utilities provide reusable functions for error handling, logging, validation, and automation. Now includes ${utilities.length} utilities covering API, CLI, environment, scripts, and validation.`,
    utilities,
    categories: {
      'api': { description: 'API-related utilities for error handling, middleware, and request processing', count: categoryCounts['api'] || 0 },
      'cli': { description: 'Command-line interface utilities for logging, progress, and output formatting', count: categoryCounts['cli'] || 0 },
      'env': { description: 'Environment configuration and validation utilities', count: categoryCounts['env'] || 0 },
      'scripts': { description: 'Automation scripts for database operations, deployment, and testing', count: categoryCounts['scripts'] || 0 },
      'validation': { description: 'Schema validation and data verification utilities', count: categoryCounts['validation'] || 0 }
    },
    statistics: {
      total_utilities: utilities.length,
      categories_count: Object.keys(categoryCounts).length,
      active_utilities: utilities.filter(u => u.status === 'active').length,
      planned_utilities: utilities.filter(u => u.status === 'planned').length,
      typescript_count: languageCounts.typescript,
      average_exports: Math.round(utilities.reduce((sum, u) => sum + u.exports.length, 0) / utilities.length)
    }
  };

  // Write registry
  fs.writeFileSync(UTIL_REGISTRY_PATH, JSON.stringify(registry, null, 2) + '\n');

  console.log(`\n${GREEN}✓ Synced ${utilities.length} utilities to util-registry.json${RESET}`);
  console.log(`${YELLOW}  Categories: ${Object.keys(categoryCounts).join(', ')}${RESET}\n`);

  // Also update main registry.json with category-level entries
  const MAIN_REGISTRY_PATH = path.join(ROOT, 'META', 'registry.json');
  if (fs.existsSync(MAIN_REGISTRY_PATH)) {
    const mainRegistry = JSON.parse(fs.readFileSync(MAIN_REGISTRY_PATH, 'utf-8'));
    
    // Build category-level entries for main registry
    const categoryDescriptions = {
      'api': 'API client utilities and HTTP helpers',
      'cli': 'CLI utilities and command-line helpers',
      'scripts': 'Development scripts and automation',
      'validation': 'Data validation utilities and schema validators'
    };
    
    mainRegistry.utils = Object.keys(categoryCounts).map(category => ({
      category,
      description: categoryDescriptions[category] || `${category} utilities`,
      path: `UTILS/${category}`,
      alwaysUpdate: false
    }));
    
    mainRegistry.lastUpdated = new Date().toISOString();
    fs.writeFileSync(MAIN_REGISTRY_PATH, JSON.stringify(mainRegistry, null, 2) + '\n');
    console.log(`${GREEN}✓ Updated utils in main registry.json${RESET}\n`);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };
