/**
 * LAYER 3: MCP INTEGRATOR
 *
 * MCP dependency resolution and integration management.
 * Handles direct dependencies, transitive dependencies, and MCP recommendations.
 */

import { MCP } from './knowledge-layer';

export interface MCPDependency {
  mcp: string;
  requiredBy: string[];
  reason: string;
  priority: 'required' | 'recommended' | 'optional';
}

export interface MCPIntegration {
  required: string[];
  recommended: string[];
  optional: string[];
  dependencies: MCPDependency[];
  tools: string[];
  integrations: string[];
  warnings: string[];
}

export class MCPIntegrator {
  private mcps: MCP[];
  private relationshipMapping: Record<string, {
    required_mcps: string[];
    required_tools: string[];
    required_integrations: string[];
  }>;

  constructor(mcps: MCP[], relationshipMapping: any) {
    this.mcps = mcps;
    this.relationshipMapping = relationshipMapping.skills || {};
  }

  /**
   * Get complete MCP integration plan for skills
   */
  integrate(skills: string[]): MCPIntegration {
    const directMCPs = this.getDirectMCPs(skills);
    const transitiveMCPs = this.getTransitiveMCPs(directMCPs);
    const recommendedMCPs = this.getRecommendedMCPs(skills);
    const optionalMCPs = this.getOptionalMCPs(skills);

    // Get tools and integrations
    const tools = this.getRequiredTools(skills);
    const integrations = this.getRequiredIntegrations(skills);

    // Generate dependencies with details
    const dependencies = this.generateDependencies(skills, directMCPs, transitiveMCPs);

    // Check for warnings
    const warnings = this.checkWarnings(skills, directMCPs);

    return {
      required: Array.from(new Set([...directMCPs, ...transitiveMCPs])),
      recommended: recommendedMCPs,
      optional: optionalMCPs,
      dependencies,
      tools,
      integrations,
      warnings
    };
  }

  /**
   * Get direct MCP dependencies for skills
   */
  private getDirectMCPs(skills: string[]): string[] {
    const mcps = new Set<string>();

    for (const skill of skills) {
      const deps = this.relationshipMapping[skill];
      if (deps && deps.required_mcps) {
        deps.required_mcps.forEach(mcp => mcps.add(mcp));
      }
    }

    return Array.from(mcps);
  }

  /**
   * Get transitive dependencies (MCPs required by other MCPs)
   */
  private getTransitiveMCPs(directMCPs: string[]): string[] {
    const transitive = new Set<string>();

    // In Phase 2, we'll implement this when we have MCP-to-MCP dependencies
    // For now, return empty array
    return Array.from(transitive);
  }

  /**
   * Get recommended (but not required) MCPs
   */
  private getRecommendedMCPs(skills: string[]): string[] {
    const recommended: string[] = [];

    // Recommend MCPs based on skill combinations
    if (skills.includes('rag-implementer') && !skills.includes('knowledge-base-manager')) {
      recommended.push('knowledge-base-mcp');
    }

    if (skills.includes('frontend-builder') && skills.includes('api-designer')) {
      recommended.push('component-generator-mcp');
    }

    if (skills.includes('testing-strategist')) {
      recommended.push('test-runner-mcp');
    }

    return recommended;
  }

  /**
   * Get optional MCPs that might be useful
   */
  private getOptionalMCPs(skills: string[]): string[] {
    const optional: string[] = [];

    // Suggest optional MCPs based on context
    if (skills.some(s => s.includes('builder') || s.includes('implementer'))) {
      optional.push('code-quality-scanner-mcp');
    }

    if (skills.includes('deployment-advisor')) {
      optional.push('deployment-orchestrator-mcp');
    }

    return optional;
  }

  /**
   * Get required tools for skills
   */
  private getRequiredTools(skills: string[]): string[] {
    const tools = new Set<string>();

    for (const skill of skills) {
      const deps = this.relationshipMapping[skill];
      if (deps && deps.required_tools) {
        deps.required_tools.forEach(tool => tools.add(tool));
      }
    }

    return Array.from(tools);
  }

  /**
   * Get required integrations for skills
   */
  private getRequiredIntegrations(skills: string[]): string[] {
    const integrations = new Set<string>();

    for (const skill of skills) {
      const deps = this.relationshipMapping[skill];
      if (deps && deps.required_integrations) {
        deps.required_integrations.forEach(integration => integrations.add(integration));
      }
    }

    return Array.from(integrations);
  }

  /**
   * Generate detailed dependency information
   */
  private generateDependencies(
    skills: string[],
    directMCPs: string[],
    transitiveMCPs: string[]
  ): MCPDependency[] {
    const dependencies: MCPDependency[] = [];

    // Direct dependencies
    for (const mcp of directMCPs) {
      const requiredBy = skills.filter(skill => {
        const deps = this.relationshipMapping[skill];
        return deps && deps.required_mcps && deps.required_mcps.includes(mcp);
      });

      dependencies.push({
        mcp,
        requiredBy,
        reason: `Required by ${requiredBy.length} skill(s)`,
        priority: 'required'
      });
    }

    // Transitive dependencies
    for (const mcp of transitiveMCPs) {
      dependencies.push({
        mcp,
        requiredBy: [],
        reason: 'Transitive dependency',
        priority: 'required'
      });
    }

    return dependencies;
  }

