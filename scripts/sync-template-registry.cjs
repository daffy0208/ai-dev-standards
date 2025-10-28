#!/usr/bin/env node

/**
 * Sync Template Registry
 *
 * Rebuilds template-registry.json from TEMPLATES/ folder (single source of truth)
 * Extracts metadata from template files
 * This is the ONLY way to update template-registry.json
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const TEMPLATES_DIR = path.join(ROOT, 'TEMPLATES');
const TEMPLATE_REGISTRY_PATH = path.join(ROOT, 'META', 'template-registry.json');

const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';

function determineCategory(filePath) {
  if (filePath.includes('config-files')) return 'config-files';
  if (filePath.includes('testing')) return 'testing-setup';
  if (filePath.includes('ci-cd')) return 'ci-cd';
  if (filePath.includes('deployment')) return 'deployment';
  if (filePath.includes('project-starters')) return 'project-starters';
  if (filePath.includes('cursorrules') && filePath.endsWith('.md')) return 'cursorrules-variants';
  return 'project-config';
}

function getFileType(fileName) {
  if (fileName.endsWith('.json')) return 'json';
  if (fileName.endsWith('.md')) return 'markdown';
  if (fileName.endsWith('.js')) return 'javascript';
  if (fileName.endsWith('.ts')) return 'typescript';
  if (fileName.endsWith('.yaml') || fileName.endsWith('.yml')) return 'yaml';
  if (fileName.includes('.env')) return 'env';
  if (fileName === '.gitkeep') return 'placeholder';
  return 'text';
}

function extractMetadataFromTemplate(relativePath, fileName) {
  const templatePath = path.join(TEMPLATES_DIR, relativePath);
  const category = determineCategory(relativePath);
  const fileType = getFileType(fileName);

  // Handle placeholders
  if (fileName === '.gitkeep') {
    const dirName = path.basename(path.dirname(templatePath));
    return {
      name: `${dirName}-placeholder`,
      title: `${dirName.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} (Planned)`,
      description: `Placeholder for ${dirName.replace(/-/g, ' ')} templates. Coming soon.`,
      category,
      file_type: 'placeholder',
      path: `/TEMPLATES/${relativePath}`,
      status: 'planned',
      use_case: `Setting up ${dirName.replace(/-/g, ' ')}`,
      related_skills: [],
      tags: [dirName, 'planned']
    };
  }

  // Read file content for description
  let content = '';
  let title = fileName;
  let description = `Template file for ${fileName}`;

  try {
    if (fs.existsSync(templatePath) && fs.statSync(templatePath).size < 100000) {
      content = fs.readFileSync(templatePath, 'utf-8');

      // Extract title from markdown files
      if (fileName.endsWith('.md')) {
        const titleMatch = content.match(/^#\s+(.+)$/m);
        if (titleMatch) {
          title = titleMatch[1].trim();
        }

        // Extract description (first paragraph)
        const lines = content.split('\n');
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
      }
    }
  } catch (err) {
    // Ignore read errors
  }

  const name = fileName.replace(/\.(md|json|js|ts|yaml|yml|latest)$/g, '').replace(/^\./, '');

  return {
    name,
    title,
    description,
    category,
    file_type: fileType,
    path: `/TEMPLATES/${relativePath}`,
    status: 'active',
    use_case: `Setting up ${name.replace(/-/g, ' ')}`,
    related_skills: [],
    tags: [name.split('-')[0], category]
  };
}

function walkDirectory(dir, baseDir = '') {
  const templates = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const relativePath = path.join(baseDir, entry.name);
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      templates.push(...walkDirectory(fullPath, relativePath));
    } else {
      templates.push(extractMetadataFromTemplate(relativePath, entry.name));
    }
  }

  return templates;
}

function main() {
  console.log(`\n${GREEN}🔄 Syncing template-registry.json from TEMPLATES/ folder${RESET}\n`);

  // Walk all templates
  const templates = walkDirectory(TEMPLATES_DIR);

  console.log(`Found ${templates.length} templates`);

  // Count categories
  const categoryCounts = {};
  templates.forEach(template => {
    categoryCounts[template.category] = (categoryCounts[template.category] || 0) + 1;
  });

  // Build registry
  const registry = {
    version: '1.0.0',
    last_updated: new Date().toISOString().split('T')[0],
    description: `Registry of all project templates in ai-dev-standards. Templates provide ready-to-use configuration files, cursorrules variants, project examples, and testing setups. Now includes ${templates.length} templates covering config files, cursorrules, project initialization, and testing.`,
    templates,
    categories: {
      'project-config': { description: 'Project-level configuration files for ai-dev-standards and Archon', count: categoryCounts['project-config'] || 0 },
      'config-files': { description: 'Standard configuration files for linting, formatting, environment, and tooling', count: categoryCounts['config-files'] || 0 },
      'cursorrules-variants': { description: 'Specialized .cursorrules templates for different project types', count: categoryCounts['cursorrules-variants'] || 0 },
      'testing-setup': { description: 'Testing framework setup guides and configurations', count: categoryCounts['testing-setup'] || 0 },
      'ci-cd': { description: 'CI/CD pipeline templates (planned)', count: categoryCounts['ci-cd'] || 0 },
      'deployment': { description: 'Deployment configuration templates (planned)', count: categoryCounts['deployment'] || 0 },
      'project-starters': { description: 'Complete project starter templates (planned)', count: categoryCounts['project-starters'] || 0 }
    },
    statistics: {
      total_templates: templates.length,
      categories_count: Object.keys(categoryCounts).length,
      active_templates: templates.filter(t => t.status === 'active').length,
      planned_templates: templates.filter(t => t.status === 'planned').length,
      config_files_count: categoryCounts['config-files'] + categoryCounts['project-config'] || 0,
      cursorrules_variants_count: categoryCounts['cursorrules-variants'] || 0,
      testing_templates_count: categoryCounts['testing-setup'] || 0
    }
  };

  // Write registry
  fs.writeFileSync(TEMPLATE_REGISTRY_PATH, JSON.stringify(registry, null, 2) + '\n');

  console.log(`\n${GREEN}✓ Synced ${templates.length} templates to template-registry.json${RESET}`);
  console.log(`${YELLOW}  Categories: ${Object.keys(categoryCounts).join(', ')}${RESET}\n`);
}

if (require.main === module) {
  main();
}

module.exports = { main };
