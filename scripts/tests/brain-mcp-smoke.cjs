#!/usr/bin/env node

/**
 * Brain MCP smoke test
 *
 * Verifies that the compiled Brain CLI can execute the `status` command using
 * Node.js. This ensures the Brain MCP server has been built and is runnable
 * in CI environments.
 */

const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..', '..');
const brainCliPath = path.join(repoRoot, 'scripts', 'brain');
const brainDistPath = path.join(brainCliPath, 'dist', 'brain.js');

if (!fs.existsSync(brainDistPath)) {
  console.error(`❌ Brain CLI build missing at ${brainDistPath}`);
  console.error('   Run `npm run build` from scripts/brain before executing this smoke test.');
  process.exit(1);
}

const env = {
  ...process.env,
  AI_DEV_STANDARDS_ROOT: repoRoot,
};

console.log('🔍 Running brain CLI status check via Node.js');
try {
  execFileSync('node', [brainDistPath, 'status'], {
    stdio: 'inherit',
    cwd: brainCliPath,
    env,
  });
  console.log('✅ Brain MCP smoke test succeeded');
} catch (error) {
  console.error(`❌ Brain MCP smoke test failed: ${error.message}`);
  process.exit(1);
}
