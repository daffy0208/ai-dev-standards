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
import { WorkflowEngine, WorkflowDecision, WorkflowStep } from './workflow-engine';
import { SkillSelector, SkillSelection } from './skill-selector';
import { MCPIntegrator, MCPIntegration } from './mcp-integrator';
import { PatternMatcher, ArchitecturePattern, PatternMatch } from './pattern-matcher';
import * as fs from 'fs';
import * as path from 'path';

export { Skill, MCP } from './knowledge-layer';
export { WorkflowDecision, WorkflowStep } from './workflow-engine';
export { SkillSelection } from './skill-selector';
export { MCPIntegration } from './mcp-integrator';
export { ArchitecturePattern, PatternMatch } from './pattern-matcher';

export class RepositoryBrain {
  private knowledge: KnowledgeLayer;
  private workflowEngine: WorkflowEngine;
  private skillSelector: SkillSelector | null = null;
  private mcpIntegrator: MCPIntegrator | null = null;
  private patternMatcher: PatternMatcher;
  private rootPath: string;
  private initialized: boolean = false;

  constructor(rootPath: string) {
    this.rootPath = rootPath;
    this.knowledge = new KnowledgeLayer(rootPath);
    this.workflowEngine = new WorkflowEngine();
    this.patternMatcher = new PatternMatcher();
  }

  /**
   * Initialize the brain (load all registries and engines)
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    // Load registries
    await this.knowledge.loadRegistries();

    // Initialize engines with loaded data
    const allSkills = this.knowledge.getAllSkills();
    const allMCPs = this.knowledge.getAllMCPs();

    // Load relationship mapping
    const relationshipPath = path.join(this.rootPath, 'META', 'relationship-mapping.json');
    const relationshipMapping = JSON.parse(fs.readFileSync(relationshipPath, 'utf-8'));

    this.skillSelector = new SkillSelector(allSkills);
    this.mcpIntegrator = new MCPIntegrator(allMCPs, relationshipMapping);

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
    state: {
      skills: number;
      mcps: number;
      components: number;
      tools: number;
      integrations: number;
      totalResources: number;
      skillRegistryVersion: string;
      mcpRegistryVersion: string;
      componentRegistryVersion: string;
      toolRegistryVersion: string;
      integrationRegistryVersion: string;
      relationshipVersion: string;
      lastUpdated: string;
    };
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
  async getSkill(name: string): Promise<Skill | null> {
    this.ensureInitialized();
    return this.knowledge.getSkill(name);
  }

  /**
   * Get all skills
   */
  async listSkills(): Promise<Skill[]> {
    this.ensureInitialized();
    return this.knowledge.getAllSkills();
  }

  /**
   * Get all MCPs
   */
  async listMCPs(): Promise<MCP[]> {
    this.ensureInitialized();
    return this.knowledge.getAllMCPs();
  }

