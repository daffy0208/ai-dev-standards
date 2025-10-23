#!/usr/bin/env node

/**
 * COMPLETE FILE UPDATE SCRIPT
 *
 * Updates EVERY file in the repository that should auto-update
 * Derived from SINGLE SOURCE OF TRUTH: SKILLS/ and MCP-SERVERS/ folders
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SKILLS_DIR = path.join(ROOT, 'SKILLS');
const MCP_DIR = path.join(ROOT, 'MCP-SERVERS');

const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RED = '\x1b[31m';
const RESET = '\x1b[0m';

// Get actual counts
const skillFolders = fs.readdirSync(SKILLS_DIR)
  .filter(f => f !== '_TEMPLATE' && fs.statSync(path.join(SKILLS_DIR, f)).isDirectory());

const mcpFolders = fs.readdirSync(MCP_DIR)
  .filter(f => fs.statSync(path.join(MCP_DIR, f)).isDirectory());

const skillCount = skillFolders.length;
const mcpCount = mcpFolders.length;
const ratio = (skillCount / mcpCount).toFixed(1);
const percentage = Math.round((mcpCount / skillCount) * 100);
const gapCount = skillCount - mcpCount;

console.log(`\n${GREEN}🔄 COMPLETE FILE UPDATE - All Files${RESET}\n`);
console.log(`${YELLOW}Source of Truth:${RESET}`);
console.log(`  Skills: ${skillCount}`);
console.log(`  MCPs: ${mcpCount}`);
console.log(`  Ratio: ${ratio}:1`);
console.log(`  Coverage: ${percentage}%`);
console.log(`  Gap: ${gapCount} more MCPs needed\n`);

let updateCount = 0;
let errors = [];

function safeUpdate(filePath, updateFn, description) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`${YELLOW}⊘${RESET} ${description} (file not found)`);
      return;
    }
    updateFn(filePath);
    console.log(`${GREEN}✅${RESET} ${description}`);
    updateCount++;
  } catch (error) {
    console.error(`${RED}❌${RESET} ${description}: ${error.message}`);
    errors.push({ file: description, error: error.message });
  }
}

// ROOT FILES
safeUpdate(path.join(ROOT, 'README.md'), (file) => {
  let content = fs.readFileSync(file, 'utf-8');
  content = content.replace(/(\d+)\s+Specialized Skills/g, `${skillCount} Specialized Skills`);
  content = content.replace(/(\d+)\s+MCP Tools/g, `${mcpCount} MCP Tools`);
  content = content.replace(/MCP Development Status:\*\*\s*\d+\/\d+\s+tools built \(\d+%\)/g,
    `MCP Development Status:** ${mcpCount}/${skillCount} tools built (${percentage}%)`);
  fs.writeFileSync(file, content);
}, 'README.md');

safeUpdate(path.join(ROOT, 'BUILD_FOCUS.md'), (file) => {
  let content = fs.readFileSync(file, 'utf-8');
  content = content.replace(/Current:\s*\d+\s+skills/g, `Current: ${skillCount} skills`);
  content = content.replace(/Tools available:\s*\d+\s+MCPs/g, `Tools available: ${mcpCount} MCPs`);
  content = content.replace(/Ratio:\s*[\d.]+:1/g, `Ratio: ${ratio}:1`);
  content = content.replace(/\*\*Current Ratio:\*\*\s*\d+\s+skills\s*:\s*\d+\s+MCPs\s*\([\d.]+:1\)/g,
    `**Current Ratio:** ${skillCount} skills : ${mcpCount} MCPs (${ratio}:1)`);
  content = content.replace(/\*\*Current:\*\*\s*\d+\/\d+\s+\(\d+%\)/g,
    `**Current:** ${mcpCount}/${skillCount} (${percentage}%)`);
  fs.writeFileSync(file, content);
}, 'BUILD_FOCUS.md');

safeUpdate(path.join(ROOT, '.cursorrules'), (file) => {
  let content = fs.readFileSync(file, 'utf-8');
  content = content.replace(/\*\*SKILLS\/\*\*\s*-\s*\d+\s+specialized skills/g,
    `**SKILLS/** - ${skillCount} specialized skills`);
  content = content.replace(/\*\*MCP-SERVERS\/\*\*\s*-\s*\d+\s+MCP server implementations/g,
    `**MCP-SERVERS/** - ${mcpCount} MCP server implementations`);
  content = content.replace(/\*\*Ratio:\*\*\s*[\d.]+:1/g, `**Ratio:** ${ratio}:1`);
  content = content.replace(/\*\*Available skills \(\d+\):\*\*/g, `**Available skills (${skillCount}):**`);
  fs.writeFileSync(file, content);
}, '.cursorrules');

