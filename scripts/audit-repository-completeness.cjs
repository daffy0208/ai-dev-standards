#!/usr/bin/env node

/**
 * Comprehensive Repository Audit
 * Checks EVERY file for visibility, usage, completeness, and relationships
 * Identifies orphaned, unused, or incomplete resources
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

// Color codes
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const MAGENTA = '\x1b[35m';
const CYAN = '\x1b[36m';
const RESET = '\x1b[0m';

// Load all registries
const skillRegistry = JSON.parse(fs.readFileSync(path.join(ROOT, 'meta', 'skill-registry.json'), 'utf-8'));
const mcpRegistry = JSON.parse(fs.readFileSync(path.join(ROOT, 'meta', 'mcp-registry.json'), 'utf-8'));
const componentRegistry = JSON.parse(fs.readFileSync(path.join(ROOT, 'meta', 'component-registry.json'), 'utf-8'));
const integrationRegistry = JSON.parse(fs.readFileSync(path.join(ROOT, 'meta', 'integration-registry.json'), 'utf-8'));
const toolRegistry = JSON.parse(fs.readFileSync(path.join(ROOT, 'meta', 'tool-registry.json'), 'utf-8'));
const playbookRegistry = JSON.parse(fs.readFileSync(path.join(ROOT, 'meta', 'playbook-registry.json'), 'utf-8'));
const standardRegistry = JSON.parse(fs.readFileSync(path.join(ROOT, 'meta', 'standard-registry.json'), 'utf-8'));
const templateRegistry = JSON.parse(fs.readFileSync(path.join(ROOT, 'meta', 'template-registry.json'), 'utf-8'));
const schemaRegistry = JSON.parse(fs.readFileSync(path.join(ROOT, 'meta', 'schema-registry.json'), 'utf-8'));
const utilRegistry = JSON.parse(fs.readFileSync(path.join(ROOT, 'meta', 'util-registry.json'), 'utf-8'));
const exampleRegistry = JSON.parse(fs.readFileSync(path.join(ROOT, 'meta', 'example-registry.json'), 'utf-8'));
const installerRegistry = JSON.parse(fs.readFileSync(path.join(ROOT, 'meta', 'installer-registry.json'), 'utf-8'));
const docsRegistry = JSON.parse(fs.readFileSync(path.join(ROOT, 'meta', 'docs-registry.json'), 'utf-8'));
const relationshipMapping = JSON.parse(fs.readFileSync(path.join(ROOT, 'meta', 'relationship-mapping.json'), 'utf-8'));

// Audit results
const issues = {
  orphanedFiles: [],
  missingMetadata: [],
  noRelationships: [],
  weakTriggers: [],
  unusedResources: [],
  incompleteSkills: [],
  incompleteMCPs: []
};

const stats = {
  totalFiles: 0,
  trackedFiles: 0,
  orphanedFiles: 0,
  skillsWithWeakTriggers: 0,
  resourcesWithNoRelationships: 0
};

// Directories to scan
const SCAN_DIRS = [
  'skills',
  'mcp-servers',
  'components',
  'integrations',
  'tools',
  'playbooks',
  'standards',
  'templates',
  'schemas',
  'utils',
  'examples',
  'installers',
  'docs'
];

// Files to ignore
const IGNORE_PATTERNS = [
  /node_modules/,
  /\.git/,
  /\.archive/,
  /test-output/,
  /_TEMPLATE/,
  /README\.md$/,
  /USAGE\.md$/,
  /EXAMPLES\.md$/,
  /\.placeholder\./
];

/**
 * Check if file should be ignored
 */
function shouldIgnoreFile(filePath) {
  return IGNORE_PATTERNS.some(pattern => pattern.test(filePath));
}

/**
 * Walk directory recursively
 */
function walkDirectory(dir, callback, basePath = '') {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const relativePath = path.join(basePath, entry.name);
    const fullPath = path.join(dir, entry.name);

    if (shouldIgnoreFile(relativePath)) continue;

    if (entry.isDirectory()) {
      walkDirectory(fullPath, callback, relativePath);
    } else if (entry.isFile()) {
      stats.totalFiles++;
      callback(fullPath, relativePath);
    }
  }
}

/**
 * Check if file is tracked in any registry
 */
