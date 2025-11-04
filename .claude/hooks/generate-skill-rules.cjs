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
  
  // Add category-specific keywords
  const categoryKeywords = {
    'frontend': ['react', 'component', 'ui', 'interface', 'frontend', 'client'],
    'backend': ['api', 'server', 'backend', 'database', 'endpoint'],
    'ai': ['ai', 'ml', 'machine learning', 'rag', 'vector', 'embedding', 'llm'],
    'devops': ['deploy', 'ci', 'cd', 'docker', 'kubernetes', 'infrastructure'],
    'design': ['design', 'ui', 'ux', 'style', 'brand', 'visual'],
    'testing': ['test', 'qa', 'quality', 'validation'],
    'security': ['security', 'auth', 'authentication', 'authorization', 'encryption']
  };
  
  // Add keywords based on skill description
  Object.entries(categoryKeywords).forEach(([category, keywords]) => {
    keywords.forEach(keyword => {
      if (lowerDesc.includes(keyword) && !promptTriggers.includes(keyword)) {
        promptTriggers.push(keyword);
      }
    });
  });
  
  // Determine file path patterns based on skill name and category
  const pathPatterns = [];
  
  // Map skills to likely file paths
  const pathMappings = {
    'api-designer': ['**/api/**/*.{ts,js}', '**/routes/**/*.{ts,js}', '**/controllers/**/*.{ts,js}'],
    'frontend-builder': ['**/components/**/*.{tsx,jsx}', '**/pages/**/*.{tsx,jsx}', '**/app/**/*.{tsx,jsx}'],
    'rag-implementer': ['**/rag/**/*', '**/vector/**/*', '**/search/**/*', '**/embeddings/**/*'],
    'security-engineer': ['**/auth/**/*', '**/security/**/*', '**/middleware/**/*'],
    'database-architect': ['**/models/**/*', '**/schema/**/*', '**/migrations/**/*'],
    'deployment-advisor': ['**/deploy/**/*', '**/infrastructure/**/*', '.github/workflows/**/*', 'Dockerfile', 'docker-compose.yml'],
    'performance-optimizer': ['**/optimization/**/*', '**/cache/**/*', '**/performance/**/*'],
    'testing-strategist': ['**/*.test.{ts,js,tsx,jsx}', '**/*.spec.{ts,js,tsx,jsx}', '**/tests/**/*'],
    'mvp-builder': ['**/features/**/*', '**/product/**/*'],
    'documentation-writer': ['**/*.md', '**/docs/**/*'],
    'error-tracker': ['**/error/**/*', '**/logging/**/*', '**/monitoring/**/*']
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
