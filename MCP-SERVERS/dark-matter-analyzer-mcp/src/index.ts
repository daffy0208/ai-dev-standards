#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { promises as fs } from 'fs';
import { join, relative } from 'path';

/**
 * Dark Matter Analyzer MCP Server
 *
 * Provides tools for repository coherence analysis:
 * - scan_repository: Analyze repository patterns and health
 * - calculate_rci: Calculate Repository Coherence Index
 * - detect_patterns: Identify organizational patterns
 * - generate_report: Create comprehensive Dark Matter report
 *
 * Reveals what is unseen, unsaid, and unmeasured in repositories.
 */

interface ScanConfig {
  path: string;
  depth?: 'quick' | 'medium' | 'deep';
  include_patterns?: string[];
  exclude_patterns?: string[];
}

interface Pattern {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  signal: string;
  interpretation: string;
  confidence: number;
  evidence: string[];
}

interface RCIScore {
  overall: number;
  intent_alignment: number;
  task_reality_sync: number;
  technical_health: number;
  status: 'COHERENT' | 'MONITOR' | 'MISALIGNED' | 'INCOHERENT';
}

interface RepositoryMetrics {
  total_files: number;
  code_files: number;
  doc_files: number;
  test_files: number;
  doc_to_code_ratio: number;
  avg_doc_length: number;
  technical_debt_markers: number;
  last_commit_age_days: number | null;
}

class DarkMatterAnalyzerServer {
  private server: Server;
  private currentPath: string | null = null;
  private metrics: RepositoryMetrics | null = null;
  private patterns: Pattern[] = [];

