#!/usr/bin/env node

/**
 * Map Tier 2 Relationships Script
 * Intelligently maps playbooks, standards, templates, schemas, utils, examples, installers, docs to skills
 * Uses keyword matching, content analysis, and curated rules
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const RELATIONSHIP_MAPPING_PATH = path.join(ROOT, 'meta', 'relationship-mapping.json');

// Load all Tier 2 registries
const playbookRegistry = JSON.parse(fs.readFileSync(path.join(ROOT, 'meta', 'playbook-registry.json'), 'utf-8'));
const standardRegistry = JSON.parse(fs.readFileSync(path.join(ROOT, 'meta', 'standard-registry.json'), 'utf-8'));
const templateRegistry = JSON.parse(fs.readFileSync(path.join(ROOT, 'meta', 'template-registry.json'), 'utf-8'));
const schemaRegistry = JSON.parse(fs.readFileSync(path.join(ROOT, 'meta', 'schema-registry.json'), 'utf-8'));
const utilRegistry = JSON.parse(fs.readFileSync(path.join(ROOT, 'meta', 'util-registry.json'), 'utf-8'));
const exampleRegistry = JSON.parse(fs.readFileSync(path.join(ROOT, 'meta', 'example-registry.json'), 'utf-8'));
const installerRegistry = JSON.parse(fs.readFileSync(path.join(ROOT, 'meta', 'installer-registry.json'), 'utf-8'));
const docsRegistry = JSON.parse(fs.readFileSync(path.join(ROOT, 'meta', 'docs-registry.json'), 'utf-8'));

// Load relationship mapping
const relationshipMapping = JSON.parse(fs.readFileSync(RELATIONSHIP_MAPPING_PATH, 'utf-8'));

// Universal resources that apply to most/all skills
const UNIVERSAL_PLAYBOOKS = ['TASK-MANAGEMENT', 'git-workflows'];
const UNIVERSAL_STANDARDS = ['clean-code', 'COMMIT-CONVENTIONS', 'LOGGING-CONVENTIONS'];
const UNIVERSAL_TEMPLATES = ['env.example', 'gitignore.placeholder'];
const UNIVERSAL_UTILS = ['logger'];
const UNIVERSAL_DOCS = ['getting-started', 'troubleshooting', 'cheat-sheet'];

// Skill-specific mappings (curated high-confidence mappings)
const CURATED_MAPPINGS = {
  'rag-implementer': {
    playbooks: ['testing-new-feature', 'setup-monitoring'],
    standards: ['api-design', 'error-handling', 'typescript'],
    templates: ['cursorrules-ai-rag.md', 'env.example'],
    schemas: ['component.schema'],
    utils: ['errorHandler', 'logger', 'validateEnv'],
    examples: ['simple-rag-pipeline', 'archon-workflow-example'],
    installers: ['create-rag-system'],
    docs: ['getting-started', 'integration-guide', 'api/readme']
  },
  'mvp-builder': {
    playbooks: ['testing-new-feature', 'FEATURE-LIFECYCLE', 'team-onboarding'],
    standards: ['folder-structure', 'clean-code', 'typescript', 'react'],
    templates: ['cursorrules-saas.md', 'package.placeholder.json', 'env.example'],
    schemas: ['component.schema'],
    utils: ['logger', 'validateEnv', 'deploy'],
    examples: ['sample-project-cursorrules'],
    installers: ['bootstrap', 'create-saas'],
    docs: ['quick-start', 'cli-quickstart', 'deployment']
  },
  'frontend-builder': {
    playbooks: ['testing-new-feature', 'optimize-bundle-size'],
    standards: ['component-library', 'react', 'typescript', 'clean-code'],
    templates: ['cursorrules-saas.md', 'next-config.placeholder.js', 'vite-config.placeholder.js', 'eslintrc.js', 'prettierrc.json'],
    schemas: ['component.schema'],
    utils: ['logger', 'errorHandler', 'deploy'],
    examples: ['sample-project-cursorrules'],
    installers: ['create-saas'],
    docs: ['cli-quickstart', 'deployment', 'integration-guide']
  },
  'api-designer': {
    playbooks: ['testing-new-feature', 'debug-production-incident'],
    standards: ['api-design', 'rest-api', 'error-handling', 'ERROR-RESPONSE-FORMAT', 'security-first'],
    templates: ['api-config.json', 'env.example'],
    schemas: [],
    utils: ['errorHandler', 'logger', 'validateEnv', 'schemas'],
    examples: [],
    installers: [],
    docs: ['api/readme', 'security', 'integration-guide']
  },
  'archon-manager': {
    playbooks: ['TASK-MANAGEMENT', 'FEATURE-LIFECYCLE', 'team-onboarding'],
    standards: ['COMMIT-CONVENTIONS', 'clean-code'],
    templates: [],
    schemas: [],
    utils: ['logger'],
    examples: ['archon-workflow-example'],
    installers: [],
    docs: ['archon-integration', 'getting-started']
  },
  'deployment-advisor': {
    playbooks: ['setup-monitoring', 'debug-production-incident', 'INCIDENT-RESPONSE'],
    standards: ['serverless', 'microservices', 'security-first'],
    templates: ['env.example'],
    schemas: [],
    utils: ['deploy', 'logger', 'validateEnv'],
    examples: [],
    installers: [],
    docs: ['deployment', 'ci-cd-setup', 'security']
  },
  'testing-strategist': {
    playbooks: ['testing-new-feature', 'testing-strategy', 'automation-first'],
    standards: ['TEST-NAMING', 'clean-code'],
    templates: ['testing-setup-jest.js', 'testing-setup-vitest.js', 'testing-setup-playwright.js'],
    schemas: [],
    utils: ['test-runner', 'logger'],
    examples: [],
    installers: [],
    docs: ['cli-reference', 'troubleshooting']
  },
  'security-engineer': {
    playbooks: ['debug-production-incident', 'INCIDENT-RESPONSE', 'setup-monitoring'],
    standards: ['security-first', 'error-handling', 'ERROR-RESPONSE-FORMAT'],
    templates: ['env.example'],
    schemas: [],
    utils: ['errorHandler', 'validateEnv', 'logger', 'schemas'],
    examples: [],
    installers: [],
    docs: ['security', 'api/readme', 'troubleshooting']
  },
  'data-engineer': {
    playbooks: ['setup-monitoring', 'debug-production-incident'],
    standards: ['database-design', 'error-handling', 'typescript'],
    templates: ['database-config.json', 'env.example'],
    schemas: [],
    utils: ['db-backup', 'db-migrate', 'logger', 'errorHandler'],
    examples: [],
    installers: [],
    docs: ['integration-guide', 'security']
  },
  'design-system-architect': {
    playbooks: ['team-onboarding', 'FEATURE-LIFECYCLE'],
    standards: ['component-library', 'clean-code', 'react', 'typescript'],
    templates: ['eslintrc.js', 'prettierrc.json', 'tsconfig.json'],
    schemas: ['component.schema'],
    utils: ['logger'],
    examples: [],
    installers: [],
    docs: ['integration-guide', 'system-overview']
  },
  'accessibility-engineer': {
    playbooks: ['testing-new-feature', 'testing-strategy'],
    standards: ['component-library', 'clean-code', 'react'],
    templates: ['eslintrc.js'],
    schemas: ['component.schema'],
    utils: ['logger'],
    examples: [],
    installers: [],
    docs: ['integration-guide', 'troubleshooting']
  }
};

// Keyword-based matching rules
const KEYWORD_RULES = {
  playbooks: {
    'adhd-getting-unstuck': ['adhd', 'focus', 'task-breakdown'],
    'adhd-hyperfocus-session': ['adhd', 'focus'],
    'debug-production-incident': ['debug', 'security', 'data', 'performance'],
    'optimize-bundle-size': ['frontend', 'performance', 'visual', 'animation'],
    'repository-health-check': ['dark-matter', 'quality'],
    'setup-monitoring': ['deployment', 'data', 'security', 'performance'],
    'team-onboarding': ['technical', 'mvp', 'design-system'],
    'testing-new-feature': ['testing', 'quality', 'frontend', 'api'],
    'FEATURE-LIFECYCLE': ['mvp', 'product', 'deployment'],
    'INCIDENT-RESPONSE': ['security', 'deployment', 'forensic'],
    'automation-first': ['deployment', 'testing', 'data'],
    'testing-strategy': ['testing', 'quality', 'accessibility']
  },
  standards: {
    'api-design': ['api', 'backend', 'data'],
    'rest-api': ['api', 'backend'],
    'database-design': ['data', 'backend', 'supabase'],
    'error-handling': ['api', 'backend', 'security', 'data'],
    'security-first': ['security', 'api', 'deployment'],
    'microservices': ['api', 'deployment', 'backend'],
    'serverless': ['deployment', 'api'],
    'component-library': ['frontend', 'design-system', 'accessibility', 'ux', 'visual'],
    'clean-code': [], // universal
    'typescript': ['frontend', 'backend', 'api', 'data'],
    'react': ['frontend', 'design-system', 'mobile'],
    'javascript': ['frontend'],
    'vue': ['frontend']
  },
  templates: {
    'api-config.json': ['api', 'backend'],
    'database-config.json': ['data', 'backend', 'supabase'],
    'cursorrules-ai-rag.md': ['rag', 'knowledge'],
    'cursorrules-saas.md': ['mvp', 'frontend', 'product'],
    'cursorrules-full.md': [], // universal
    'cursorrules-minimal.md': [], // universal
    'eslintrc.js': ['frontend', 'typescript', 'javascript'],
    'prettierrc.json': ['frontend', 'backend'],
    'tsconfig.json': ['typescript', 'frontend', 'backend'],
    'testing-setup-jest.js': ['testing'],
    'testing-setup-vitest.js': ['testing'],
    'testing-setup-playwright.js': ['testing'],
    'next-config.placeholder.js': ['frontend'],
    'vite-config.placeholder.js': ['frontend']
  },
  utils: {
    'errorHandler': ['api', 'backend', 'security', 'data'],
    'logger': [], // universal
    'validateEnv': ['api', 'backend', 'security', 'data', 'deployment'],
    'db-backup': ['data', 'supabase'],
    'db-migrate': ['data', 'supabase'],
    'deploy': ['deployment', 'frontend', 'mobile'],
    'test-runner': ['testing', 'quality'],
    'schemas': ['api', 'security', 'data']
  },
  examples: {
    'archon-workflow-example': ['archon', 'rag', 'knowledge'],
    'simple-rag-pipeline': ['rag', 'knowledge'],
    'sample-project-cursorrules': ['mvp', 'frontend', 'product']
  },
  installers: {
    'bootstrap': ['mvp'],
    'create-rag-system': ['rag', 'knowledge'],
    'create-saas': ['mvp', 'frontend', 'product']
  },
  docs: {
    'archon-integration': ['archon'],
    'getting-started': [], // universal
    'quick-start': [], // universal
    'troubleshooting': [], // universal
    'cheat-sheet': [], // universal
    'api/readme': ['api', 'backend'],
    'integration-guide': ['frontend', 'backend', 'data'],
    'cli-quickstart': ['frontend', 'mvp'],
    'cli-reference': ['testing', 'deployment'],
    'deployment': ['deployment'],
    'ci-cd-setup': ['deployment', 'testing'],
    'security': ['security'],
    'system-overview': ['design-system', 'architecture']
  }
};

/**
 * Check if skill name contains any of the keywords
 */