  /**
   * Search across all resources
   */
  async search(query: string): Promise<{
    skills: Skill[];
    mcps: MCP[];
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
    skill: Skill;
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
   * BUG FIX 2: Get reverse dependencies (what uses this MCP?)
   * FIXED: Now supports both MCP ID and friendly name
   * Implementation is in knowledge-layer.ts getMCP() and getSkillsUsingMCP()
   * - ID format: "vector-database-mcp"
   * - Friendly name: "Vector Database MCP"
   */
  async getReverseDependencies(mcpIdOrName: string): Promise<{
    mcp: MCP;
    usedBySkills: string[];
  }> {
    this.ensureInitialized();

    const mcp = this.knowledge.getMCP(mcpIdOrName);
    if (!mcp) {
      throw new Error(`MCP '${mcpIdOrName}' not found. Use either the ID (e.g., 'vector-database-mcp') or friendly name (e.g., 'Vector Database MCP')`);
    }

    return {
      mcp,
      usedBySkills: this.knowledge.getSkillsUsingMCP(mcpIdOrName)
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
   * Select skills for a given task description (Enhanced with SkillSelector)
   */
  async selectSkills(taskDescription: string): Promise<{
    recommended: string[];
    reasoning: string;
    alternatives: string[];
  }> {
    this.ensureInitialized();
    if (!this.skillSelector) throw new Error('SkillSelector not initialized');

    const selection: SkillSelection = this.skillSelector.select(taskDescription);

    return {
      recommended: selection.primary,
      reasoning: selection.reasoning,
      alternatives: [...selection.secondary, ...selection.optional]
    };
  }

  /**
   * Advanced skill selection with detailed scoring
   */
  async selectSkillsAdvanced(taskDescription: string): Promise<SkillSelection> {
    this.ensureInitialized();
    if (!this.skillSelector) throw new Error('SkillSelector not initialized');

    return this.skillSelector.select(taskDescription);
  }

  /**
   * Get required MCPs for given skills (Enhanced with MCPIntegrator)
   */
  async getRequiredMCPs(skillNames: string[]): Promise<{
    mcps: string[];
    breakdown: Record<string, string[]>;
  }> {
    this.ensureInitialized();
    if (!this.mcpIntegrator) throw new Error('MCPIntegrator not initialized');

    const integration = this.mcpIntegrator.integrate(skillNames);

    return {
      mcps: integration.required,
      breakdown: integration.dependencies.reduce((acc, dep) => {
        for (const skill of dep.requiredBy) {
          if (!acc[skill]) acc[skill] = [];
          acc[skill].push(dep.mcp);
        }
        return acc;
      }, {} as Record<string, string[]>)
    };
  }

  /**
   * Advanced MCP integration with recommendations
   */
  async integrateMCPs(skillNames: string[]): Promise<MCPIntegration> {
    this.ensureInitialized();
    if (!this.mcpIntegrator) throw new Error('MCPIntegrator not initialized');

    return this.mcpIntegrator.integrate(skillNames);
  }

  /**
   * Decide workflow for a given scenario (Enhanced with WorkflowEngine)
   */
  async decideWorkflow(scenario: string): Promise<{
    workflow: string[];
    skills: string[];
    mcps: string[];
    estimatedTime: string;
    reasoning: string;
  }> {
    this.ensureInitialized();

    // Select skills based on scenario
    const skillSelection = await this.selectSkills(scenario);

    // Generate workflow using WorkflowEngine
    const decision: WorkflowDecision = this.workflowEngine.decide(scenario, skillSelection.recommended);

    // Get required MCPs
    const mcpSelection = await this.getRequiredMCPs(skillSelection.recommended);

    return {
      workflow: decision.steps.map((s: WorkflowStep) => s.action),
      skills: skillSelection.recommended,
      mcps: mcpSelection.mcps,
      estimatedTime: decision.estimatedTime,
      reasoning: decision.reasoning
    };
  }

  /**
   * Advanced workflow decision with detailed steps
   */
  async decideWorkflowAdvanced(scenario: string): Promise<WorkflowDecision & {
    mcps: string[];
    recommendedMCPs: string[];
    tools: string[];
    integrations: string[];
  }> {
    this.ensureInitialized();

    // Select skills
    const skillSelection = await this.selectSkills(scenario);

    // Generate workflow
    const decision: WorkflowDecision = this.workflowEngine.decide(scenario, skillSelection.recommended);

    // Get MCP integration
    const integration: MCPIntegration = await this.integrateMCPs(skillSelection.recommended);

    return {
      ...decision,
      mcps: integration.required,
      recommendedMCPs: integration.recommended,
      tools: integration.tools,
      integrations: integration.integrations,
      warnings: [...decision.warnings, ...integration.warnings]
    };
  }

  // ============================================
  // PATTERN MATCHING
  // ============================================

  /**
   * Match architecture patterns to a problem
   */
  async matchPatterns(problemDescription: string): Promise<PatternMatch[]> {
    this.ensureInitialized();
    return this.patternMatcher.match(problemDescription);
  }

  /**
   * Get specific architecture pattern
   */
  async getPattern(patternName: string): Promise<ArchitecturePattern | null> {
    this.ensureInitialized();
    return this.patternMatcher.getPattern(patternName);
  }

  /**
   * Get all available patterns
   */
  async getAllPatterns(): Promise<ArchitecturePattern[]> {
    this.ensureInitialized();
    return this.patternMatcher.getAllPatterns();
  }

  /**
   * TYPE SAFETY FIX 3: Compare architecture patterns with proper typing
   */
  async comparePatterns(patternNames: string[]): Promise<{
    comparison: Record<string, {
      complexity: string;
      estimated_time: string;
      pros_count: number;
      cons_count: number;
      skills_required: number;
    }>;
    recommendation: string;
    reasoning: string;
  }> {
    this.ensureInitialized();
    return this.patternMatcher.comparePatterns(patternNames);
  }

  // ============================================
  // COMPREHENSIVE ANALYSIS
  // ============================================

  /**
   * Comprehensive analysis combining all engines
   */
  async analyze(taskDescription: string) {
    this.ensureInitialized();

    // 1. Skill Selection
    const skills = await this.selectSkillsAdvanced(taskDescription);

    // 2. Workflow Generation
    const workflow = await this.decideWorkflowAdvanced(taskDescription);

    // 3. MCP Integration
    const mcpIntegration = await this.integrateMCPs(skills.primary);

    // 4. Pattern Matching
    const patterns = await this.matchPatterns(taskDescription);

    // 5. Complexity Analysis
    const complexity = this.skillSelector?.analyzeComplexity(taskDescription);

    return {
      task: taskDescription,
      skills: {
        primary: skills.primary,
        secondary: skills.secondary,
        optional: skills.optional,
        confidence: skills.confidence,
        reasoning: skills.reasoning
      },
      workflow: {
        type: workflow.workflowType,
        steps: workflow.steps,
        estimatedTime: workflow.estimatedTime,
        alternatives: workflow.alternatives,
        warnings: workflow.warnings
      },
      mcps: {
        required: mcpIntegration.required,
        recommended: mcpIntegration.recommended,
        optional: mcpIntegration.optional,
        warnings: mcpIntegration.warnings
      },
      tools: mcpIntegration.tools,
      integrations: workflow.integrations,
      patterns: patterns.slice(0, 3), // Top 3 patterns
      complexity: complexity || { complexity: 'moderate', recommendedSkillCount: 2, estimatedTime: '2-4 hours' },
      summary: {
        totalEstimatedTime: workflow.estimatedTime,
        confidence: skills.confidence,
        complexity: complexity?.complexity || 'moderate'
      }
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
  async getSkillsByCategory(category: string): Promise<Skill[]> {
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