  /**
   * Check for warnings
   */
  private checkWarnings(skills: string[], mcps: string[]): string[] {
    const warnings: string[] = [];

    // Check if any MCPs are missing
    for (const mcp of mcps) {
      const mcpExists = this.mcps.some(m => m.name === mcp);
      if (!mcpExists) {
        warnings.push(`MCP '${mcp}' is required but not yet implemented`);
      }
    }

    // Check for conflicting MCPs
    if (mcps.includes('vector-database-mcp') && mcps.includes('graph-database-mcp')) {
      warnings.push('Both vector and graph databases required - ensure sufficient resources');
    }

    // Check if skills need official MCPs
    if (skills.includes('rag-implementer')) {
      const hasVectorDB = mcps.includes('vector-database-mcp');
      const hasEmbedding = mcps.includes('embedding-generator-mcp');

      if (!hasVectorDB) {
        warnings.push('RAG implementation typically requires vector-database-mcp');
      }
      if (!hasEmbedding) {
        warnings.push('RAG implementation typically requires embedding-generator-mcp');
      }
    }

    return warnings;
  }

  /**
   * Get MCP status (official, community, custom)
   */
  getMCPStatus(mcpName: string): 'official' | 'community' | 'custom' | 'not-found' {
    const mcp = this.mcps.find(m => m.name === mcpName);
    if (!mcp) return 'not-found';

    // Check status field
    if (mcp.status === 'official') return 'official';
    if (mcp.status === 'community') return 'community';
    return 'custom';
  }

  /**
   * Recommend official MCPs to use instead of custom
   */
  recommendOfficialMCPs(customMCPs: string[]): Record<string, string> {
    const recommendations: Record<string, string> = {};

    // Map custom MCPs to official alternatives
    const officialAlternatives: Record<string, string> = {
      'custom-vector-db': 'vector-database-mcp',
      'custom-embedding': 'embedding-generator-mcp',
      'custom-file-system': 'filesystem-mcp'
    };

    for (const custom of customMCPs) {
      if (officialAlternatives[custom]) {
        recommendations[custom] = officialAlternatives[custom];
      }
    }

    return recommendations;
  }

  /**
   * Calculate MCP setup complexity
   */
  calculateSetupComplexity(mcps: string[]): {
    complexity: 'simple' | 'moderate' | 'complex';
    estimatedTime: string;
    steps: string[];
  } {
    let complexity: 'simple' | 'moderate' | 'complex' = 'simple';
    let estimatedMinutes = 0;
    const steps: string[] = [];

    for (const mcpName of mcps) {
      const mcp = this.mcps.find(m => m.name === mcpName);
      if (!mcp) continue;

      // Estimate based on MCP type
      if (mcpName.includes('database')) {
        estimatedMinutes += 20;
        steps.push(`Configure ${mcpName}`);
        complexity = 'moderate';
      } else if (mcpName.includes('vector') || mcpName.includes('embedding')) {
        estimatedMinutes += 15;
        steps.push(`Setup ${mcpName}`);
        if (complexity === 'simple') complexity = 'moderate';
      } else {
        estimatedMinutes += 5;
        steps.push(`Install ${mcpName}`);
      }
    }

    if (mcps.length > 5) {
      complexity = 'complex';
      steps.push('Test MCP integration');
      estimatedMinutes += 15;
    }

    const hours = Math.floor(estimatedMinutes / 60);
    const minutes = estimatedMinutes % 60;
    const estimatedTime = hours > 0
      ? `${hours} hour${hours > 1 ? 's' : ''} ${minutes} min`
      : `${minutes} min`;

    return {
      complexity,
      estimatedTime,
      steps
    };
  }

  /**
   * Find skills that can use a specific MCP
   */
  findSkillsForMCP(mcpName: string): string[] {
    const skills: string[] = [];

    for (const [skill, deps] of Object.entries(this.relationshipMapping)) {
      if (deps.required_mcps && deps.required_mcps.includes(mcpName)) {
        skills.push(skill);
      }
    }

    return skills;
  }

  /**
   * Check MCP compatibility
   */
  checkCompatibility(mcps: string[]): {
    compatible: boolean;
    conflicts: string[];
    recommendations: string[];
  } {
    const conflicts: string[] = [];
    const recommendations: string[] = [];

    // Check for known conflicts
    const conflictPairs = [
      ['sqlite-mcp', 'postgresql-mcp'],
      ['local-file-mcp', 'cloud-storage-mcp']
    ];

    for (const [mcp1, mcp2] of conflictPairs) {
      if (mcps.includes(mcp1) && mcps.includes(mcp2)) {
        conflicts.push(`Conflict between ${mcp1} and ${mcp2}`);
        recommendations.push(`Choose either ${mcp1} or ${mcp2}, not both`);
      }
    }

    return {
      compatible: conflicts.length === 0,
      conflicts,
      recommendations
    };
  }

  /**
   * Generate MCP installation script
   */
  generateInstallScript(mcps: string[]): string {
    const lines = [
      '#!/bin/bash',
      '# MCP Installation Script',
      '# Generated by Repository Brain',
      '',
      'set -e',
      '',
      'echo "Installing MCPs..."',
      ''
    ];

    for (const mcp of mcps) {
      lines.push(`echo "Installing ${mcp}..."`);
      lines.push(`npm install @modelcontextprotocol/${mcp} || true`);
      lines.push('');
    }

    lines.push('echo "MCP installation complete!"');

    return lines.join('\n');
  }
}