safeUpdate(path.join(ROOT, 'CHANGELOG.md'), (file) => {
  let content = fs.readFileSync(file, 'utf-8');
  content = content.replace(/- \*\*\d+\s+Specialized Skills\*\* - Complete skill library/g,
    `- **${skillCount} Specialized Skills** - Complete skill library`);
  content = content.replace(/- \*\*\d+\s+MCP Servers\*\*\s*-/g, `- **${mcpCount} MCP Servers** -`);
  fs.writeFileSync(file, content);
}, 'CHANGELOG.md');

// DOCS/ FILES
safeUpdate(path.join(ROOT, 'DOCS', 'INDEX.md'), (file) => {
  let content = fs.readFileSync(file, 'utf-8');
  content = content.replace(/explore\s+\d+\s+specialized/g, `explore ${skillCount} specialized`);
  content = content.replace(/\*Skills:\s*\d+\s*\|\s*MCPs:\s*\d+\s*\|\s*Skill-to-Tool Ratio:\s*[\d.]+:1\*/g,
    `*Skills: ${skillCount} | MCPs: ${mcpCount} | Skill-to-Tool Ratio: ${ratio}:1*`);
  fs.writeFileSync(file, content);
}, 'DOCS/INDEX.md');

safeUpdate(path.join(ROOT, 'DOCS', 'MCP-DEVELOPMENT-ROADMAP.md'), (file) => {
  let content = fs.readFileSync(file, 'utf-8');
  content = content.replace(/\*\*Current:\*\*\s*\d+\s+skills,\s*\d+\s+MCPs\s*\([\d.]+:1 ratio - \d+% actionable\)/g,
    `**Current:** ${skillCount} skills, ${mcpCount} MCPs (${ratio}:1 ratio - ${percentage}% actionable)`);
  content = content.replace(/\*\*Target:\*\*\s*\d+\s+skills,/g, `**Target:** ${skillCount} skills,`);
  fs.writeFileSync(file, content);
}, 'DOCS/MCP-DEVELOPMENT-ROADMAP.md');

safeUpdate(path.join(ROOT, 'DOCS', 'RESOURCE-GUIDE.md'), (file) => {
  let content = fs.readFileSync(file, 'utf-8');
  // Update gap count
  content = content.replace(/\d+\s+more MCPs needed to match skill count/g,
    `${gapCount} more MCPs needed to match skill count`);
  // Update skill/MCP references
  content = content.replace(/\d+\/\d+\s+skills declare what they require/g,
    `${skillCount}/${skillCount} skills declare what they require`);
  content = content.replace(/\*\*Current:\*\*\s*\d+\/\d+\s+skills have `requires` field/g,
    `**Current:** ${skillCount}/${skillCount} skills have \`requires\` field`);
  fs.writeFileSync(file, content);
}, 'DOCS/RESOURCE-GUIDE.md');

// .claude/claude.md - Auto-generate from skill-registry.json
safeUpdate(path.join(ROOT, '.claude', 'claude.md'), (file) => {
  const registryPath = path.join(ROOT, 'META', 'skill-registry.json');
  const registry = JSON.parse(fs.readFileSync(registryPath, 'utf-8'));

  let content = '# Claude Configuration\n\n## Skills\n\n';
  registry.skills.forEach(skill => {
    content += `\n### ${skill.name}\n\n`;
    content += `${skill.description}\n\n`;
    content += `**Location:** \`${skill.path}SKILL.md\`\n`;
  });

  fs.writeFileSync(file, content);
}, '.claude/claude.md');

// SUMMARY
console.log(`\n${GREEN}=== UPDATE COMPLETE ===${RESET}\n`);
console.log(`${GREEN}✅ Updated: ${updateCount} files${RESET}`);

if (errors.length > 0) {
  console.log(`${RED}❌ Errors: ${errors.length}${RESET}`);
  errors.forEach(err => {
    console.log(`  ${err.file}: ${err.error}`);
  });
  process.exit(1);
}

console.log(`\n${YELLOW}Next step: Run validation${RESET}`);
console.log(`  npm run validate\n`);
