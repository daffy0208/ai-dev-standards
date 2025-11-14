#!/usr/bin/env node

/**
 * Analyze Migration Candidates
 *
 * Finds the best MCPs to migrate to Code Execution pattern based on:
 * - Complexity score (prefer 7-10)
 * - Tool count (prefer 5+)
 * - Token usage (prefer 10K+)
 * - Category analysis
 * - Feature richness
 *
 * Usage: node scripts/analyze-migration-candidates.cjs
 */

const fs = require('fs-extra');
const path = require('path');

// Load registries
const mcpRegistry = require('../META/mcp-registry.json');
const skillRegistry = require('../META/skill-registry.json');

console.log('═'.repeat(70));
console.log('  MCP MIGRATION CANDIDATE ANALYSIS');
console.log('═'.repeat(70));
console.log('');

// Calculate migration score for each MCP
function calculateMigrationScore(mcp) {
  const metadata = mcp.migration_metadata || {};

  const complexity = metadata.complexity_score || 0;
  const tools = metadata.estimated_tools_count || 0;
  const tokens = metadata.estimated_token_usage || 0;

  // Weighted scoring:
  // - Complexity: 40% weight (prefer 7-10)
  // - Tools: 30% weight (prefer 5+)
  // - Tokens: 30% weight (prefer 10K+)

  const complexityScore = complexity * 0.4;
  const toolsScore = Math.min(tools / 5, 2) * 0.3 * 10; // Normalize to 0-3
  const tokensScore = Math.min(tokens / 10000, 2) * 0.3 * 10; // Normalize to 0-3

  return complexityScore + toolsScore + tokensScore;
}

// Analyze all MCPs
const analyzedMcps = mcpRegistry.mcps.map(mcp => {
  const score = calculateMigrationScore(mcp);
  const metadata = mcp.migration_metadata || {};

  return {
    id: mcp.id,
    name: mcp.name,
    category: mcp.category,
    complexity: metadata.complexity_score || 0,
    tools: metadata.estimated_tools_count || 0,
    tokens: metadata.estimated_token_usage || 0,
    expected_savings: metadata.expected_token_savings_percent || 0,
    has_pii: mcp.security_config?.requires_pii_tokenization || false,
    features: mcp.features || [],
    capabilities: mcp.capabilities?.length || 0,
    migration_score: score,
    current_tier: metadata.migration_tier || null,
    current_priority: metadata.migration_priority || 'not-evaluated'
  };
}).sort((a, b) => b.migration_score - a.migration_score);

// Statistics
console.log('📊 Overall Statistics:');
console.log(`   Total MCPs: ${analyzedMcps.length}`);
console.log(`   Average Complexity: ${(analyzedMcps.reduce((sum, m) => sum + m.complexity, 0) / analyzedMcps.length).toFixed(1)}/10`);
console.log(`   Average Tools: ${(analyzedMcps.reduce((sum, m) => sum + m.tools, 0) / analyzedMcps.length).toFixed(1)}`);
console.log(`   Average Tokens: ${Math.round(analyzedMcps.reduce((sum, m) => sum + m.tokens, 0) / analyzedMcps.length)}`);
console.log('');

// Current Tier 1 Analysis
console.log('🎯 Current Tier 1 Candidates:');
const currentTier1 = analyzedMcps.filter(m => m.current_tier === 1);
currentTier1.forEach((mcp, i) => {
  console.log(`   ${i + 1}. ${mcp.id}`);
  console.log(`      Score: ${mcp.migration_score.toFixed(2)} | Complexity: ${mcp.complexity}/10 | Tools: ${mcp.tools} | Tokens: ${mcp.tokens}`);
});
console.log('');
console.log(`   ⚠️  Issue: All have complexity ${currentTier1[0]?.complexity}/10 (low)`);
console.log('');

// Top 10 by Migration Score
console.log('🏆 TOP 10 MIGRATION CANDIDATES (By Score):');
console.log('');
analyzedMcps.slice(0, 10).forEach((mcp, i) => {
  const emoji = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;
  console.log(`${emoji} ${mcp.id}`);
  console.log(`   Migration Score: ${mcp.migration_score.toFixed(2)}/10`);
  console.log(`   Complexity: ${mcp.complexity}/10`);
  console.log(`   Tools: ${mcp.tools} tools`);
  console.log(`   Token Usage: ${mcp.tokens.toLocaleString()} tokens`);
  console.log(`   Expected Savings: ${mcp.expected_savings}%`);
  console.log(`   Category: ${mcp.category}`);
  console.log(`   Features: ${mcp.features.join(', ')}`);
  console.log(`   Capabilities: ${mcp.capabilities}`);
  if (mcp.has_pii) console.log(`   ⚠️  Requires PII Tokenization`);
  console.log('');
});

