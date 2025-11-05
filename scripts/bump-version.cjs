#!/usr/bin/env node
/**
 * Unified Version Management Script
 *
 * Updates version consistently across:
 * - package.json
 * - README.md (header and Versioning section)
 * - CHANGELOG.md (creates new section)
 *
 * Usage:
 *   npm run version:patch   # 1.0.0 -> 1.0.1
 *   npm run version:minor   # 1.0.0 -> 1.1.0
 *   npm run version:major   # 1.0.0 -> 2.0.0
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');

// Parse arguments
const bumpType = process.argv[2]; // 'major', 'minor', or 'patch'
const changeDescription = process.argv[3]; // Optional description

if (!['major', 'minor', 'patch'].includes(bumpType)) {
  console.error('❌ Usage: node bump-version.cjs <major|minor|patch> [description]');
  console.error('   npm run version:major "Phase 3 Complete - Design System"');
  process.exit(1);
}

console.log(`🔄 Bumping ${bumpType} version...\n`);

// 1. Read current version from package.json (source of truth)
const packagePath = path.join(ROOT, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
const currentVersion = packageJson.version;

// 2. Calculate new version
const [major, minor, patch] = currentVersion.split('.').map(Number);
let newVersion;

switch (bumpType) {
  case 'major':
    newVersion = `${major + 1}.0.0`;
    break;
  case 'minor':
    newVersion = `${major}.${minor + 1}.0`;
    break;
  case 'patch':
    newVersion = `${major}.${minor}.${patch + 1}`;
    break;
}

console.log(`📦 Version: ${currentVersion} → ${newVersion}\n`);

// 3. Get current date
const date = new Date().toISOString().split('T')[0];

// 4. Update package.json
packageJson.version = newVersion;
fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n');
console.log('✅ Updated package.json');

// 5. Update README.md (header)
const readmePath = path.join(ROOT, 'README.md');
let readme = fs.readFileSync(readmePath, 'utf-8');

// Update header version
readme = readme.replace(
  /\*\*Version \d+\.\d+\.\d+\*\*/,
  `**Version ${newVersion}**`
);

// Update "Last Updated" date in header
readme = readme.replace(
  /\*\*Last Updated:\*\* \d{4}-\d{2}-\d{2}/,
  `**Last Updated:** ${date}`
);

// Update "Current Version" in Versioning section
readme = readme.replace(
  /\*\*Current Version:\*\* \d+\.\d+\.\d+/,
  `**Current Version:** ${newVersion}`
);

// Update version history section (add new entry at top)
const versionHistoryMarker = '**Version History:**';
const historyIndex = readme.indexOf(versionHistoryMarker);
if (historyIndex !== -1) {
  const insertPoint = readme.indexOf('\n', historyIndex) + 1;
  const newEntry = `- **${newVersion}** (${date}): ${changeDescription || 'Version bump'}\n`;
  readme = readme.slice(0, insertPoint) + newEntry + readme.slice(insertPoint);
}

fs.writeFileSync(readmePath, readme);
console.log('✅ Updated README.md (header + versioning section)');

// 6. Update CHANGELOG.md
const changelogPath = path.join(ROOT, 'CHANGELOG.md');
let changelog = fs.readFileSync(changelogPath, 'utf-8');

// Find the insertion point (after the header, before first version)
const headerEnd = changelog.indexOf('---\n\n## ');
if (headerEnd !== -1) {
  const insertPoint = headerEnd + 6; // After "---\n\n"

  const newSection = `## [${newVersion}] - ${date}

### ${changeDescription || 'Changes'}

- Version bump to ${newVersion}
- ${changeDescription || 'See git log for details'}

---

`;

  changelog = changelog.slice(0, insertPoint) + newSection + changelog.slice(insertPoint);
  fs.writeFileSync(changelogPath, changelog);
  console.log('✅ Updated CHANGELOG.md');
} else {
  console.warn('⚠️  Could not find insertion point in CHANGELOG.md');
}

// 7. Git operations
console.log('\n📝 Git status:');
try {
  const status = execSync('git status --short', { encoding: 'utf-8' });
  console.log(status);

  console.log('\n✨ Version bump complete!');
  console.log(`\nNext steps:`);
  console.log(`  git add package.json README.md CHANGELOG.md`);
  console.log(`  git commit -m "chore: Bump version to ${newVersion}"`);
  console.log(`  git tag v${newVersion}`);
  console.log(`  git push origin main --tags`);
} catch (error) {
  console.log('Run git commands manually');
}
