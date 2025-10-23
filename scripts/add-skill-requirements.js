import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const registryPath = path.join(__dirname, '..', 'META', 'registry.json');

// Skill requirements mapping
const skillRequirements = {
  'mvp-builder': {
    mcps: { existing: [], planned: ['feature-prioritizer', 'risk-analyzer', 'mvp-tracker'] },
    components: ['agents', 'workflows'],
    integrations: [],
    standards: []
  },
  'product-strategist': {
    mcps: { existing: [], planned: ['interview-transcriber', 'user-insight-analyzer'] },
    components: [],
    integrations: [],
    standards: []
  },
  'api-designer': {
    mcps: { existing: [], planned: ['openapi-generator', 'api-validator'] },
    components: ['mcp-servers'],
    integrations: ['llm-providers'],
    standards: ['microservices-pattern', 'serverless-pattern']
  },
  'deployment-advisor': {
    mcps: { existing: [], planned: ['infra-provisioner', 'monitoring-setup'] },
    components: [],
    integrations: ['platforms'],
    standards: ['serverless-pattern']
  },
  'performance-optimizer': {
    mcps: { existing: [], planned: ['performance-profiler', 'bundle-analyzer', 'lighthouse-runner'] },
    components: [],
    integrations: [],
    standards: ['database-design-patterns']
  },
  'security-engineer': {
    mcps: { existing: [], planned: ['vulnerability-scanner', 'dependency-auditor', 'secrets-detector'] },
    components: [],
    integrations: ['platforms'],
    standards: ['authentication-patterns']
  },
  'frontend-builder': {
    mcps: { existing: ['component-generator'], planned: [] },
    components: ['ui-components', 'forms'],
    integrations: [],
    standards: []
  },
  'quality-auditor': {
    mcps: { existing: ['screenshot-testing'], planned: [] },
    components: ['ui-components'],
    integrations: [],
    standards: []
  },
  'multi-agent-architect': {
    mcps: { existing: [], planned: ['agent-orchestrator', 'agent-monitor', 'conversation-manager'] },
    components: ['agents', 'workflows'],
    integrations: ['llm-providers'],
    standards: ['event-driven-architecture']
  },
  'knowledge-graph-builder': {
    mcps: { existing: [], planned: ['neo4j', 'graph-visualizer', 'ontology-builder'] },
    components: [],
    integrations: [],
    standards: []
  },
  'data-engineer': {
    mcps: { existing: [], planned: ['etl-pipeline-builder', 'data-quality-checker', 'schema-migrator'] },
    components: [],
    integrations: ['platforms'],
    standards: ['database-design-patterns']
  },
  'user-researcher': {
    mcps: { existing: [], planned: ['interview-scheduler', 'feedback-aggregator', 'persona-generator'] },
    components: [],
    integrations: [],
    standards: []
  },
  'go-to-market-planner': {
    mcps: { existing: [], planned: ['market-analyzer', 'competitor-tracker', 'launch-checklist'] },
    components: [],
    integrations: [],
    standards: []
  },
  'ux-designer': {
    mcps: { existing: [], planned: ['wireframe-generator', 'design-system-checker', 'user-flow-visualizer'] },
    components: ['ui-components'],
    integrations: [],
    standards: []
  },
  'design-system-architect': {
    mcps: { existing: ['component-generator'], planned: ['component-cataloger', 'design-token-manager'] },
    components: ['ui-components'],
    integrations: [],
    standards: []
  },
  'technical-writer': {
    mcps: { existing: [], planned: ['doc-generator', 'diagram-generator', 'changelog-generator'] },
    components: [],
    integrations: [],
    standards: []
  }
};

// Read registry
const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));

// Add requires to skills that don't have it yet
let updated = 0;
for (const skill of registry.skills) {
  if (skillRequirements[skill.name] && !skill.requires) {
    skill.requires = skillRequirements[skill.name];
    updated++;
    console.log(`✅ Added requires to: ${skill.name}`);
  }
}

// Update timestamp
registry.lastUpdated = new Date().toISOString();

// Write back
fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2));

console.log(`\n✅ Updated ${updated} skills with requirements`);
console.log(`📝 Total skills with requires: ${registry.skills.filter(s => s.requires).length}/36`);