// High Complexity MCPs (7-10)
console.log('💪 HIGH COMPLEXITY MCPs (Score ≥ 7):');
const highComplexity = analyzedMcps.filter(m => m.complexity >= 7);
if (highComplexity.length === 0) {
  console.log('   ⚠️  No MCPs found with complexity ≥ 7');
  console.log('   📝 Note: All MCPs have complexity ≤ 6');
  console.log('');
} else {
  highComplexity.forEach(mcp => {
    console.log(`   - ${mcp.id} (${mcp.complexity}/10, ${mcp.tools} tools, ${mcp.tokens} tokens)`);
  });
  console.log('');
}

// High Tool Count MCPs (5+)
console.log('🛠️  HIGH TOOL COUNT MCPs (≥ 5 tools):');
const highTools = analyzedMcps.filter(m => m.tools >= 5);
if (highTools.length === 0) {
  console.log('   ⚠️  No MCPs found with ≥ 5 tools');
  console.log('   📝 Note: All MCPs have ≤ 4 tools');
  console.log('');
} else {
  highTools.forEach(mcp => {
    console.log(`   - ${mcp.id} (${mcp.tools} tools, complexity ${mcp.complexity}/10)`);
  });
  console.log('');
}

// High Token Usage MCPs (10K+)
console.log('🔥 HIGH TOKEN USAGE MCPs (≥ 10,000 tokens):');
const highTokens = analyzedMcps.filter(m => m.tokens >= 10000);
if (highTokens.length === 0) {
  console.log('   ⚠️  No MCPs found with ≥ 10,000 tokens');
  console.log('   📝 Note: All MCPs have < 10K tokens estimated');
  console.log('');
} else {
  highTokens.forEach(mcp => {
    console.log(`   - ${mcp.id} (${mcp.tokens.toLocaleString()} tokens, complexity ${mcp.complexity}/10)`);
  });
  console.log('');
}

// Category Analysis
console.log('📂 CATEGORY BREAKDOWN:');
const categoryStats = {};
analyzedMcps.forEach(mcp => {
  if (!categoryStats[mcp.category]) {
    categoryStats[mcp.category] = { count: 0, avgComplexity: 0, avgTools: 0 };
  }
  categoryStats[mcp.category].count++;
  categoryStats[mcp.category].avgComplexity += mcp.complexity;
  categoryStats[mcp.category].avgTools += mcp.tools;
});

Object.entries(categoryStats)
  .sort((a, b) => b[1].count - a[1].count)
  .forEach(([cat, stats]) => {
    const avgComplexity = (stats.avgComplexity / stats.count).toFixed(1);
    const avgTools = (stats.avgTools / stats.count).toFixed(1);
    console.log(`   ${cat}: ${stats.count} MCPs (avg complexity: ${avgComplexity}, avg tools: ${avgTools})`);
  });
console.log('');

// Revised Tier Recommendations
console.log('═'.repeat(70));
console.log('  REVISED TIER RECOMMENDATIONS');
console.log('═'.repeat(70));
console.log('');

console.log('🎯 PROPOSED NEW TIER 1 (Top 5 by Score):');
const proposedTier1 = analyzedMcps.slice(0, 5);
proposedTier1.forEach((mcp, i) => {
  console.log(`${i + 1}. ${mcp.id}`);
  console.log(`   Score: ${mcp.migration_score.toFixed(2)}/10`);
  console.log(`   Why: Complexity ${mcp.complexity}/10, ${mcp.tools} tools, ${mcp.tokens.toLocaleString()} tokens`);
  console.log(`   Expected Savings: ${mcp.expected_savings}%`);
  console.log(`   ${mcp.has_pii ? '⚠️  Requires PII tokenization' : '✅ No PII concerns'}`);
  console.log('');
});

console.log('🥈 PROPOSED TIER 2 (Next 5):');
const proposedTier2 = analyzedMcps.slice(5, 10);
proposedTier2.forEach((mcp, i) => {
  console.log(`${i + 1}. ${mcp.id} (score: ${mcp.migration_score.toFixed(2)})`);
});
console.log('');