function isFileTracked(relativePath) {
  const normalizedPath = '/' + relativePath.replace(/\\/g, '/');

  // Check all registries
  const allResources = [
    ...skillRegistry.skills || [],
    ...mcpRegistry.mcps || [],
    ...componentRegistry.components || [],
    ...integrationRegistry.integrations || [],
    ...(toolRegistry.tools || []),
    ...(toolRegistry.scripts || []),
    ...playbookRegistry.playbooks || [],
    ...standardRegistry.standards || [],
    ...templateRegistry.templates || [],
    ...schemaRegistry.schemas || [],
    ...utilRegistry.utilities || [],
    ...exampleRegistry.examples || [],
    ...installerRegistry.installers || [],
    ...docsRegistry.docs || []
  ];

  return allResources.some(resource => {
    const resourcePath = resource.path || resource.location;
    if (!resourcePath) return false;

    const normalizedResourcePath = resourcePath.replace(/\\/g, '/');

    // Check for exact match (file is explicitly listed in registry)
    if (normalizedPath === normalizedResourcePath) {
      return true;
    }

    // Check additional_files array (both relative and absolute paths)
    if (resource.additional_files && Array.isArray(resource.additional_files)) {
      for (const additionalFile of resource.additional_files) {
        // Handle both absolute paths (e.g., "/tools/observability/index.ts")
        // and relative paths (e.g., "index.ts" relative to resource path)
        let normalizedAdditionalPath;

        if (additionalFile.startsWith('/')) {
          // Absolute path
          normalizedAdditionalPath = additionalFile.replace(/\\/g, '/');
        } else {
          // Relative path - resolve relative to resource directory
          const resourceDir = normalizedResourcePath.substring(0, normalizedResourcePath.lastIndexOf('/'));
          normalizedAdditionalPath = resourceDir + '/' + additionalFile.replace(/\\/g, '/');
        }

        if (normalizedPath === normalizedAdditionalPath) {
          return true;
        }
      }
    }

    // Check if file is within a tracked directory
    // File is within directory if it starts with the directory path followed by a slash
    // e.g., "/mcp-servers/3d-asset-manager-mcp/dist/index.d.ts" starts with "/mcp-servers/3d-asset-manager-mcp/"
    const directoryPrefix = normalizedResourcePath.endsWith('/')
      ? normalizedResourcePath
      : normalizedResourcePath + '/';

    return normalizedPath.startsWith(directoryPrefix);
  });
}

/**
 * Audit Skills
 */
function auditSkills() {
  console.log(`\n${CYAN}=== Auditing Skills ===${RESET}\n`);

  for (const skill of skillRegistry.skills) {
    const skillPath = path.join(ROOT, skill.path);

    // Check if skill file exists
    if (!fs.existsSync(skillPath)) {
      issues.missingMetadata.push({
        resource: skill.name,
        type: 'skill',
        issue: 'File not found',
        path: skill.path
      });
      continue;
    }

    // Check trigger coverage
    const triggers = skill.triggers || [];
    if (triggers.length === 0) {
      issues.weakTriggers.push({
        skill: skill.name,
        issue: 'No triggers defined',
        suggestion: 'Add trigger keywords to make skill discoverable'
      });
      stats.skillsWithWeakTriggers++;
    } else if (triggers.length < 3) {
      issues.weakTriggers.push({
        skill: skill.name,
        triggers: triggers.length,
        issue: `Only ${triggers.length} trigger(s) defined`,
        suggestion: 'Add more trigger keywords for better discoverability'
      });
      stats.skillsWithWeakTriggers++;
    }

    // Check relationships
    const relationships = relationshipMapping.skills[skill.name];
    if (!relationships) {
      issues.noRelationships.push({
        resource: skill.name,
        type: 'skill',
        issue: 'Not in relationship-mapping.json'
      });
      stats.resourcesWithNoRelationships++;
    } else {
      // Check if skill has ANY resources
      const hasAnyResources =
        (relationships.required_mcps && relationships.required_mcps.length > 0) ||
        (relationships.required_tools && relationships.required_tools.length > 0) ||
        (relationships.required_components && relationships.required_components.length > 0) ||
        (relationships.required_integrations && relationships.required_integrations.length > 0) ||
        (relationships.related_playbooks && relationships.related_playbooks.length > 0) ||
        (relationships.related_standards && relationships.related_standards.length > 0) ||
        (relationships.related_templates && relationships.related_templates.length > 0) ||
        (relationships.related_utils && relationships.related_utils.length > 0) ||
        (relationships.related_examples && relationships.related_examples.length > 0) ||
        (relationships.related_installers && relationships.related_installers.length > 0) ||
        (relationships.related_docs && relationships.related_docs.length > 0);

      if (!hasAnyResources) {
        issues.incompleteSkills.push({
          skill: skill.name,
          issue: 'No supporting resources mapped',
          suggestion: 'Add MCPs, tools, playbooks, or docs to make skill actionable'
        });
      }
    }
  }

  console.log(`${GREEN}✅ Audited ${skillRegistry.skills.length} skills${RESET}`);
  if (issues.weakTriggers.length > 0) {
    console.log(`${YELLOW}⚠️  ${issues.weakTriggers.length} skills have weak trigger coverage${RESET}`);
  }
  if (issues.incompleteSkills.length > 0) {
    console.log(`${YELLOW}⚠️  ${issues.incompleteSkills.length} skills have no supporting resources${RESET}`);
  }
}

