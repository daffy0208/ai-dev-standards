/**
 * BRAIN CORE
 *
 * Central brain class that orchestrates all 4 layers:
 * - Layer 1: Knowledge (registry queries)
 * - Layer 2: Enforcement (validation)
 * - Layer 3: Decision (workflow/skill/MCP selection)
 * - Layer 4: Management (Archon integration - future)
 */

import { KnowledgeLayer, Skill, MCP } from './knowledge-layer';

export { Skill, MCP } from './knowledge-layer';

export class RepositoryBrain {
  private knowledge: KnowledgeLayer;
  private rootPath: string;
  private initialized: boolean = false;

  constructor(rootPath: string) {
    this.rootPath = rootPath;
    this.knowledge = new KnowledgeLayer(rootPath);
  }

  /**
   * Initialize the brain (load all registries)
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;
    await this.knowledge.loadRegistries();
    this.initialized = true;
  }

  /**
   * Ensure brain is initialized
   */
  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new Error('Brain not initialized. Call initialize() first.');
    }
  }

  // ============================================
  // LAYER 1: KNOWLEDGE QUERIES
  // ============================================

  /**
   * Get current repository status
   */
  async status(): Promise<{
    state: any;
    health: 'healthy' | 'degraded' | 'critical';
    issues: string[];
  }> {
    this.ensureInitialized();

    const state = this.knowledge.getRepositoryState();
    const validation = this.knowledge.validateRegistries();

    let health: 'healthy' | 'degraded' | 'critical' = 'healthy';
    if (validation.errors.length > 0 && validation.errors.length < 5) {
      health = 'degraded';
    } else if (validation.errors.length >= 5) {
      health = 'critical';
    }

    return {
      state,
      health,
      issues: validation.errors
    };
  }

  /**
   * Get skill by name
   */
  async getSkill(name: string) {
    this.ensureInitialized();
    return this.knowledge.getSkill(name);
  }

  /**
   * Get all skills
   */
  async listSkills(): Promise<any[]> {
    this.ensureInitialized();
    return this.knowledge.getAllSkills();
  }

  /**
   * Get all MCPs
   */
  async listMCPs(): Promise<any[]> {
    this.ensureInitialized();
    return this.knowledge.getAllMCPs();
  }

  /**
   * Search across all resources
   */
  async search(query: string): Promise<{
    skills: any[];
    mcps: any[];
  }> {
    this.ensureInitialized();
    return {
      skills: this.knowledge.searchSkills(query),
      mcps: this.knowledge.searchMCPs(query)
    };
  }

  /**
   * Get relationships for a skill
   */
  async getRelationships(skillName: string): Promise<{
    skill: any;
    relatedSkills: string[];
    dependencies: {
      mcps: string[];
      tools: string[];
      components: string[];
      integrations: string[];
      scripts: string[];
    };
  }> {
    this.ensureInitialized();

    const skill = this.knowledge.getSkill(skillName);
    if (!skill) {
      throw new Error(`Skill '${skillName}' not found`);
    }

    return {
      skill,
      relatedSkills: this.knowledge.getRelatedSkills(skillName),
      dependencies: this.knowledge.getSkillDependencies(skillName)
    };
  }

  /**
   * Get reverse dependencies (what uses this MCP?)
   */
  async getReverseDependencies(mcpName: string): Promise<{
    mcp: any;
    usedBySkills: string[];
  }> {
    this.ensureInitialized();

    const mcp = this.knowledge.getMCP(mcpName);
    if (!mcp) {
      throw new Error(`MCP '${mcpName}' not found`);
    }

    return {
      mcp,
      usedBySkills: this.knowledge.getSkillsUsingMCP(mcpName)
    };
  }

  // ============================================
  // LAYER 2: ENFORCEMENT / VALIDATION
  // ============================================

  /**
   * Validate registries
   */
  async validate(): Promise<{
    passed: boolean;
    errors: string[];
  }> {
    this.ensureInitialized();
    const result = this.knowledge.validateRegistries();
    return {
      passed: result.valid,
      errors: result.errors
    };
  }

  /**
   * Run health check
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'critical';
    issues: string[];
    recommendations: string[];
  }> {
    this.ensureInitialized();

    const validation = this.knowledge.validateRegistries();
    let status: 'healthy' | 'degraded' | 'critical' = 'healthy';
    const recommendations: string[] = [];

    if (validation.errors.length > 0 && validation.errors.length < 5) {
      status = 'degraded';
      recommendations.push('Run "brain fix" to attempt auto-repair');
    } else if (validation.errors.length >= 5) {
      status = 'critical';
      recommendations.push('Manual intervention required');
      recommendations.push('Review META/skill-registry.json and relationship-mapping.json');
    }

    return {
      status,
      issues: validation.errors,
      recommendations
    };
  }

  // ============================================
  // LAYER 3: DECISION MAKING
  // ============================================

  /**
   * Select skills for a given task description
   */
  async selectSkills(taskDescription: string): Promise<{
    recommended: string[];
    reasoning: string;
    alternatives: string[];
  }> {
    this.ensureInitialized();

    const lowerTask = taskDescription.toLowerCase();
    const allSkills = this.knowledge.getAllSkills();

    // Simple matching based on triggers and descriptions
    const scored = allSkills.map(skill => {
      let score = 0;

      // Check triggers
      for (const trigger of skill.triggers) {
        if (lowerTask.includes(trigger.toLowerCase())) {
          score += 10;
        }
      }

      // Check description words
      const descWords = skill.description.toLowerCase().split(/\s+/);
      const taskWords = lowerTask.split(/\s+/);
      for (const taskWord of taskWords) {
        if (descWords.includes(taskWord)) {
          score += 1;
        }
      }

      // Check name
      if (lowerTask.includes(skill.name.toLowerCase())) {
        score += 5;
      }

      return { skill: skill.name, score };
    });

    // Sort by score
    scored.sort((a, b) => b.score - a.score);

    const recommended = scored.filter(s => s.score >= 5).map(s => s.skill).slice(0, 3);
    const alternatives = scored.filter(s => s.score > 0 && s.score < 5).map(s => s.skill).slice(0, 3);

    const reasoning = recommended.length > 0
      ? `Selected based on matching triggers and description keywords. Primary match: ${recommended[0]}`
      : 'No strong matches found. Consider refining task description.';

    return {
      recommended,
      reasoning,
      alternatives
    };
  }

  /**
   * Get required MCPs for given skills
   */
  async getRequiredMCPs(skillNames: string[]): Promise<{
    mcps: string[];
    breakdown: Record<string, string[]>;
  }> {
    this.ensureInitialized();

    const allMCPs = new Set<string>();
    const breakdown: Record<string, string[]> = {};

    for (const skillName of skillNames) {
      const deps = this.knowledge.getSkillDependencies(skillName);
      breakdown[skillName] = deps.mcps;
      deps.mcps.forEach(mcp => allMCPs.add(mcp));
    }

    return {
      mcps: Array.from(allMCPs),
      breakdown
    };
  }

  /**
   * Decide workflow for a given scenario
   */
  async decideWorkflow(scenario: string): Promise<{
    workflow: string[];
    skills: string[];
    mcps: string[];
    estimatedTime: string;
    reasoning: string;
  }> {
    this.ensureInitialized();

    const lowerScenario = scenario.toLowerCase();

    // Workflow decision rules
    let workflow: string[] = [];
    let estimatedTime = '2-4 hours';

    if (lowerScenario.includes('new skill') || lowerScenario.includes('add skill')) {
      workflow = [
        'Research existing patterns',
        'Check if official MCP exists',
        'Create SKILL.md',
        'Update skill-registry.json',
        'Update relationship-mapping.json',
        'Update CLAUDE.md',
        'Update README.md',
        'Validate all changes',
        'Commit and push'
      ];
      estimatedTime = '2-3 hours';
    } else if (lowerScenario.includes('new feature') || lowerScenario.includes('add feature')) {
      workflow = [
        'Load project context',
        'Check playbooks for patterns',
        'Select appropriate skills',
        'Implement feature',
        'Write tests',
        'Update documentation',
        'Validate changes',
        'Commit'
      ];
      estimatedTime = '3-6 hours';
    } else if (lowerScenario.includes('enhance') || lowerScenario.includes('improve')) {
      workflow = [
        'Load existing implementation',
        'Identify gaps',
        'Research best practices',
        'Implement enhancements',
        'Update tests',
        'Update documentation',
        'Validate',
        'Commit'
      ];
      estimatedTime = '2-4 hours';
    } else {
      // Default workflow
      workflow = [
        'Understand requirement',
        'Select skills',
        'Implement',
        'Test',
        'Document',
        'Validate',
        'Commit'
      ];
      estimatedTime = '2-4 hours';
    }

    // Select skills based on scenario
    const skillSelection = await this.selectSkills(scenario);

    // Get required MCPs
    const mcpSelection = await this.getRequiredMCPs(skillSelection.recommended);

    return {
      workflow,
      skills: skillSelection.recommended,
      mcps: mcpSelection.mcps,
      estimatedTime,
      reasoning: `Matched scenario to standard workflow. ${skillSelection.reasoning}`
    };
  }

  // ============================================
  // CONVENIENCE METHODS
  // ============================================

  /**
   * Get skill count
   */
  async getSkillCount(): Promise<number> {
    this.ensureInitialized();
    return this.knowledge.getSkillCount();
  }

  /**
   * Get MCP count
   */
  async getMCPCount(): Promise<number> {
    this.ensureInitialized();
    return this.knowledge.getMCPCount();
  }

  /**
   * Get skills by category
   */
  async getSkillsByCategory(category: string): Promise<any[]> {
    this.ensureInitialized();
    return this.knowledge.getSkillsByCategory(category);
  }
}

/**
 * Factory function to create and initialize brain
 */
export async function createBrain(rootPath: string): Promise<RepositoryBrain> {
  const brain = new RepositoryBrain(rootPath);
  await brain.initialize();
  return brain;
}
