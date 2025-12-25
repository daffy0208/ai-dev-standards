#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DOCS_DIR = path.join(ROOT, 'DOCS');
const DOCS_REGISTRY_PATH = path.join(ROOT, 'META', 'docs-registry.json');

const GREEN = '\x1b[32m';
const RESET = '\x1b[0m';

function walkDirectory(dir, baseDir = '') {
  const docs = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;

    const relativePath = path.join(baseDir, entry.name);
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      docs.push(...walkDirectory(fullPath, relativePath));
    } else if (entry.name.endsWith('.md')) {
      const name = entry.name.replace('.md', '').toLowerCase();

      let category = 'system';
      if (name.includes('quick') || name.includes('getting') || name.includes('bootstrap')) category = 'getting-started';
      if (name.includes('cli')) category = 'cli';
      if (name.includes('deploy') || name.includes('ci-cd')) category = 'deployment';
      if (name.includes('integration') || name.includes('existing')) category = 'integration';
      if (name.includes('index') || name.includes('cheat') || name === 'readme') category = 'reference';
      if (name.includes('roadmap')) category = 'planning';
      if (name.includes('security')) category = 'security';

      docs.push({
        name,
        title: name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        description: `Documentation for ${name.replace(/-/g, ' ')}`,
        category,
        path: `/docs/${relativePath}`,
        status: 'active',
        audience: ['developers'],
        related_skills: [],
        tags: [name.split('-')[0], category]
      });
    }
  }

  return docs;
}

function main() {
  console.log(`\n${GREEN}🔄 Syncing docs-registry.json${RESET}\n`);
  const docs = walkDirectory(DOCS_DIR);

  const categoryCounts = {};
  docs.forEach(doc => categoryCounts[doc.category] = (categoryCounts[doc.category] || 0) + 1);

  const registry = {
    version: '1.0.0',
    last_updated: new Date().toISOString().split('T')[0],
    description: `Registry of all documentation files. Now includes ${docs.length} documentation files.`,
    docs,
    categories: {
      'getting-started': { description: 'Getting started guides', count: categoryCounts['getting-started'] || 0 },
      cli: { description: 'CLI documentation', count: categoryCounts['cli'] || 0 },
      deployment: { description: 'Deployment guides', count: categoryCounts['deployment'] || 0 },
      integration: { description: 'Integration guides', count: categoryCounts['integration'] || 0 },
      system: { description: 'System documentation', count: categoryCounts['system'] || 0 },
      reference: { description: 'Reference documentation', count: categoryCounts['reference'] || 0 },
      planning: { description: 'Planning documents', count: categoryCounts['planning'] || 0 },
      security: { description: 'Security documentation', count: categoryCounts['security'] || 0 }
    },
    statistics: {
      total_docs: docs.length,
      categories_count: Object.keys(categoryCounts).length,
      active_docs: docs.length
    }
  };

  fs.writeFileSync(DOCS_REGISTRY_PATH, JSON.stringify(registry, null, 2) + '\n');
  console.log(`${GREEN}✓ Synced ${docs.length} docs${RESET}\n`);
}

if (require.main === module) main();
module.exports = { main };