/**
 * Audit MCPs
 */
function auditMCPs() {
  console.log(`\n${CYAN}=== Auditing MCPs ===${RESET}\n`);

  for (const mcp of mcpRegistry.mcps) {
    // Use mcp.id for relationship lookups (e.g., "3d-asset-manager-mcp")
    const mcpId = mcp.id || mcp.name;
    const relationships = relationshipMapping.mcps[mcpId];

    if (!relationships) {
      issues.noRelationships.push({
        resource: mcp.name,
        type: 'mcp',
        issue: 'Not in relationship-mapping.json'
      });
      stats.resourcesWithNoRelationships++;
    } else {
      // Check if MCP has ANY supporting resources
      const hasAnyResources =
        (relationships.required_tools && relationships.required_tools.length > 0) ||
        (relationships.required_components && relationships.required_components.length > 0) ||
        (relationships.required_integrations && relationships.required_integrations.length > 0);

      if (!hasAnyResources) {
        issues.incompleteMCPs.push({
          mcp: mcp.name,
          issue: 'No supporting resources (tools/components/integrations)',
          suggestion: 'Document which tools, components, or integrations this MCP requires'
        });
      }
    }

    // Check if MCP is used by any skill
    // mcpId is already defined at the top of the loop
    const usedBySkills = Object.entries(relationshipMapping.skills || {})
      .filter(([skillName, skillData]) =>
        skillData.required_mcps && skillData.required_mcps.includes(mcpId)
      )
      .map(([skillName]) => skillName);

    if (usedBySkills.length === 0) {
      issues.unusedResources.push({
        resource: mcp.name,
        type: 'mcp',
        issue: 'Not used by any skill',
        suggestion: 'Either map to a skill or mark as standalone utility'
      });
    }
  }

  console.log(`${GREEN}✅ Audited ${mcpRegistry.mcps.length} MCPs${RESET}`);
  if (issues.incompleteMCPs.length > 0) {
    console.log(`${YELLOW}⚠️  ${issues.incompleteMCPs.length} MCPs have incomplete relationships${RESET}`);
  }
  if (issues.unusedResources.filter(r => r.type === 'mcp').length > 0) {
    console.log(`${YELLOW}⚠️  ${issues.unusedResources.filter(r => r.type === 'mcp').length} MCPs not used by any skill${RESET}`);
  }
}

/**
 * Scan for orphaned files
 */
function scanForOrphans() {
  console.log(`\n${CYAN}=== Scanning for Orphaned Files ===${RESET}\n`);

  for (const dir of SCAN_DIRS) {
    const fullPath = path.join(ROOT, dir);
    if (!fs.existsSync(fullPath)) continue;

    walkDirectory(fullPath, (fullFilePath, relativePath) => {
      if (!isFileTracked(relativePath)) {
        stats.orphanedFiles++;
        issues.orphanedFiles.push({
          path: relativePath,
          fullPath: fullFilePath,
          directory: dir,
          issue: 'File not tracked in any registry'
        });
      } else {
        stats.trackedFiles++;
      }
    }, dir);
  }

  console.log(`${GREEN}✅ Scanned ${stats.totalFiles} files${RESET}`);
  console.log(`   Tracked: ${stats.trackedFiles}`);
  if (stats.orphanedFiles > 0) {
    console.log(`${YELLOW}   Orphaned: ${stats.orphanedFiles}${RESET}`);
  }
}

/**
 * Generate audit report
 */