// Comparison with Current Tier 1
console.log('📊 COMPARISON: Current vs Proposed Tier 1');
console.log('');
console.log('Current Tier 1 Average:');
console.log(`   Score: ${(currentTier1.reduce((s, m) => s + m.migration_score, 0) / currentTier1.length).toFixed(2)}`);
console.log(`   Complexity: ${(currentTier1.reduce((s, m) => s + m.complexity, 0) / currentTier1.length).toFixed(1)}/10`);
console.log(`   Tools: ${(currentTier1.reduce((s, m) => s + m.tools, 0) / currentTier1.length).toFixed(1)}`);
console.log(`   Tokens: ${Math.round(currentTier1.reduce((s, m) => s + m.tokens, 0) / currentTier1.length).toLocaleString()}`);
console.log('');
console.log('Proposed Tier 1 Average:');
console.log(`   Score: ${(proposedTier1.reduce((s, m) => s + m.migration_score, 0) / proposedTier1.length).toFixed(2)}`);
console.log(`   Complexity: ${(proposedTier1.reduce((s, m) => s + m.complexity, 0) / proposedTier1.length).toFixed(1)}/10`);
console.log(`   Tools: ${(proposedTier1.reduce((s, m) => s + m.tools, 0) / proposedTier1.length).toFixed(1)}`);
console.log(`   Tokens: ${Math.round(proposedTier1.reduce((s, m) => s + m.tokens, 0) / proposedTier1.length).toLocaleString()}`);
console.log('');

const improvementScore = ((proposedTier1.reduce((s, m) => s + m.migration_score, 0) / proposedTier1.length) /
                          (currentTier1.reduce((s, m) => s + m.migration_score, 0) / currentTier1.length) - 1) * 100;
console.log(`Improvement: ${improvementScore > 0 ? '+' : ''}${improvementScore.toFixed(1)}% better migration score`);
console.log('');

// Pilot Recommendation
console.log('═'.repeat(70));
console.log('  PILOT RECOMMENDATION');
console.log('═'.repeat(70));
console.log('');

const pilot = proposedTier1[0];
console.log(`🎯 RECOMMENDED PILOT: ${pilot.id}`);
console.log('');
console.log(`Why ${pilot.id}?`);
console.log(`   ✅ Highest migration score (${pilot.migration_score.toFixed(2)}/10)`);
console.log(`   ✅ Complexity: ${pilot.complexity}/10`);
console.log(`   ✅ Tools: ${pilot.tools}`);
console.log(`   ✅ Token usage: ${pilot.tokens.toLocaleString()}`);
console.log(`   ✅ Expected savings: ${pilot.expected_savings}%`);
console.log(`   ${pilot.has_pii ? '⚠️  Note: Requires PII tokenization setup' : '✅ No PII concerns - easier pilot'}`);
console.log('');

// Key Findings
console.log('═'.repeat(70));
console.log('  KEY FINDINGS');
console.log('═'.repeat(70));
console.log('');

console.log('🔍 Analysis Results:');
console.log('');

if (highComplexity.length === 0) {
  console.log('   ⚠️  FINDING 1: No high-complexity MCPs (≥7) found');
  console.log('      All MCPs are relatively simple');
  console.log('      Expected token savings may be limited');
  console.log('');
}

if (highTools.length === 0) {
  console.log('   ⚠️  FINDING 2: No high-tool-count MCPs (≥5) found');
  console.log('      All MCPs have few tools (≤4)');
  console.log('      Code Execution benefits may be modest');
  console.log('');
}

if (highTokens.length === 0) {
  console.log('   ⚠️  FINDING 3: No high-token MCPs (≥10K) found');
  console.log('      All MCPs have modest token usage (<10K)');
  console.log('      Absolute token savings will be small');
  console.log('');
}

console.log('   💡 IMPLICATION:');
console.log('      The estimated complexity scores may be underestimating actual complexity');
console.log('      OR your MCPs are genuinely simple (which is good!)');
console.log('');
console.log('   📝 RECOMMENDATION:');
console.log('      1. Proceed with proposed Tier 1 (better than current)');
console.log('      2. Collect real usage data for 2 weeks to validate');
console.log('      3. Re-calculate complexity based on actual tool usage patterns');
console.log('      4. Consider if Code Execution pattern is worth the investment');
console.log('');

// Export results
const results = {
  timestamp: new Date().toISOString(),
  total_mcps: analyzedMcps.length,
  current_tier_1: currentTier1.map(m => m.id),
  proposed_tier_1: proposedTier1.map(m => m.id),
  proposed_tier_2: proposedTier2.map(m => m.id),
  pilot_recommendation: pilot.id,
  top_10: analyzedMcps.slice(0, 10).map(m => ({
    id: m.id,
    score: m.migration_score,
    complexity: m.complexity,
    tools: m.tools,
    tokens: m.tokens
  })),
  findings: {
    high_complexity_count: highComplexity.length,
    high_tools_count: highTools.length,
    high_tokens_count: highTokens.length,
    improvement_percentage: improvementScore
  }
};

fs.writeFileSync(
  path.join(__dirname, '../META/migration-analysis-results.json'),
  JSON.stringify(results, null, 2)
);

console.log('═'.repeat(70));
console.log('✅ Analysis complete!');
console.log('📝 Results saved to: META/migration-analysis-results.json');
console.log('═'.repeat(70));