  constructor() {
    this.server = new Server(
      {
        name: 'dark-matter-analyzer-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
  }

  private setupHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: this.getTools(),
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'scan_repository':
            return await this.handleScanRepository(args as any);
          case 'calculate_rci':
            return await this.handleCalculateRCI(args as any);
          case 'detect_patterns':
            return await this.handleDetectPatterns(args as any);
          case 'generate_report':
            return await this.handleGenerateReport(args as any);
          case 'analyze_documentation':
            return await this.handleAnalyzeDocumentation(args as any);
          case 'check_coherence':
            return await this.handleCheckCoherence(args as any);
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          content: [{ type: 'text', text: `Error: ${errorMessage}` }],
          isError: true,
        };
      }
    });
  }

  private getTools(): Tool[] {
    return [
      {
        name: 'scan_repository',
        description: 'Scan repository to gather signals and metrics for Dark Matter analysis',
        inputSchema: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'Path to repository root',
            },
            depth: {
              type: 'string',
              enum: ['quick', 'medium', 'deep'],
              description: 'Analysis depth: quick (basic metrics), medium (patterns), deep (full analysis)',
              default: 'medium',
            },
            include_patterns: {
              type: 'array',
              items: { type: 'string' },
              description: 'File patterns to include (e.g., ["*.ts", "*.md"])',
            },
            exclude_patterns: {
              type: 'array',
              items: { type: 'string' },
              description: 'Patterns to exclude (e.g., ["node_modules", "dist"])',
            },
          },
          required: ['path'],
        },
      },
      {
        name: 'calculate_rci',
        description: 'Calculate Repository Coherence Index (RCI) score',
        inputSchema: {
          type: 'object',
          properties: {
            repository_path: {
              type: 'string',
              description: 'Path to repository (uses last scanned if omitted)',
            },
          },
        },
      },
      {
        name: 'detect_patterns',
        description: 'Detect organizational patterns and weak signals',
        inputSchema: {
          type: 'object',
          properties: {
            focus: {
              type: 'string',
              enum: ['all', 'documentation', 'execution', 'drift', 'suppression'],
              description: 'Pattern focus area',
              default: 'all',
            },
          },
        },
      },
      {
        name: 'generate_report',
        description: 'Generate comprehensive Dark Matter analysis report',
        inputSchema: {
          type: 'object',
          properties: {
            format: {
              type: 'string',
              enum: ['markdown', 'json', 'text'],
              description: 'Output format',
              default: 'markdown',
            },
            output_path: {
              type: 'string',
              description: 'Path to save report (optional, returns inline if omitted)',
            },
            include_sections: {
              type: 'array',
              items: { type: 'string' },
              description: 'Sections to include: sensing, patterns, reflection, actions, rci',
            },
          },
        },
      },
      {
        name: 'analyze_documentation',
        description: 'Analyze documentation patterns for inflation, redundancy, and coherence',
        inputSchema: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'Path to documentation directory',
            },
          },
          required: ['path'],
        },
      },
      {
        name: 'check_coherence',
        description: 'Quick coherence check between stated intent and observed behavior',
        inputSchema: {
          type: 'object',
          properties: {
            readme_path: {
              type: 'string',
              description: 'Path to README file',
            },
            repository_path: {
              type: 'string',
              description: 'Path to repository root',
            },
          },
          required: ['readme_path', 'repository_path'],
        },
      },
    ];
  }

  private async handleScanRepository(config: ScanConfig) {
    this.currentPath = config.path;
    const depth = config.depth || 'medium';
    const excludePatterns = config.exclude_patterns || ['node_modules', 'dist', '.git', 'build'];

    // Gather repository metrics
    this.metrics = await this.gatherMetrics(config.path, excludePatterns);

    // Detect patterns based on depth
    if (depth === 'medium' || depth === 'deep') {
      this.patterns = await this.scanPatterns(config.path, depth);
    }

    const result = {
      path: config.path,
      depth,
      metrics: this.metrics,
      patterns_found: this.patterns.length,
      critical_patterns: this.patterns.filter(p => p.severity === 'critical').length,
      timestamp: new Date().toISOString(),
    };

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(result, null, 2),
      }],
    };
  }

  private async gatherMetrics(repoPath: string, excludePatterns: string[]): Promise<RepositoryMetrics> {
    const files = await this.walkDirectory(repoPath, excludePatterns);

    const codeFiles = files.filter(f => /\.(ts|js|tsx|jsx|py|java|go|rs|cpp|c)$/i.test(f));
    const docFiles = files.filter(f => /\.md$/i.test(f));
    const testFiles = files.filter(f => /\.(test|spec)\.(ts|js|tsx|jsx)$/i.test(f));

    let totalDocLines = 0;
    for (const docFile of docFiles) {
      try {
        const content = await fs.readFile(docFile, 'utf-8');
        totalDocLines += content.split('\n').length;
      } catch (error) {
        // Skip files we can't read
      }
    }

    // Count technical debt markers
    let debtMarkers = 0;
    for (const codeFile of codeFiles) {
      try {
        const content = await fs.readFile(codeFile, 'utf-8');
        debtMarkers += (content.match(/TODO|FIXME|HACK|XXX/g) || []).length;
      } catch (error) {
        // Skip files we can't read
      }
    }

    return {
      total_files: files.length,
      code_files: codeFiles.length,
      doc_files: docFiles.length,
      test_files: testFiles.length,
      doc_to_code_ratio: codeFiles.length > 0 ? docFiles.length / codeFiles.length : 0,
      avg_doc_length: docFiles.length > 0 ? Math.round(totalDocLines / docFiles.length) : 0,
      technical_debt_markers: debtMarkers,
      last_commit_age_days: null, // Would need git integration
    };
  }

  private async walkDirectory(dir: string, excludePatterns: string[]): Promise<string[]> {
    const files: string[] = [];

    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = join(dir, entry.name);

        // Check exclusions
        if (excludePatterns.some(pattern => fullPath.includes(pattern))) {
          continue;
        }

        if (entry.isDirectory()) {
          files.push(...await this.walkDirectory(fullPath, excludePatterns));
        } else {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Skip directories we can't read
    }

    return files;
  }

  private async scanPatterns(repoPath: string, depth: string): Promise<Pattern[]> {
    const patterns: Pattern[] = [];

    if (!this.metrics) {
      return patterns;
    }

    // Pattern 1: Documentation Inflation
    if (this.metrics.doc_files > 20 && this.metrics.avg_doc_length > 400) {
      patterns.push({
        type: 'Documentation Inflation',
        severity: this.metrics.doc_files > 30 ? 'high' : 'medium',
        signal: `${this.metrics.doc_files} documentation files averaging ${this.metrics.avg_doc_length} lines`,
        interpretation: 'Planning activity may significantly outpace execution. High documentation volume suggests over-planning or avoidance through writing.',
        confidence: 0.85,
        evidence: [
          `${this.metrics.doc_files} total .md files`,
          `Average ${this.metrics.avg_doc_length} lines per doc`,
          `Doc-to-code ratio: ${this.metrics.doc_to_code_ratio.toFixed(2)}`,
        ],
      });
    }

    // Pattern 2: Execution Deficit (high doc-to-code ratio)
    if (this.metrics.doc_to_code_ratio > 0.5) {
      patterns.push({
        type: 'Execution Deficit',
        severity: this.metrics.doc_to_code_ratio > 1.0 ? 'critical' : 'high',
        signal: `Doc-to-code ratio of ${this.metrics.doc_to_code_ratio.toFixed(2)}:1`,
        interpretation: 'More documentation than implementation suggests hope-driven development. System may be aspirational rather than actionable.',
        confidence: 0.90,
        evidence: [
          `${this.metrics.doc_files} documentation files`,
          `${this.metrics.code_files} code files`,
          `Ratio: ${this.metrics.doc_to_code_ratio.toFixed(2)}:1`,
        ],
      });
    }

    // Pattern 3: Suppression Pattern (technical debt)
    if (this.metrics.technical_debt_markers > 50) {
      patterns.push({
        type: 'Suppression Pattern',
        severity: this.metrics.technical_debt_markers > 100 ? 'high' : 'medium',
        signal: `${this.metrics.technical_debt_markers} TODO/FIXME/HACK markers`,
        interpretation: 'High technical debt markers suggest time pressure, fatigue, or incomplete implementations. May indicate rushing or scope creep.',
        confidence: 0.75,
        evidence: [
          `${this.metrics.technical_debt_markers} total markers`,
          `Average ${(this.metrics.technical_debt_markers / Math.max(this.metrics.code_files, 1)).toFixed(1)} per code file`,
        ],
      });
    }

    // Pattern 4: Test Coverage Health
    const testCoverage = this.metrics.code_files > 0
      ? this.metrics.test_files / this.metrics.code_files
      : 0;

    if (testCoverage < 0.3 && this.metrics.code_files > 10) {
      patterns.push({
        type: 'Test Deficiency',
        severity: testCoverage < 0.1 ? 'high' : 'medium',
        signal: `Test coverage ratio of ${testCoverage.toFixed(2)}:1`,
        interpretation: 'Low test coverage may indicate rushed implementation or avoidance of validation feedback.',
        confidence: 0.70,
        evidence: [
          `${this.metrics.test_files} test files`,
          `${this.metrics.code_files} code files`,
          `Coverage ratio: ${testCoverage.toFixed(2)}`,
        ],
      });
    }

    return patterns;
  }

  private async handleCalculateRCI(args: any) {
    if (!this.metrics || !this.currentPath) {
      throw new Error('Must run scan_repository first');
    }

    // Calculate component scores
    const intentAlignment = await this.calculateIntentAlignment();
    const taskRealitySync = await this.calculateTaskRealitySync();
    const technicalHealth = await this.calculateTechnicalHealth();

    const overall = Math.round((intentAlignment + taskRealitySync + technicalHealth) / 3);

    let status: RCIScore['status'];
    if (overall >= 85) status = 'COHERENT';
    else if (overall >= 70) status = 'MONITOR';
    else if (overall >= 50) status = 'MISALIGNED';
    else status = 'INCOHERENT';

    const rci: RCIScore = {
      overall,
      intent_alignment: intentAlignment,
      task_reality_sync: taskRealitySync,
      technical_health: technicalHealth,
      status,
    };

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(rci, null, 2),
      }],
    };
  }

  private async calculateIntentAlignment(): Promise<number> {
    // Simplified scoring based on doc-to-code ratio
    // Lower ratio = better alignment (execution matches intent)
    if (!this.metrics) return 50;

    if (this.metrics.doc_to_code_ratio < 0.3) return 90;
    if (this.metrics.doc_to_code_ratio < 0.5) return 80;
    if (this.metrics.doc_to_code_ratio < 0.8) return 70;
    if (this.metrics.doc_to_code_ratio < 1.2) return 60;
    return 50;
  }

  private async calculateTaskRealitySync(): Promise<number> {
    // Based on technical debt markers and test coverage
    if (!this.metrics) return 50;

    const debtPerFile = this.metrics.technical_debt_markers / Math.max(this.metrics.code_files, 1);
    const testCoverage = this.metrics.test_files / Math.max(this.metrics.code_files, 1);

    let score = 75; // Base score

    // Penalize high debt
    if (debtPerFile > 5) score -= 30;
    else if (debtPerFile > 2) score -= 20;
    else if (debtPerFile > 1) score -= 10;

    // Reward good test coverage
    if (testCoverage > 0.7) score += 10;
    else if (testCoverage > 0.5) score += 5;
    else if (testCoverage < 0.2) score -= 15;

    return Math.max(0, Math.min(100, score));
  }

  private async calculateTechnicalHealth(): Promise<number> {
    // Based on file organization and structure
    if (!this.metrics) return 50;

    let score = 70; // Base score

    // Reward having tests
    if (this.metrics.test_files > 0) score += 10;

    // Penalize excessive documentation
    if (this.metrics.doc_files > 40) score -= 10;
    else if (this.metrics.doc_files > 30) score -= 5;

    // Reward balanced codebase
    if (this.metrics.code_files > 20 && this.metrics.code_files < 500) score += 10;

    return Math.max(0, Math.min(100, score));
  }

  private async handleDetectPatterns(args: any) {
    if (this.patterns.length === 0) {
      throw new Error('No patterns detected. Run scan_repository first.');
    }

    const focus = args.focus || 'all';
    let filteredPatterns = this.patterns;

    if (focus !== 'all') {
      filteredPatterns = this.patterns.filter(p =>
        p.type.toLowerCase().includes(focus.toLowerCase())
      );
    }

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          total_patterns: filteredPatterns.length,
          patterns: filteredPatterns,
        }, null, 2),
      }],
    };
  }

  private async handleGenerateReport(args: any) {
    if (!this.metrics || !this.currentPath) {
      throw new Error('Must run scan_repository first');
    }

    const format = args.format || 'markdown';
    const rciResult = await this.handleCalculateRCI({});
    const rci = JSON.parse(rciResult.content[0].text);

    let report = '';

    if (format === 'markdown') {
      report = this.generateMarkdownReport(rci);
    } else if (format === 'json') {
      report = JSON.stringify({
        repository: this.currentPath,
        timestamp: new Date().toISOString(),
        metrics: this.metrics,
        patterns: this.patterns,
        rci,
      }, null, 2);
    } else {
      report = this.generateTextReport(rci);
    }

    // Save if output path provided
    if (args.output_path) {
      await fs.writeFile(args.output_path, report, 'utf-8');
      return {
        content: [{
          type: 'text',
          text: `Report saved to: ${args.output_path}`,
        }],
      };
    }

    return {
      content: [{
        type: 'text',
        text: report,
      }],
    };
  }

  private generateMarkdownReport(rci: RCIScore): string {
    const timestamp = new Date().toISOString().split('T')[0];

    return `# 🌌 Dark Matter Mode Analysis

**Date:** ${timestamp}
**Repository:** ${this.currentPath}
**RCI Score:** ${rci.overall}/100 — ${rci.status}

---

## 📊 Executive Summary

Repository Coherence Index: **${rci.overall}/100** (${rci.status})

${this.getStatusInterpretation(rci.status)}

---

## Layer 1: Sensing — What Was Observed

### Repository Metrics

- **Total Files:** ${this.metrics!.total_files}
- **Code Files:** ${this.metrics!.code_files}
- **Documentation Files:** ${this.metrics!.doc_files}
- **Test Files:** ${this.metrics!.test_files}
- **Doc-to-Code Ratio:** ${this.metrics!.doc_to_code_ratio.toFixed(2)}:1
- **Average Doc Length:** ${this.metrics!.avg_doc_length} lines
- **Technical Debt Markers:** ${this.metrics!.technical_debt_markers}

---

## Layer 2: Pattern Detection — The Weak Signals

**Patterns Detected:** ${this.patterns.length}

${this.patterns.map(p => `
### ${p.type} (${p.severity.toUpperCase()})

**Signal:** ${p.signal}

**Interpretation:** ${p.interpretation}

**Confidence:** ${(p.confidence * 100).toFixed(0)}%

**Evidence:**
${p.evidence.map(e => `- ${e}`).join('\n')}
`).join('\n---\n')}

---

## Layer 3: Repository Coherence Index

| Component | Score | Meaning |
|-----------|-------|---------|
| **Intent Alignment** | ${rci.intent_alignment}/100 | Stated purpose matches observed work |
| **Task Reality Sync** | ${rci.task_reality_sync}/100 | Tests validate utility, not just structure |
| **Technical Health** | ${rci.technical_health}/100 | Build, tests, dependencies maintained |
| **Overall RCI** | **${rci.overall}/100** | **${rci.status}** |

---

## Layer 4: Action — Recommendations

${this.generateRecommendations(rci, this.patterns)}

---

## Closing Reflection

${this.generateClosingReflection(rci)}

---

*"Dark Matter Mode remains a mirror — it does not predict, it illuminates."*
`;
  }

  private generateTextReport(rci: RCIScore): string {
    return `DARK MATTER MODE ANALYSIS
========================

Repository: ${this.currentPath}
RCI Score: ${rci.overall}/100 (${rci.status})

METRICS
-------
Code Files: ${this.metrics!.code_files}
Doc Files: ${this.metrics!.doc_files}
Test Files: ${this.metrics!.test_files}
Doc-to-Code Ratio: ${this.metrics!.doc_to_code_ratio.toFixed(2)}:1
Technical Debt: ${this.metrics!.technical_debt_markers} markers

PATTERNS DETECTED
-----------------
${this.patterns.map(p => `${p.type} (${p.severity}): ${p.signal}`).join('\n')}

RCI BREAKDOWN
-------------
Intent Alignment: ${rci.intent_alignment}/100
Task Reality Sync: ${rci.task_reality_sync}/100
Technical Health: ${rci.technical_health}/100
`;
  }

  private getStatusInterpretation(status: string): string {
    switch (status) {
      case 'COHERENT':
        return '✅ **Healthy System** - Rhythm aligned, sustainable pace, good coherence between intent and execution.';
      case 'MONITOR':
        return '🟡 **Early Drift Detected** - Watch for emerging patterns. System is functional but showing signs of misalignment.';
      case 'MISALIGNED':
        return '🟠 **Intent-Reality Divergence** - Significant gap between stated goals and observed behavior. Realignment recommended.';
      case 'INCOHERENT':
        return '🔴 **Major Realignment Needed** - Fundamental disconnect between intent, artifact, and action. Context rebuild or rhythm reset required.';
      default:
        return 'Status unknown.';
    }
  }

  private generateRecommendations(rci: RCIScore, patterns: Pattern[]): string {
    const critical = patterns.filter(p => p.severity === 'critical');
    const high = patterns.filter(p => p.severity === 'high');
    const medium = patterns.filter(p => p.severity === 'medium');

    let recommendations = '';

    if (critical.length > 0 || rci.overall < 50) {
      recommendations += '### 🔴 HOLD — Stop Before Proceeding\n\n';
      critical.forEach(p => {
        recommendations += `**${p.type}:** ${p.interpretation}\n\n`;
      });
      if (rci.overall < 50) {
        recommendations += '**Action:** Pause development. Reconcile intent with reality before proceeding.\n\n';
      }
    }

    if (high.length > 0 || (rci.overall >= 50 && rci.overall < 70)) {
      recommendations += '### 🟡 REVIEW — Reflection Requested\n\n';
      high.forEach(p => {
        recommendations += `**${p.type}:** ${p.interpretation}\n\n`;
      });
    }

    if (medium.length > 0 || rci.overall >= 70) {
      recommendations += '### 🟢 OBSERVE — Gentle Nudges\n\n';
      medium.forEach(p => {
        recommendations += `**${p.type}:** ${p.interpretation}\n\n`;
      });
    }

    return recommendations || '**No critical issues detected.** Continue current rhythm with awareness.';
  }

  private generateClosingReflection(rci: RCIScore): string {
    if (rci.overall >= 85) {
      return 'The repository demonstrates strong coherence. Maintain current practices while remaining open to external feedback. Trust is earned through sustained execution.';
    } else if (rci.overall >= 70) {
      return 'Early drift signals present. The system remains functional but would benefit from attention to alignment. Focus on closing gaps between documentation and execution.';
    } else if (rci.overall >= 50) {
      return 'Significant misalignment detected. The repository would benefit from structured reflection and realignment. Consider external validation before proceeding with major initiatives.';
    } else {
      return 'The repository requires fundamental realignment. Step back, reassess core intent, and rebuild from coherence. This is corrective work, not compensatory — address root causes, not symptoms.';
    }
  }

  private async handleAnalyzeDocumentation(args: any) {
    const docPath = args.path;
    const excludePatterns = ['node_modules', 'dist', '.git'];

    const docFiles = (await this.walkDirectory(docPath, excludePatterns))
      .filter(f => /\.md$/i.test(f));

    const analysis = {
      total_docs: docFiles.length,
      files: [] as any[],
    };

    for (const file of docFiles) {
      const content = await fs.readFile(file, 'utf-8');
      const lines = content.split('\n').length;
      analysis.files.push({
        path: relative(docPath, file),
        lines,
      });
    }

    const avgLength = analysis.files.reduce((sum, f) => sum + f.lines, 0) / analysis.files.length;

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          ...analysis,
          avg_length: Math.round(avgLength),
          inflation_risk: avgLength > 400 && docFiles.length > 20 ? 'HIGH' : 'NORMAL',
        }, null, 2),
      }],
    };
  }

  private async handleCheckCoherence(args: any) {
    const readmeContent = await fs.readFile(args.readme_path, 'utf-8');

    // Simple coherence check - look for common disconnects
    const checks = {
      readme_has_todos: /TODO|FIXME|Coming soon|In progress/i.test(readmeContent),
      readme_length: readmeContent.split('\n').length,
      claims_completeness: /complete|finished|ready|production/i.test(readmeContent),
    };

    const warning = checks.readme_has_todos && checks.claims_completeness
      ? 'README claims completeness but contains TODO markers - possible task-reality desync'
      : 'No obvious coherence issues detected';

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({ checks, warning }, null, 2),
      }],
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }
}

const server = new DarkMatterAnalyzerServer();
server.run().catch(console.error);
