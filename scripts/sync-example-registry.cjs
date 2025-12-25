#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const EXAMPLES_DIR = path.join(ROOT, 'EXAMPLES');
const EXAMPLE_REGISTRY_PATH = path.join(ROOT, 'META', 'example-registry.json');

const GREEN = '\x1b[32m';
const RESET = '\x1b[0m';

function walkDirectory(dir, baseDir = '') {
  const examples = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;

    const relativePath = path.join(baseDir, entry.name);
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      examples.push(...walkDirectory(fullPath, relativePath));
    } else if (entry.name.endsWith('.md') || entry.name.endsWith('.ts') || entry.name.endsWith('.js')) {
      const name = entry.name.replace(/\.(md|ts|js)$/, '');
      const language = entry.name.endsWith('.ts') ? 'typescript' : entry.name.endsWith('.js') ? 'javascript' : 'markdown';

      let category = 'code';
      if (entry.name.includes('workflow')) category = 'workflows';
      if (entry.name.includes('cursorrules')) category = 'configuration';

      examples.push({
        name,
        title: name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        description: `Example demonstrating ${name.replace(/-/g, ' ')}`,
        category,
        language,
        path: `/examples/${relativePath}`,
        status: 'active',
        complexity: 'intermediate',
        related_skills: [],
        tags: [name.split('-')[0], category]
      });
    }
  }

  return examples;
}

function main() {
  console.log(`\n${GREEN}🔄 Syncing example-registry.json${RESET}\n`);
  const examples = walkDirectory(EXAMPLES_DIR);

  const categoryCounts = {};
  examples.forEach(ex => categoryCounts[ex.category] = (categoryCounts[ex.category] || 0) + 1);

  const registry = {
    version: '1.0.0',
    last_updated: new Date().toISOString().split('T')[0],
    description: `Registry of all code examples. Now includes ${examples.length} examples.`,
    examples,
    categories: {
      workflows: { description: 'End-to-end workflow examples', count: categoryCounts['workflows'] || 0 },
      configuration: { description: 'Configuration examples', count: categoryCounts['configuration'] || 0 },
      code: { description: 'Code implementation examples', count: categoryCounts['code'] || 0 }
    },
    statistics: {
      total_examples: examples.length,
      categories_count: Object.keys(categoryCounts).length,
      active_examples: examples.length
    }
  };

  fs.writeFileSync(EXAMPLE_REGISTRY_PATH, JSON.stringify(registry, null, 2) + '\n');
  console.log(`${GREEN}✓ Synced ${examples.length} examples${RESET}\n`);
}

if (require.main === module) main();
module.exports = { main };
