import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const registryPath = path.join(__dirname, '..', 'META', 'registry.json');

// Component dependencies mapping
const componentDependencies = {
  'rag-pipelines': {
    integrations: ['vector-databases', 'llm-providers'],
    utils: ['api'],
    components: []
  },
  'ui-components': {
    integrations: [],
    utils: [],
    components: []
  },
  'agents': {
    integrations: ['llm-providers'],
    utils: ['api', 'cli'],
    components: []
  },
  'workflows': {
    integrations: [],
    utils: ['cli'],
    components: ['agents']
  },
  'forms': {
    integrations: [],
    utils: ['validation'],
    components: ['ui-components']
  },
  'mcp-servers': {
    integrations: [],
    utils: ['api'],
    components: []
  },
  'auth': {
    integrations: [],
    utils: ['api'],
    components: ['forms']
  },
  'errors': {
    integrations: [],
    utils: [],
    components: []
  },
  'feedback': {
    integrations: [],
    utils: [],
    components: ['ui-components']
  }
};

// Read registry
const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));

// Add dependencies to components
let updated = 0;
for (const component of registry.components) {
  const deps = componentDependencies[component.category];
  if (deps && !component.dependencies) {
    component.dependencies = deps;
    updated++;
    console.log(`✅ Added dependencies to: ${component.category}`);
  }
}

// Update timestamp
registry.lastUpdated = new Date().toISOString();

// Write back
fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2));

console.log(`\n✅ Updated ${updated} components with dependencies`);
console.log(`📝 Total components with dependencies: ${registry.components.filter(c => c.dependencies).length}/9`);
