#!/usr/bin/env node

/**
 * Sync Playbook Registry
 *
 * Rebuilds playbook-registry.json from PLAYBOOKS/ folder (single source of truth)
 * Extracts metadata from playbook markdown files
 * This is the ONLY way to update playbook-registry.json
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PLAYBOOKS_DIR = path.join(ROOT, 'PLAYBOOKS');
const PLAYBOOK_REGISTRY_PATH = path.join(ROOT, 'META', 'playbook-registry.json');

const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';

function extractMetadataFromPlaybook(fileName) {
  const playbookPath = path.join(PLAYBOOKS_DIR, fileName);

  if (!fs.existsSync(playbookPath)) {
    return null;
  }

  const content = fs.readFileSync(playbookPath, 'utf-8');
  const lines = content.split('\n');

  // Extract title (first H1)
  const titleLine = lines.find(line => line.startsWith('# '));
  const title = titleLine ? titleLine.replace(/^#\s*/, '').trim() : fileName.replace('.md', '');

  // Extract "Use when:" line (usually near top)
  const useWhenLine = lines.find(line => line.match(/^\*\*Use (when|before|for):/i));
  const useWhen = useWhenLine ? useWhenLine.replace(/^\*\*Use (when|before|for):\*\*/i, '').trim() : '';

  // Extract description (first paragraph after title)
  let description = '';
  let foundTitle = false;
  for (const line of lines) {
    if (line.startsWith('# ')) {
      foundTitle = true;
      continue;
    }
    if (foundTitle && line.trim() && !line.startsWith('**') && !line.startsWith('---')) {
      description = line.trim();
      break;
    }
  }

  // Determine category based on content/filename
  let category = 'operations';
  if (fileName.includes('adhd')) category = 'adhd-support';
  else if (fileName.includes('incident')) category = 'incident';
  else if (fileName.includes('security')) category = 'security';
  else if (fileName.includes('performance')) category = 'optimization';
  else if (fileName.includes('component') || fileName.includes('development') || fileName.includes('validation')) category = 'development';

  // Determine difficulty
  let difficulty = 'intermediate';
  if (content.includes('advanced') || content.includes('complex') || content.includes('security') || content.includes('incident')) {
    difficulty = 'advanced';
  } else if (content.length < 3000 || fileName.includes('adhd')) {
    difficulty = 'beginner';
  }

  // Estimate time
  let estimatedTime = '1-3 hours';
  if (content.includes('5-15 minutes') || content.includes('5 minutes')) {
    estimatedTime = '5-15 minutes';
  } else if (content.includes('30 minutes')) {
    estimatedTime = '30 minutes - 2 hours';
  } else if (content.includes('2-4 weeks')) {
    estimatedTime = '2-4 weeks';
  } else if (content.includes('4-8 hours') || content.includes('8-16 hours')) {
    estimatedTime = content.match(/\d+-\d+\s+hours/)?.[0] || estimatedTime;
  }

  const name = fileName.replace('.md', '');

  return {
    name,
    title,
    description: description || title,
    use_when: useWhen || `Use when ${name.replace(/-/g, ' ')}`,
    category,
    difficulty,
    estimated_time: estimatedTime,
    path: `/PLAYBOOKS/${fileName}`,
    status: 'active',
    prerequisites: [],
    related_playbooks: [],
    related_skills: [],
    tags: [name.split('-')[0], category]
  };
}

function main() {
  console.log(`\n${GREEN}🔄 Syncing playbook-registry.json from PLAYBOOKS/ folder${RESET}\n`);

  // Read all playbooks
  const files = fs.readdirSync(PLAYBOOKS_DIR)
    .filter(file => file.endsWith('.md'))
    .sort();

  console.log(`Found ${files.length} playbooks`);

  // Extract metadata
  const playbooks = files.map(file => {
    console.log(`  📖 Processing ${file}`);
    return extractMetadataFromPlaybook(file);
  }).filter(Boolean);

  // Count categories
  const categories = {};
  playbooks.forEach(playbook => {
    categories[playbook.category] = (categories[playbook.category] || 0) + 1;
  });

  // Build registry
  const registry = {
    version: '1.0.0',
    last_updated: new Date().toISOString().split('T')[0],
    description: `Registry of all operational playbooks in ai-dev-standards. Playbooks are step-by-step guides for critical operations, incident response, deployment procedures, and development workflows. Now includes ${playbooks.length} playbooks covering ADHD support, deployment, incidents, development workflows, and system reliability.`,
    playbooks,
    categories: {
      'adhd-support': { description: 'Playbooks designed for ADHD developers to manage focus, activation energy, and overwhelm', count: categories['adhd-support'] || 0 },
      'operations': { description: 'Operational procedures for deployment, backup, monitoring, and database management', count: categories['operations'] || 0 },
      'development': { description: 'Development workflows, best practices, and implementation guides', count: categories['development'] || 0 },
      'incident': { description: 'Emergency response procedures for production incidents and outages', count: categories['incident'] || 0 },
      'optimization': { description: 'Performance and scalability optimization procedures', count: categories['optimization'] || 0 },
      'security': { description: 'Security hardening and vulnerability prevention procedures', count: categories['security'] || 0 }
    },
    statistics: {
      total_playbooks: playbooks.length,
      categories_count: Object.keys(categories).length,
      active_playbooks: playbooks.filter(p => p.status === 'active').length,
      planned_playbooks: playbooks.filter(p => p.status === 'planned').length,
      average_estimated_time: '1-8 hours'
    }
  };

  // Write registry
  fs.writeFileSync(PLAYBOOK_REGISTRY_PATH, JSON.stringify(registry, null, 2) + '\n');

  console.log(`\n${GREEN}✓ Synced ${playbooks.length} playbooks to playbook-registry.json${RESET}`);
  console.log(`${YELLOW}  Categories: ${Object.keys(categories).join(', ')}${RESET}\n`);
}

if (require.main === module) {
  main();
}

module.exports = { main };
