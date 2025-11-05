#!/usr/bin/env node

/**
 * Generate skill-rules.json from META/skill-registry.json
 * This creates trigger patterns for all 64 skills to enable auto-activation
 */

const fs = require('fs');
const path = require('path');

// Read the skill registry
const registryPath = path.join(__dirname, '../../META/skill-registry.json');
const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));

// Create skill rules object
const skillRules = {};

registry.skills.forEach(skill => {
  const skillName = skill.name;
  
  // Extract trigger words from triggers and description
  const promptTriggers = [];
  
  // Add explicit triggers
  if (skill.triggers && Array.isArray(skill.triggers)) {
    promptTriggers.push(...skill.triggers);
  }
  
  // Add skill name variations
  const nameWords = skillName.split('-');
  if (nameWords.length > 1) {
    promptTriggers.push(nameWords.join(' '));
  }
  
  // Extract key terms from description
  const description = skill.description || '';
  const lowerDesc = description.toLowerCase();
  
  // Add category-specific keywords (more specific, less generic)
  const categoryKeywords = {
    'frontend': ['react', 'vue', 'angular', 'component', 'jsx', 'tsx', 'frontend', 'client-side'],
    'backend': ['api', 'server', 'backend', 'database', 'endpoint', 'rest', 'graphql'],
    'ai': ['ai', 'ml', 'machine learning', 'RAG', 'retrieval augmented generation', 'vector', 'embedding', 'llm', 'semantic search'],
    'devops': ['deploy', 'deployment', 'ci/cd', 'docker', 'kubernetes', 'infrastructure', 'aws', 'azure'],
    'design': ['design system', 'branding', 'visual identity', 'typography', 'color palette'],
    'testing': ['unit test', 'integration test', 'e2e', 'test coverage', 'qa', 'jest', 'vitest', 'playwright', 'cypress'],
    'security': ['security', 'authentication', 'authorization', 'jwt', 'oauth', 'encryption', 'owasp', 'vulnerability'],
    'accessibility': ['accessibility', 'a11y', 'wcag', 'screen reader', 'keyboard navigation', 'aria', 'contrast ratio']
  };
  
  // Add skill-specific optimized keywords (from AUTO-ACTIVATION-OPTIMIZATION-GUIDE.md)
  const skillSpecificKeywords = {
    'accessibility-engineer': ['accessibility', 'a11y', 'wcag', 'screen reader', 'keyboard navigation', 'aria', 'contrast ratio'],
    'rag-implementer': ['RAG', 'retrieval augmented generation', 'semantic search', 'vector database', 'document retrieval', 'knowledge base', 'embedding'],
    'security-engineer': ['authentication', 'authorization', 'jwt', 'oauth', 'encryption', 'owasp', 'vulnerability', 'security audit'],
    'testing-strategist': ['test', 'testing', 'qa', 'quality assurance', 'unit test', 'integration test', 'e2e', 'jest', 'vitest', 'playwright', 'cypress'],
    'api-designer': ['api', 'rest', 'graphql', 'endpoint', 'swagger', 'openapi'],
    'frontend-builder': ['react', 'component', 'frontend', 'ui', 'interface', 'state management'],
    'database-architect': ['database', 'sql', 'nosql', 'schema', 'migration', 'orm', 'prisma', 'sequelize']
  };
  
  // Add skill-specific keywords first
  if (skillSpecificKeywords[skillName]) {
    promptTriggers.push(...skillSpecificKeywords[skillName]);
  }
  
  // Add keywords based on skill description (only if not too generic)
  Object.entries(categoryKeywords).forEach(([category, keywords]) => {
    keywords.forEach(keyword => {
      // Skip overly generic single words like 'ui', 'design', 'code'
      const genericWords = ['ui', 'design', 'code'];
      if (genericWords.includes(keyword.toLowerCase())) {
        return;
      }
      if (lowerDesc.includes(keyword) && !promptTriggers.includes(keyword)) {
        promptTriggers.push(keyword);
      }
    });
  });
  
  // Determine file path patterns based on skill name and category
  const pathPatterns = [];
  
  // Map skills to likely file paths (optimized based on AUTO-ACTIVATION-OPTIMIZATION-GUIDE.md)
  const pathMappings = {
    'api-designer': ['**/api/**/*.{ts,js}', '**/routes/**/*.{ts,js}', '**/controllers/**/*.{ts,js}', '**/endpoints/**/*'],
    'frontend-builder': ['**/components/**/*.{tsx,jsx}', '**/pages/**/*.{tsx,jsx}', '**/app/**/*.{tsx,jsx}', '**/src/**/*.{tsx,jsx}'],
    'rag-implementer': ['**/rag/**/*', '**/vector/**/*', '**/search/**/*', '**/embeddings/**/*', '**/retrieval/**/*'],
    'security-engineer': ['**/auth/**/*', '**/security/**/*', '**/middleware/**/*', '**/guards/**/*', '**/permissions/**/*', '**/.env*'],
    'database-architect': ['**/models/**/*', '**/schema/**/*', '**/migrations/**/*', '**/database/**/*', '**/prisma/**/*'],
    'deployment-advisor': ['**/deploy/**/*', '**/infrastructure/**/*', '.github/workflows/**/*', 'Dockerfile', 'docker-compose.yml', '**/k8s/**/*', '**/terraform/**/*'],
    'performance-optimizer': ['**/optimization/**/*', '**/cache/**/*', '**/performance/**/*', '**/webpack.config.*', '**/vite.config.*'],
    'testing-strategist': ['**/*.test.{ts,js,tsx,jsx}', '**/*.spec.{ts,js,tsx,jsx}', '**/tests/**/*', '**/__tests__/**/*', '**/e2e/**/*', '**/jest.config.*', '**/vitest.config.*', '**/playwright.config.*', '**/cypress.config.*'],
    'mvp-builder': ['**/features/**/*', '**/product/**/*'],
    'documentation-writer': ['**/*.md', '**/docs/**/*', '**/README*'],
    'error-tracker': ['**/error/**/*', '**/logging/**/*', '**/monitoring/**/*', '**/sentry/**/*'],
    'accessibility-engineer': ['**/components/**/*.{tsx,jsx}', '**/a11y/**/*', '**/*.accessibility.test.*', '**/ui/**/*']
  };
  
  // Add skill-specific path patterns
  if (pathMappings[skillName]) {
    pathPatterns.push(...pathMappings[skillName]);
  }
  
  // Add generic path pattern based on skill name
  const skillPath = skill.path.replace('/SKILLS/', '').replace('/', '');
  pathPatterns.push(`**/${skillPath}/**/*`);
  
  // Add MCP-related patterns for MCP skills
  if (skillName.includes('mcp') || lowerDesc.includes('mcp')) {
    pathPatterns.push('**/MCP-SERVERS/**/*');
  }
  
  // Create the rule
  skillRules[skillName] = {
    promptTriggers: [...new Set(promptTriggers)].filter(t => t && t.trim()),
    fileTriggers: {
      pathPatterns: [...new Set(pathPatterns)]
    }
  };
});

// Write the skill-rules.json file
const outputPath = path.join(__dirname, '../skills/skill-rules.json');
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(skillRules, null, 2));

console.log(`✅ Generated skill-rules.json with ${Object.keys(skillRules).length} skills`);
console.log(`📄 Output: ${outputPath}`);
