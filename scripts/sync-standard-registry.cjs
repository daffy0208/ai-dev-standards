#!/usr/bin/env node

/**
 * Sync Standard Registry
 *
 * Rebuilds standard-registry.json from STANDARDS/ folder (single source of truth)
 * Extracts metadata from standard markdown files
 * This is the ONLY way to update standard-registry.json
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const STANDARDS_DIR = path.join(ROOT, 'STANDARDS');
const STANDARD_REGISTRY_PATH = path.join(ROOT, 'META', 'standard-registry.json');

const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';

function extractMetadataFromStandard(category, fileName) {
  const standardPath = path.join(STANDARDS_DIR, category, fileName);

  if (!fs.existsSync(standardPath)) {
    return null;
  }

  const content = fs.readFileSync(standardPath, 'utf-8');
  const lines = content.split('\n');

  // Extract title (first H1)
  const titleLine = lines.find(line => line.startsWith('# '));
  const title = titleLine ? titleLine.replace(/^#\s*/, '').trim() : fileName.replace('.md', '');

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

  // Determine difficulty
  let difficulty = 'intermediate';
  if (content.includes('advanced') || content.includes('microservices') || content.includes('event-driven')) {
    difficulty = 'advanced';
  } else if (content.includes('beginner') || content.includes('basic') || fileName.includes('naming')) {
    difficulty = 'beginner';
  }

  const name = fileName.replace('.md', '');

  return {
    name,
    title,
    description: description || title,
    category,
    difficulty,
    path: `/STANDARDS/${category}/${fileName}`,
    status: 'active',
    related_skills: [],
    related_playbooks: [],
    tags: [name.split('-')[0], category]
  };
}

function main() {
  console.log(`\n${GREEN}🔄 Syncing standard-registry.json from STANDARDS/ folder${RESET}\n`);

  // Read all categories
  const categories = fs.readdirSync(STANDARDS_DIR)
    .filter(item => fs.statSync(path.join(STANDARDS_DIR, item)).isDirectory());

  console.log(`Found ${categories.length} categories`);

  // Extract metadata from all standards
  const standards = [];
  categories.forEach(category => {
    const files = fs.readdirSync(path.join(STANDARDS_DIR, category))
      .filter(file => file.endsWith('.md'))
      .sort();

    console.log(`  📁 ${category}: ${files.length} standards`);

    files.forEach(file => {
      console.log(`    📄 Processing ${file}`);
      const standard = extractMetadataFromStandard(category, file);
      if (standard) {
        standards.push(standard);
      }
    });
  });

  // Count categories and difficulties
  const categoryCounts = {};
  const difficultyCounts = { beginner: 0, intermediate: 0, advanced: 0 };
  standards.forEach(standard => {
    categoryCounts[standard.category] = (categoryCounts[standard.category] || 0) + 1;
    difficultyCounts[standard.difficulty]++;
  });

  // Build registry
  const registry = {
    version: '1.0.0',
    last_updated: new Date().toISOString().split('T')[0],
    description: `Registry of all development standards in ai-dev-standards. Standards define best practices, coding conventions, architecture patterns, and project structure guidelines. Now includes ${standards.length} standards covering architecture patterns, best practices, coding conventions, and project structure.`,
    standards,
    categories: {
      'architecture-patterns': { description: 'High-level architectural patterns and system design standards', count: categoryCounts['architecture-patterns'] || 0 },
      'best-practices': { description: 'General best practices for development, security, testing, and operations', count: categoryCounts['best-practices'] || 0 },
      'coding-conventions': { description: 'Language-specific coding style guides and conventions', count: categoryCounts['coding-conventions'] || 0 },
      'project-structure': { description: 'Recommended project organization and folder structures', count: categoryCounts['project-structure'] || 0 }
    },
    statistics: {
      total_standards: standards.length,
      categories_count: Object.keys(categoryCounts).length,
      active_standards: standards.filter(s => s.status === 'active').length,
      planned_standards: standards.filter(s => s.status === 'planned').length,
      beginner_count: difficultyCounts.beginner,
      intermediate_count: difficultyCounts.intermediate,
      advanced_count: difficultyCounts.advanced
    }
  };

  // Write registry
  fs.writeFileSync(STANDARD_REGISTRY_PATH, JSON.stringify(registry, null, 2) + '\n');

  console.log(`\n${GREEN}✓ Synced ${standards.length} standards to standard-registry.json${RESET}`);
  console.log(`${YELLOW}  Categories: ${Object.keys(categoryCounts).join(', ')}${RESET}\n`);
}

if (require.main === module) {
  main();
}

module.exports = { main };