function skillMatchesKeywords(skillName, keywords) {
  if (!keywords || keywords.length === 0) return true; // universal
  const lowerSkill = skillName.toLowerCase();
  return keywords.some(keyword => lowerSkill.includes(keyword));
}

/**
 * Map Tier 2 resources to a skill
 */
function mapTier2Resources(skillName) {
  // Start with curated mappings if they exist
  if (CURATED_MAPPINGS[skillName]) {
    return CURATED_MAPPINGS[skillName];
  }

  // Otherwise, use keyword matching
  const mapping = {
    playbooks: [...UNIVERSAL_PLAYBOOKS],
    standards: [...UNIVERSAL_STANDARDS],
    templates: [...UNIVERSAL_TEMPLATES],
    schemas: [],
    utils: [...UNIVERSAL_UTILS],
    examples: [],
    installers: [],
    docs: [...UNIVERSAL_DOCS]
  };

  // Match playbooks
  for (const [playbook, keywords] of Object.entries(KEYWORD_RULES.playbooks)) {
    if (skillMatchesKeywords(skillName, keywords) && !mapping.playbooks.includes(playbook)) {
      mapping.playbooks.push(playbook);
    }
  }

  // Match standards
  for (const [standard, keywords] of Object.entries(KEYWORD_RULES.standards)) {
    if (skillMatchesKeywords(skillName, keywords) && !mapping.standards.includes(standard)) {
      mapping.standards.push(standard);
    }
  }

  // Match templates
  for (const [template, keywords] of Object.entries(KEYWORD_RULES.templates)) {
    if (skillMatchesKeywords(skillName, keywords) && !mapping.templates.includes(template)) {
      mapping.templates.push(template);
    }
  }

  // Match utils
  for (const [util, keywords] of Object.entries(KEYWORD_RULES.utils)) {
    if (skillMatchesKeywords(skillName, keywords) && !mapping.utils.includes(util)) {
      mapping.utils.push(util);
    }
  }

  // Match examples
  for (const [example, keywords] of Object.entries(KEYWORD_RULES.examples)) {
    if (skillMatchesKeywords(skillName, keywords) && !mapping.examples.includes(example)) {
      mapping.examples.push(example);
    }
  }

  // Match installers
  for (const [installer, keywords] of Object.entries(KEYWORD_RULES.installers)) {
    if (skillMatchesKeywords(skillName, keywords) && !mapping.installers.includes(installer)) {
      mapping.installers.push(installer);
    }
  }

  // Match docs
  for (const [doc, keywords] of Object.entries(KEYWORD_RULES.docs)) {
    if (skillMatchesKeywords(skillName, keywords) && !mapping.docs.includes(doc)) {
      mapping.docs.push(doc);
    }
  }

  return mapping;
}

