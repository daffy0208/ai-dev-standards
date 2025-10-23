#!/usr/bin/env node

/**
 * Update All Files - Master Orchestrator
 *
 * This script is the SINGLE SOURCE OF TRUTH updater
 * It scans SKILLS/ and MCP-SERVERS/ folders and updates ALL related files
 *
 * Usage: node scripts/update-all-files.cjs
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SKILLS_DIR = path.join(ROOT, 'SKILLS');
const MCP_DIR = path.join(ROOT, 'MCP-SERVERS');

const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';

console.log(`\n${GREEN}🔄 Updating All Files from Source of Truth${RESET}\n`);

// Get actual counts
const skillFolders = fs.readdirSync(SKILLS_DIR)
  .filter(f => f !== '_TEMPLATE' && fs.statSync(path.join(SKILLS_DIR, f)).isDirectory());

const mcpFolders = fs.readdirSync(MCP_DIR)
  .filter(f => fs.statSync(path.join(MCP_DIR, f)).isDirectory());

const skillCount = skillFolders.length;
const mcpCount = mcpFolders.length;
const ratio = (skillCount / mcpCount).toFixed(1);
const percentage = Math.round((mcpCount / skillCount) * 100);

console.log(`${YELLOW}Source of Truth:${RESET}`);
console.log(`  Skills: ${skillCount}`);
console.log(`  MCPs: ${mcpCount}`);
console.log(`  Ratio: ${ratio}:1`);
console.log(`  Coverage: ${percentage}%\n`);

// Update README.md
function updateREADME() {
  const readmePath = path.join(ROOT, 'README.md');
  let content = fs.readFileSync(readmePath, 'utf-8');

  // Update skill count
  content = content.replace(/(\d+)\s+Specialized Skills/, `${skillCount} Specialized Skills`);

  // Update MCP count
  content = content.replace(/(\d+)\s+MCP Tools/, `${mcpCount} MCP Tools`);

  // Update MCP Development Status
  content = content.replace(
    /MCP Development Status:\*\*\s*\d+\/\d+\s+tools built \(\d+%\)/,
    `MCP Development Status:** ${mcpCount}/${skillCount} tools built (${percentage}%)`
  );

  fs.writeFileSync(readmePath, content);
  console.log(`${GREEN}✅${RESET} Updated README.md`);
}

// Update BUILD_FOCUS.md
function updateBUILDFOCUS() {
  const focusPath = path.join(ROOT, 'BUILD_FOCUS.md');
  let content = fs.readFileSync(focusPath, 'utf-8');

  // Update current skill count
  content = content.replace(/Current:\s*\d+\s+skills/, `Current: ${skillCount} skills`);

  // Update tools available
  content = content.replace(/Tools available:\s*\d+\s+MCPs/, `Tools available: ${mcpCount} MCPs`);

  // Update ratio
  content = content.replace(/Ratio:\s*[\d.]+:1/, `Ratio: ${ratio}:1`);

  // Update current ratio line
  content = content.replace(
    /\*\*Current Ratio:\*\*\s*\d+\s+skills\s*:\s*\d+\s+MCPs\s*\([\d.]+:1\)/,
    `**Current Ratio:** ${skillCount} skills : ${mcpCount} MCPs (${ratio}:1)`
  );

  // Update MCP Progress
  content = content.replace(
    /\*\*Current:\*\*\s*\d+\/\d+\s+\(\d+%\)/,
    `**Current:** ${mcpCount}/${skillCount} (${percentage}%)`
  );

  fs.writeFileSync(focusPath, content);
  console.log(`${GREEN}✅${RESET} Updated BUILD_FOCUS.md`);
}

// Update DOCS/INDEX.md
function updateDOCSINDEX() {
  const indexPath = path.join(ROOT, 'DOCS', 'INDEX.md');
  let content = fs.readFileSync(indexPath, 'utf-8');

  // Update skill count
  content = content.replace(/explore\s+\d+\s+specialized/, `explore ${skillCount} specialized`);

  // Update bottom stats
  content = content.replace(
    /\*Skills:\s*\d+\s*\|\s*MCPs:\s*\d+\s*\|\s*Skill-to-Tool Ratio:\s*[\d.]+:1\*/,
    `*Skills: ${skillCount} | MCPs: ${mcpCount} | Skill-to-Tool Ratio: ${ratio}:1*`
  );

  fs.writeFileSync(indexPath, content);
  console.log(`${GREEN}✅${RESET} Updated DOCS/INDEX.md`);
}

