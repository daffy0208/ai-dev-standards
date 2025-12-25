#!/usr/bin/env node

/**
 * Manual MCP Analysis
 *
 * Analyzes actual MCP implementation files to calculate REAL complexity scores
 * based on actual code, not estimates.
 *
 * Usage: node scripts/manual-mcp-analysis.cjs [mcp-id]
 */

const fs = require('fs-extra');
const path = require('path');

const MCP_SERVERS_DIR = path.join(__dirname, '../MCP-SERVERS');

// Analyze actual MCP implementation
async function analyzeActualMCP(mcpId) {
  const mcpPath = path.join(MCP_SERVERS_DIR, mcpId);

  if (!await fs.pathExists(mcpPath)) {
    console.log(`❌ MCP not found: ${mcpId}`);
    return null;
  }

  console.log(`\n🔍 Analyzing: ${mcpId}`);
  console.log('─'.repeat(60));

  const analysis = {
    id: mcpId,
    exists: true,
    files: [],
    actual_complexity: 0,
    actual_tools: 0,
    actual_loc: 0,
    has_tests: false,
    has_docs: false
  };

  // Check for main files
  const indexPath = path.join(mcpPath, 'index.js');
  const pkgPath = path.join(mcpPath, 'package.json');
  const readmePath = path.join(mcpPath, 'README.md');

  if (await fs.pathExists(indexPath)) {
    const content = await fs.readFile(indexPath, 'utf-8');
    analysis.files.push('index.js');
    analysis.actual_loc = content.split('\n').length;

    // Count tools by looking for tool definitions
    const toolMatches = content.match(/name:\s*['"][\w-]+_\w+['"]/g) || [];
    analysis.actual_tools = toolMatches.length;

    // Estimate complexity from code patterns
    const hasAsync = /async\s+function|await\s+/.test(content);
    const hasErrorHandling = /try\s*{|catch\s*\(/.test(content);
    const hasResources = /ListResourcesRequestSchema/.test(content);
    const hasPrompts = /ListPromptsRequestSchema/.test(content);
    const complexity =
      (hasAsync ? 1 : 0) +
      (hasErrorHandling ? 1 : 0) +
      (hasResources ? 1 : 0) +
      (hasPrompts ? 1 : 0) +
      Math.min(Math.floor(analysis.actual_tools / 2), 3) +
      Math.min(Math.floor(analysis.actual_loc / 100), 3);

    analysis.actual_complexity = Math.min(complexity, 10);
  }

  if (await fs.pathExists(pkgPath)) {
    analysis.files.push('package.json');
    const pkg = await fs.readJSON(pkgPath);
    const depCount = Object.keys(pkg.dependencies || {}).length;
    analysis.actual_complexity += Math.min(Math.floor(depCount / 3), 2);
  }

  if (await fs.pathExists(readmePath)) {
    analysis.files.push('README.md');
    analysis.has_docs = true;
  }

  // Check for tests
  const testsDir = path.join(mcpPath, 'tests');
  if (await fs.pathExists(testsDir)) {
    analysis.has_tests = true;
  }

  analysis.actual_complexity = Math.min(analysis.actual_complexity, 10);

  console.log(`   Files: ${analysis.files.join(', ')}`);
  console.log(`   Lines of Code: ${analysis.actual_loc}`);
  console.log(`   Actual Tools Found: ${analysis.actual_tools}`);
  console.log(`   Calculated Complexity: ${analysis.actual_complexity}/10`);
  console.log(`   Has Tests: ${analysis.has_tests ? '✅' : '❌'}`);
  console.log(`   Has Docs: ${analysis.has_docs ? '✅' : '❌'}`);

  return analysis;
}

// Main
async function main() {
  const targetMcp = process.argv[2];

  console.log('═'.repeat(60));
  console.log('  MANUAL MCP ANALYSIS');
  console.log('═'.repeat(60));

  if (targetMcp) {
    // Analyze specific MCP
    await analyzeActualMCP(targetMcp);
  } else {
    // Analyze all MCPs
    const registry = require('../meta/mcp-registry.json');
    const currentTier1 = [
      'semantic-search-mcp',
      'market-analyzer-mcp',
      'user-insight-analyzer-mcp',
      'deployment-orchestrator-mcp',
      'agent-orchestrator-mcp'
    ];

    console.log('\n📊 Analyzing Current Tier 1 Candidates...\n');

    const analyses = [];
    for (const mcpId of currentTier1) {
      const analysis = await analyzeActualMCP(mcpId);
      if (analysis) analyses.push(analysis);
    }

    console.log('\n═'.repeat(60));
    console.log('  SUMMARY');
    console.log('═'.repeat(60));
    console.log('');

    analyses.sort((a, b) => b.actual_complexity - a.actual_complexity);

    console.log('🏆 Ranked by Actual Complexity:\n');
    analyses.forEach((a, i) => {
      console.log(`${i + 1}. ${a.id}`);
      console.log(`   Complexity: ${a.actual_complexity}/10`);
      console.log(`   Tools: ${a.actual_tools}`);
      console.log(`   LOC: ${a.actual_loc}`);
      console.log('');
    });

    // Compare with estimated
    const avgActual = analyses.reduce((s, a) => s + a.actual_complexity, 0) / analyses.length;
    const avgEstimated = 3.0; // All were estimated at 3

    console.log(`Average Estimated Complexity: ${avgEstimated}/10`);
    console.log(`Average Actual Complexity: ${avgActual.toFixed(1)}/10`);
    console.log(`Difference: ${(avgActual - avgEstimated > 0 ? '+' : '')}${(avgActual - avgEstimated).toFixed(1)}`);
    console.log('');

    if (Math.abs(avgActual - avgEstimated) > 1) {
      console.log('⚠️  Significant difference between estimated and actual complexity!');
      console.log('📝 Recommendation: Use actual complexity for migration decisions');
    } else {
      console.log('✅ Estimates are close to actual - current Tier 1 is reasonable');
    }

    // Save results
    await fs.writeJSON(
      path.join(__dirname, '../meta/actual-mcp-analysis.json'),
      { timestamp: new Date().toISOString(), analyses },
      { spaces: 2 }
    );

    console.log('\n✅ Results saved to: meta/actual-mcp-analysis.json');
  }

  console.log('\n═'.repeat(60));
}

main().catch(console.error);
