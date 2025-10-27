#!/usr/bin/env node
// Fix relationship-mapping.json to add backward-compatible "relationships" section

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const relationshipsPath = path.join(ROOT, 'META', 'relationship-mapping.json');

console.log('🔧 Adding backward-compatible relationships section...\n');

// Read current relationship-mapping.json
const data = JSON.parse(fs.readFileSync(relationshipsPath, 'utf-8'));

// Generate relationships.skills_to_mcps from skills section
const skillsToMcps = {};
for (const [skillName, skillData] of Object.entries(data.skills)) {
  skillsToMcps[skillName] = skillData.required_mcps || [];
}

// Add or update relationships section
if (!data.relationships) {
  data.relationships = {};
}
data.relationships.skills_to_mcps = skillsToMcps;

// Write back to file
fs.writeFileSync(relationshipsPath, JSON.stringify(data, null, 2) + '\n');

console.log(`✅ Added relationships.skills_to_mcps with ${Object.keys(skillsToMcps).length} skills`);
console.log('   This provides backward compatibility for validation scripts\n');