// Update DOCS/MCP-DEVELOPMENT-ROADMAP.md
function updateMCPROADMAP() {
  const roadmapPath = path.join(ROOT, 'DOCS', 'MCP-DEVELOPMENT-ROADMAP.md');
  let content = fs.readFileSync(roadmapPath, 'utf-8');

  // Update current line
  content = content.replace(
    /\*\*Current:\*\*\s*\d+\s+skills,\s*\d+\s+MCPs\s*\([\d.]+:1 ratio - \d+% actionable\)/,
    `**Current:** ${skillCount} skills, ${mcpCount} MCPs (${ratio}:1 ratio - ${percentage}% actionable)`
  );

  // Update target line
  content = content.replace(
    /\*\*Target:\*\*\s*\d+\s+skills,/,
    `**Target:** ${skillCount} skills,`
  );

  fs.writeFileSync(roadmapPath, content);
  console.log(`${GREEN}✅${RESET} Updated DOCS/MCP-DEVELOPMENT-ROADMAP.md`);
}

// Update .cursorrules
function updateCURSORRULES() {
  const cursorrules = path.join(ROOT, '.cursorrules');
  let content = fs.readFileSync(cursorrules, 'utf-8');

  // Update skill count
  content = content.replace(
    /\*\*SKILLS\/\*\*\s*-\s*\d+\s+specialized skills/,
    `**SKILLS/** - ${skillCount} specialized skills`
  );

  // Update MCP count
  content = content.replace(
    /\*\*MCP-SERVERS\/\*\*\s*-\s*\d+\s+MCP server implementations/,
    `**MCP-SERVERS/** - ${mcpCount} MCP server implementations`
  );

  // Update ratio
  content = content.replace(
    /\*\*Ratio:\*\*\s*[\d.]+:1/,
    `**Ratio:** ${ratio}:1`
  );

  // Update skills count in "Available skills"
  content = content.replace(
    /\*\*Available skills \(\d+\):\*\*/,
    `**Available skills (${skillCount}):**`
  );

  fs.writeFileSync(cursorrules, content);
  console.log(`${GREEN}✅${RESET} Updated .cursorrules`);
}

// Update CHANGELOG.md
function updateCHANGELOG() {
  const changelog = path.join(ROOT, 'CHANGELOG.md');
  let content = fs.readFileSync(changelog, 'utf-8');

  // Update skill count in "Core Repository" section
  content = content.replace(
    /- \*\*\d+\s+Specialized Skills\*\* - Complete skill library/,
    `- **${skillCount} Specialized Skills** - Complete skill library`
  );

  // Update MCP count
  content = content.replace(
    /- \*\*\d+\s+MCP Servers\*\*\s*-/,
    `- **${mcpCount} MCP Servers** -`
  );

  fs.writeFileSync(changelog, content);
  console.log(`${GREEN}✅${RESET} Updated CHANGELOG.md`);
}

// Update .claude/claude.md
function updateClaudeMd() {
  const claudePath = path.join(ROOT, '.claude', 'claude.md');
  const registryPath = path.join(ROOT, 'META', 'skill-registry.json');

  // Read skill registry
  const registry = JSON.parse(fs.readFileSync(registryPath, 'utf-8'));

  // Generate content
  let content = '# Claude Configuration\n\n## Skills\n\n';

  registry.skills.forEach(skill => {
    content += `\n### ${skill.name}\n\n`;
    content += `${skill.description}\n\n`;
    content += `**Location:** \`${skill.path}SKILL.md\`\n`;
  });

  fs.writeFileSync(claudePath, content);
  console.log(`${GREEN}✅${RESET} Updated .claude/claude.md (${registry.skills.length} skills)`);
}

// Run all updates
try {
  updateREADME();
  updateBUILDFOCUS();
  updateDOCSINDEX();
  updateMCPROADMAP();
  updateCURSORRULES();
  updateCHANGELOG();
  updateClaudeMd();

  console.log(`\n${GREEN}✅ All files updated successfully!${RESET}`);
  console.log(`\n${YELLOW}Next step: Run validation${RESET}`);
  console.log(`  npm run validate\n`);

} catch (error) {
  console.error(`\n${RED}❌ Error updating files:${RESET}`, error.message);
  process.exit(1);
}
