#!/usr/bin/env node

/**
 * Compare ai-dev-standards with Original Framework Library (00_Framework_Library)
 * Identifies ALL missing skills, resources, and frameworks
 */

const fs = require('fs');
const path = require('path');

const CURRENT_REPO = path.join(__dirname, '..');
const ORIGINAL_FRAMEWORK = '/mnt/c/Users/david/OneDrive - Qolcom/AI/AI_Development_Projects/00_Framework_Library';

// Color codes
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const MAGENTA = '\x1b[35m';
const CYAN = '\x1b[36m';
const RESET = '\x1b[0m';

// Skills that exist in original but not mentioned in STATUS.md
const ORIGINAL_SKILLS_IN_CLAUDE = [
  'api-designer',
  'bmad-method',
  'deployment-advisor',
  'framework-orchestrator',
  'frontend-builder',
  'go-to-market-planner',
  'knowledge-graph-builder',
  'multi-agent-architect',
  'mvp-builder',
  'prp-generator',
  'quality-assurance',
  'rag-implementer',
  'security-architect'
];

// Skills from ZIP files in original framework
const ORIGINAL_SKILLS_AS_ZIPS = [
  'api-integration-builder',
  'customer-feedback-analyzer',
  'customer-support-builder',
  'design-system-architect',
  'growth-experimenter',
  'performance-optimizer',
  'pricing-strategist',
  'product-analyst',
  'product-analytics',
  'product-strategist',
  'release-manager',
  'usability-tester',
  'user-researcher',
  'ux-designer',
  'ux-researcher'
];

// Archived/consolidated skills
const ARCHIVED_SKILLS = [
  'threat-modeling',
  'security-first-design',
  'secure-coding-review',
  'compliance-validator',
  'pattern-identifier',
  'framework-selector',
  'testing-strategist',
  'code-quality-enforcer',
  'validation-gate-checker'
];

// Load current skill registry
const currentSkillRegistry = JSON.parse(
  fs.readFileSync(path.join(CURRENT_REPO, 'meta', 'skill-registry.json'), 'utf-8')
);

const currentSkills = currentSkillRegistry.skills.map(s => s.name);

console.log(`\n${MAGENTA}╔═══════════════════════════════════════════════════════════╗${RESET}`);
console.log(`${MAGENTA}║   FRAMEWORK COMPARISON: Original vs Current Repository   ║${RESET}`);
console.log(`${MAGENTA}╚═══════════════════════════════════════════════════════════╝${RESET}\n`);

// Compare skills
console.log(`${CYAN}📊 SKILLS COMPARISON:${RESET}\n`);

console.log(`${YELLOW}Original Framework (Claude Desktop):${RESET} ${ORIGINAL_SKILLS_IN_CLAUDE.length} skills`);
console.log(`${YELLOW}Original Framework (ZIP files):${RESET} ${ORIGINAL_SKILLS_AS_ZIPS.length} skills`);
console.log(`${YELLOW}Archived (consolidated):${RESET} ${ARCHIVED_SKILLS.length} skills`);
console.log(`${YELLOW}Total Original:${RESET} ${ORIGINAL_SKILLS_IN_CLAUDE.length + ORIGINAL_SKILLS_AS_ZIPS.length + ARCHIVED_SKILLS.length} skills\n`);

console.log(`${GREEN}Current Repository:${RESET} ${currentSkills.length} skills\n`);

// Find missing skills from Claude Desktop
console.log(`${RED}═══ Missing from Current Repo (were in Claude Desktop) ===${RESET}\n`);
const missingFromClaude = ORIGINAL_SKILLS_IN_CLAUDE.filter(skill => !currentSkills.includes(skill));
missingFromClaude.forEach(skill => {
  console.log(`${RED}❌${RESET} ${skill}`);
});
if (missingFromClaude.length === 0) {
  console.log(`${GREEN}✅ All Claude Desktop skills present${RESET}`);
}

