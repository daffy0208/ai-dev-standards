#!/usr/bin/env node

/**
 * COMPREHENSIVE REPOSITORY AUDIT
 *
 * Scans EVERY file in the repository for:
 * - Skill count references
 * - MCP count references
 * - Ratio references
 * - Hardcoded numbers that should be dynamic
 *
 * Outputs complete list of files that need automation
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';

// Get actual counts
function getActualCounts() {
  const skillFolders = fs.readdirSync(path.join(ROOT, 'SKILLS'))
    .filter(f => f !== '_TEMPLATE' && fs.statSync(path.join(ROOT, 'SKILLS', f)).isDirectory());

  const mcpFolders = fs.readdirSync(path.join(ROOT, 'MCP-SERVERS'))
    .filter(f => fs.statSync(path.join(ROOT, 'MCP-SERVERS', f)).isDirectory());

  return {
    skills: skillFolders.length,
    mcps: mcpFolders.length,
    ratio: (skillFolders.length / mcpFolders.length).toFixed(1)
  };
}

// Patterns to search for
const PATTERNS = [
  // Explicit skill counts
  { regex: /\b(\d+)\s+(skills?)\b/gi, type: 'skill_count', description: 'Skill count reference' },
  { regex: /\b(\d+)\s+specialized skills?\b/gi, type: 'skill_count', description: 'Specialized skills count' },
  { regex: /skills?:\s*(\d+)/gi, type: 'skill_count', description: 'Skills: N format' },

  // Explicit MCP counts
  { regex: /\b(\d+)\s+MCPs?\b/gi, type: 'mcp_count', description: 'MCP count reference' },
  { regex: /\b(\d+)\s+MCP\s+(servers?|tools?)\b/gi, type: 'mcp_count', description: 'MCP servers/tools count' },
  { regex: /MCPs?:\s*(\d+)/gi, type: 'mcp_count', description: 'MCPs: N format' },

  // Ratios
  { regex: /ratio:\s*([\d.]+):1/gi, type: 'ratio', description: 'Ratio reference' },
  { regex: /\b([\d.]+):1\s+ratio/gi, type: 'ratio', description: 'Ratio format' },

  // Coverage percentages
  { regex: /\b(\d+)%\s+(coverage|actionable|built)/gi, type: 'percentage', description: 'Coverage percentage' },

  // Registry references
  { regex: /skill-registry\.json/gi, type: 'registry_ref', description: 'Skill registry reference' },
  { regex: /registry\.json/gi, type: 'registry_ref', description: 'Main registry reference' },
  { regex: /relationship-mapping\.json/gi, type: 'registry_ref', description: 'Relationship mapping reference' }
];

const results = {
  files_with_counts: [],
  files_with_ratios: [],
  files_with_percentages: [],
  files_with_registry_refs: [],
  clean_files: [],
  errors: []
};

function scanFile(filePath, relativePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const matches = [];

    PATTERNS.forEach(pattern => {
      const regex = new RegExp(pattern.regex.source, pattern.regex.flags);
      let match;
      while ((match = regex.exec(content)) !== null) {
        // Get line number
        const lines = content.substring(0, match.index).split('\n');
        const lineNum = lines.length;
        const lineContent = content.split('\n')[lineNum - 1].trim();

        matches.push({
          type: pattern.type,
          description: pattern.description,
          line: lineNum,
          content: lineContent.substring(0, 100), // First 100 chars
          matched: match[0]
        });
      }
    });

    if (matches.length > 0) {
      const fileInfo = {
        path: relativePath,
        matches: matches
      };

      // Categorize
      const types = [...new Set(matches.map(m => m.type))];
      if (types.includes('skill_count') || types.includes('mcp_count')) {
        results.files_with_counts.push(fileInfo);
      }
      if (types.includes('ratio')) {
        results.files_with_ratios.push(fileInfo);
      }
      if (types.includes('percentage')) {
        results.files_with_percentages.push(fileInfo);
      }
      if (types.includes('registry_ref')) {
        results.files_with_registry_refs.push(fileInfo);
      }
    } else {
      results.clean_files.push(relativePath);
    }
  } catch (error) {
    results.errors.push({ file: relativePath, error: error.message });
  }
}

function walkDirectory(dir, baseDir) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const relativePath = path.relative(ROOT, fullPath);

    // Skip
    if (file === 'node_modules' || file === '.git' || file === 'dist' || file.startsWith('.')) return;
    if (file === 'package-lock.json') return;

    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      walkDirectory(fullPath, baseDir);
    } else if (stat.isFile()) {
      // Only scan text files
      if (file.match(/\.(md|json|js|cjs|ts)$/)) {
        scanFile(fullPath, relativePath);
      }
    }
  });
}

console.log(`\n${BLUE}🔍 COMPREHENSIVE REPOSITORY AUDIT${RESET}\n`);

const actual = getActualCounts();
console.log(`${YELLOW}Current Counts:${RESET}`);
console.log(`  Skills: ${actual.skills}`);
console.log(`  MCPs: ${actual.mcps}`);
console.log(`  Ratio: ${actual.ratio}:1\n`);

console.log(`${YELLOW}Scanning all files...${RESET}\n`);

// Walk entire repository
walkDirectory(ROOT, ROOT);

// Output results
console.log(`\n${BLUE}=== AUDIT RESULTS ===${RESET}\n`);

console.log(`${YELLOW}📊 Files with Skill/MCP Counts (${results.files_with_counts.length}):${RESET}`);
results.files_with_counts.forEach(file => {
  console.log(`\n  ${GREEN}${file.path}${RESET}`);
  file.matches.filter(m => m.type === 'skill_count' || m.type === 'mcp_count').forEach(match => {
    console.log(`    Line ${match.line}: ${match.description}`);
    console.log(`      "${match.content}"`);
  });
});

console.log(`\n${YELLOW}📈 Files with Ratios (${results.files_with_ratios.length}):${RESET}`);
results.files_with_ratios.forEach(file => {
  console.log(`\n  ${GREEN}${file.path}${RESET}`);
  file.matches.filter(m => m.type === 'ratio').forEach(match => {
    console.log(`    Line ${match.line}: ${match.matched}`);
  });
});

console.log(`\n${YELLOW}💯 Files with Percentages (${results.files_with_percentages.length}):${RESET}`);
results.files_with_percentages.forEach(file => {
  console.log(`  ${file.path}`);
});

console.log(`\n${YELLOW}📝 Files with Registry References (${results.files_with_registry_refs.length}):${RESET}`);
results.files_with_registry_refs.slice(0, 10).forEach(file => {
  console.log(`  ${file.path}`);
});
if (results.files_with_registry_refs.length > 10) {
  console.log(`  ... and ${results.files_with_registry_refs.length - 10} more`);
}

if (results.errors.length > 0) {
  console.log(`\n${RED}❌ Errors (${results.errors.length}):${RESET}`);
  results.errors.forEach(err => {
    console.log(`  ${err.file}: ${err.error}`);
  });
}

console.log(`\n${BLUE}=== SUMMARY ===${RESET}\n`);
console.log(`  Files with counts: ${results.files_with_counts.length}`);
console.log(`  Files with ratios: ${results.files_with_ratios.length}`);
console.log(`  Files with percentages: ${results.files_with_percentages.length}`);
console.log(`  Files with registry refs: ${results.files_with_registry_refs.length}`);
console.log(`  Clean files: ${results.clean_files.length}`);
console.log(`  Errors: ${results.errors.length}\n`);

// Write detailed report
const reportPath = path.join(ROOT, 'COMPREHENSIVE-AUDIT-REPORT.json');
fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
console.log(`${GREEN}✅ Detailed report written to: COMPREHENSIVE-AUDIT-REPORT.json${RESET}\n`);