/**
 * Main execution
 */
function main() {
  console.log('🔗 Mapping Tier 2 Relationships...\n');

  let updatedCount = 0;

  // Process each skill
  for (const [skillName, skillData] of Object.entries(relationshipMapping.skills)) {
    const tier2 = mapTier2Resources(skillName);

    // Add Tier 2 fields
    skillData.related_playbooks = tier2.playbooks;
    skillData.related_standards = tier2.standards;
    skillData.related_templates = tier2.templates;
    skillData.related_schemas = tier2.schemas;
    skillData.related_utils = tier2.utils;
    skillData.related_examples = tier2.examples;
    skillData.related_installers = tier2.installers;
    skillData.related_docs = tier2.docs;

    updatedCount++;
  }

  // Write updated mapping
  fs.writeFileSync(
    RELATIONSHIP_MAPPING_PATH,
    JSON.stringify(relationshipMapping, null, 2) + '\n'
  );

  console.log(`✅ Updated ${updatedCount} skills with Tier 2 relationships`);
  console.log(`✨ relationship-mapping.json v${relationshipMapping.version} updated!\n`);

  // Print summary
  console.log('📊 Tier 2 Mapping Summary:');
  console.log(`   Curated mappings: ${Object.keys(CURATED_MAPPINGS).length} skills`);
  console.log(`   Keyword-based mappings: ${updatedCount - Object.keys(CURATED_MAPPINGS).length} skills`);
  console.log(`   Total skills mapped: ${updatedCount}\n`);
}

main();