// Find missing skills from ZIP files
console.log(`\n${RED}═══ Missing from Current Repo (were in ZIP files) ===${RESET}\n`);
const missingFromZips = ORIGINAL_SKILLS_AS_ZIPS.filter(skill => !currentSkills.includes(skill));
missingFromZips.forEach(skill => {
  console.log(`${RED}❌${RESET} ${skill}`);
});
if (missingFromZips.length === 0) {
  console.log(`${GREEN}✅ All ZIP file skills present${RESET}`);
}

// Check archived skills (these might be intentionally omitted or renamed)
console.log(`\n${YELLOW}═══ Archived/Consolidated Skills (check if renamed) ===${RESET}\n`);
const missingArchived = ARCHIVED_SKILLS.filter(skill => !currentSkills.includes(skill));
missingArchived.forEach(skill => {
  console.log(`${YELLOW}⚠️${RESET}  ${skill} (was consolidated)`);
});

// Find NEW skills in current repo
console.log(`\n${GREEN}═══ NEW Skills (not in original framework) ===${RESET}\n`);
const allOriginalSkills = [
  ...ORIGINAL_SKILLS_IN_CLAUDE,
  ...ORIGINAL_SKILLS_AS_ZIPS,
  ...ARCHIVED_SKILLS
];
const newSkills = currentSkills.filter(skill => !allOriginalSkills.includes(skill));
newSkills.forEach(skill => {
  console.log(`${GREEN}✨${RESET} ${skill}`);
});

// Summary
console.log(`\n${CYAN}╔═══════════════════════════════════════════════════════╗${RESET}`);
console.log(`${CYAN}║                       SUMMARY                         ║${RESET}`);
console.log(`${CYAN}╚═══════════════════════════════════════════════════════╝${RESET}\n`);

console.log(`${RED}Missing from Claude Desktop:${RESET} ${missingFromClaude.length}`);
console.log(`${RED}Missing from ZIP files:${RESET} ${missingFromZips.length}`);
console.log(`${YELLOW}Archived (check if renamed):${RESET} ${missingArchived.length}`);
console.log(`${GREEN}New skills added:${RESET} ${newSkills.length}\n`);

const totalMissing = missingFromClaude.length + missingFromZips.length;
console.log(`${RED}📊 TOTAL MISSING: ${totalMissing} skills${RESET}\n`);

// Key missing skills
console.log(`${MAGENTA}═══ CRITICAL MISSING SKILLS ===${RESET}\n`);
console.log(`${RED}1. bmad-method${RESET} - Business model and architecture (in Claude Desktop)`);
console.log(`${RED}2. framework-orchestrator${RESET} - Project analysis & recommendations`);
console.log(`${RED}3. prp-generator${RESET} - Product Requirements Prompts`);

if (missingFromZips.length > 0) {
  console.log(`${RED}4. ${missingFromZips[0]}${RESET} - Plus ${missingFromZips.length - 1} more from ZIP files`);
}

console.log(`\n${YELLOW}ACTION REQUIRED:${RESET}`);
console.log(`1. Export bmad-method from Claude.ai`);
console.log(`2. Port framework-orchestrator and prp-generator`);
console.log(`3. Review and port missing ZIP file skills\n`);

// Write detailed report
const reportPath = path.join(CURRENT_REPO, 'FRAMEWORK-COMPARISON-REPORT.json');
fs.writeFileSync(reportPath, JSON.stringify({
  timestamp: new Date().toISOString(),
  original: {
    claudeDesktop: ORIGINAL_SKILLS_IN_CLAUDE,
    zipFiles: ORIGINAL_SKILLS_AS_ZIPS,
    archived: ARCHIVED_SKILLS,
    total: ORIGINAL_SKILLS_IN_CLAUDE.length + ORIGINAL_SKILLS_AS_ZIPS.length + ARCHIVED_SKILLS.length
  },
  current: {
    skills: currentSkills,
    total: currentSkills.length
  },
  missing: {
    fromClaude: missingFromClaude,
    fromZips: missingFromZips,
    archived: missingArchived,
    total: totalMissing
  },
  new: newSkills
}, null, 2));

console.log(`${BLUE}📝 Detailed report: FRAMEWORK-COMPARISON-REPORT.json${RESET}\n`);

// Exit code
if (totalMissing > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