function generateReport() {
  console.log(`\n${MAGENTA}╔════════════════════════════════════════════════════════╗${RESET}`);
  console.log(`${MAGENTA}║         REPOSITORY COMPLETENESS AUDIT REPORT           ║${RESET}`);
  console.log(`${MAGENTA}╚════════════════════════════════════════════════════════╝${RESET}\n`);

  // Summary
  console.log(`${CYAN}📊 Summary:${RESET}`);
  console.log(`   Total files scanned: ${stats.totalFiles}`);
  console.log(`   Tracked files: ${stats.trackedFiles} (${Math.round(stats.trackedFiles / stats.totalFiles * 100)}%)`);
  console.log(`   Orphaned files: ${stats.orphanedFiles} (${Math.round(stats.orphanedFiles / stats.totalFiles * 100)}%)\n`);

  // Critical Issues
  const criticalCount =
    issues.orphanedFiles.length +
    issues.noRelationships.length +
    issues.incompleteSkills.length;

  if (criticalCount > 0) {
    console.log(`${RED}🚨 Critical Issues: ${criticalCount}${RESET}\n`);
  } else {
    console.log(`${GREEN}✅ No critical issues found!${RESET}\n`);
  }

  // Warnings
  const warningCount =
    issues.weakTriggers.length +
    issues.incompleteMCPs.length +
    issues.unusedResources.length;

  if (warningCount > 0) {
    console.log(`${YELLOW}⚠️  Warnings: ${warningCount}${RESET}\n`);
  }

  // Detailed Issues
  if (issues.orphanedFiles.length > 0) {
    console.log(`\n${RED}═══ Orphaned Files (${issues.orphanedFiles.length}) ===${RESET}\n`);
    issues.orphanedFiles.slice(0, 20).forEach(issue => {
      console.log(`${RED}❌${RESET} ${issue.path}`);
      console.log(`   Issue: ${issue.issue}`);
      console.log(`   Action: Add to appropriate registry\n`);
    });
    if (issues.orphanedFiles.length > 20) {
      console.log(`${YELLOW}   ... and ${issues.orphanedFiles.length - 20} more${RESET}\n`);
    }
  }

  if (issues.weakTriggers.length > 0) {
    console.log(`\n${YELLOW}═══ Skills with Weak Triggers (${issues.weakTriggers.length}) ===${RESET}\n`);
    issues.weakTriggers.slice(0, 10).forEach(issue => {
      console.log(`${YELLOW}⚠️${RESET}  ${issue.skill}`);
      console.log(`   Issue: ${issue.issue}`);
      console.log(`   Suggestion: ${issue.suggestion}\n`);
    });
    if (issues.weakTriggers.length > 10) {
      console.log(`${YELLOW}   ... and ${issues.weakTriggers.length - 10} more${RESET}\n`);
    }
  }

  if (issues.incompleteSkills.length > 0) {
    console.log(`\n${YELLOW}═══ Skills with No Resources (${issues.incompleteSkills.length}) ===${RESET}\n`);
    issues.incompleteSkills.slice(0, 10).forEach(issue => {
      console.log(`${YELLOW}⚠️${RESET}  ${issue.skill}`);
      console.log(`   Issue: ${issue.issue}`);
      console.log(`   Suggestion: ${issue.suggestion}\n`);
    });
    if (issues.incompleteSkills.length > 10) {
      console.log(`${YELLOW}   ... and ${issues.incompleteSkills.length - 10} more${RESET}\n`);
    }
  }

  if (issues.unusedResources.length > 0) {
    console.log(`\n${YELLOW}═══ Unused Resources (${issues.unusedResources.length}) ===${RESET}\n`);
    issues.unusedResources.forEach(issue => {
      console.log(`${YELLOW}⚠️${RESET}  ${issue.resource} (${issue.type})`);
      console.log(`   Issue: ${issue.issue}`);
      console.log(`   Suggestion: ${issue.suggestion}\n`);
    });
  }

  // Write detailed report to file
  const reportPath = path.join(ROOT, 'AUDIT-COMPLETENESS-REPORT.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    stats,
    issues
  }, null, 2));

  console.log(`\n${GREEN}📝 Detailed report written to: AUDIT-COMPLETENESS-REPORT.json${RESET}\n`);

  // Exit code
  if (criticalCount > 0) {
    console.log(`${RED}❌ Audit FAILED - ${criticalCount} critical issues found${RESET}\n`);
    process.exit(1);
  } else if (warningCount > 0) {
    console.log(`${YELLOW}⚠️  Audit PASSED with ${warningCount} warnings${RESET}\n`);
    process.exit(0);
  } else {
    console.log(`${GREEN}✅ Audit PASSED - Repository is complete!${RESET}\n`);
    process.exit(0);
  }
}

/**
 * Main execution
 */
function main() {
  console.log(`\n${BLUE}🔍 Starting Comprehensive Repository Audit...${RESET}\n`);

  auditSkills();
  auditMCPs();
  scanForOrphans();
  generateReport();
}

main();
