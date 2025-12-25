#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const INSTALLERS_DIR = path.join(ROOT, 'installers');
const INSTALLER_REGISTRY_PATH = path.join(ROOT, 'meta', 'installer-registry.json');

const GREEN = '\x1b[32m';
const RESET = '\x1b[0m';

function main() {
  console.log(`\n${GREEN}🔄 Syncing installer-registry.json${RESET}\n`);

  const entries = fs.readdirSync(INSTALLERS_DIR, { withFileTypes: true })
    .filter(e => e.isDirectory());

  const installers = entries.map(entry => {
    const name = entry.name;
    let category = 'applications';
    if (name === 'bootstrap') category = 'core';
    if (name.includes('rag')) category = 'ai-applications';

    return {
      name,
      title: name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      description: `Installer for ${name.replace(/-/g, ' ')}`,
      category,
      language: 'javascript',
      path: `/installers/${name}/`,
      entry_point: 'index.js',
      status: 'active',
      npm_package: `@ai-dev-standards/${name}`,
      installation: `npx @ai-dev-standards/${name}`,
      features: [],
      related_skills: [],
      tags: [name.split('-')[0], 'installer']
    };
  });

  const categoryCounts = {};
  installers.forEach(inst => categoryCounts[inst.category] = (categoryCounts[inst.category] || 0) + 1);

  const registry = {
    version: '1.0.0',
    last_updated: new Date().toISOString().split('T')[0],
    description: `Registry of all project installers. Now includes ${installers.length} installers.`,
    installers,
    categories: {
      core: { description: 'Core setup installers', count: categoryCounts['core'] || 0 },
      'ai-applications': { description: 'AI application installers', count: categoryCounts['ai-applications'] || 0 },
      applications: { description: 'Application installers', count: categoryCounts['applications'] || 0 }
    },
    statistics: {
      total_installers: installers.length,
      categories_count: Object.keys(categoryCounts).length,
      active_installers: installers.length
    }
  };

  fs.writeFileSync(INSTALLER_REGISTRY_PATH, JSON.stringify(registry, null, 2) + '\n');
  console.log(`${GREEN}✓ Synced ${installers.length} installers${RESET}\n`);
}

if (require.main === module) main();
module.exports = { main };
