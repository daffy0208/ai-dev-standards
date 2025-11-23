/**
 * Approach Selector: Automatically chooses between Direct MCP and Code Execution patterns
 *
 * Based on task analysis, this module decides which MCP pattern is most appropriate.
 *
 * Decision Factors:
 * - Task complexity score (1-10)
 * - Number of tools needed
 * - Data size
 * - Workflow structure (linear vs branching)
 * - PII presence
 * - Frequency of execution
 *
 * @module approach-selector
 */

import { ComplexityAnalyzer, ComplexityScore } from './complexity-analyzer'

export type MCPPattern = 'direct' | 'code-execution'

export interface ApproachDecision {
  pattern: MCPPattern
  confidence: number // 0-1
  reasoning: string[]
  factors: {
    complexity_score: number
    estimated_tools: number
    data_size_kb: number
    has_pii: boolean
    is_repeated: boolean
    workflow_type: 'linear' | 'branching' | 'complex'
  }
  estimated_token_savings?: number
  estimated_cost_per_run?: number
}

export interface ApproachConfig {
  // Thresholds for decision-making
  complexity_threshold: number // >= 7 suggests code-execution
  tools_threshold: number // >= 5 suggests code-execution
  data_size_threshold_kb: number // >= 10 suggests code-execution

  // Weights for scoring
  complexity_weight: number // default 0.4
  tools_weight: number // default 0.25
  data_size_weight: number // default 0.15
  pii_weight: number // default 0.10
  frequency_weight: number // default 0.10

  // Force direct MCP for certain cases
  force_direct_for_realtime: boolean // default true
  force_direct_for_single_tool: boolean // default true
}

const DEFAULT_CONFIG: ApproachConfig = {
<<<<<<< HEAD
  complexity_threshold: 7,
  tools_threshold: 5,
  data_size_threshold_kb: 10,
  complexity_weight: 0.4,
  tools_weight: 0.25,
  data_size_weight: 0.15,
  pii_weight: 0.1,
  frequency_weight: 0.1,
  force_direct_for_realtime: true,
  force_direct_for_single_tool: true
}
=======
    complexity_threshold: 6,
    tools_threshold: 2,
    data_size_threshold_kb: 10,
    complexity_weight: 0.4,
    tools_weight: 0.3,
    data_size_weight: 0.1,
    pii_weight: 0.1,
    frequency_weight: 0.1,
    force_direct_for_realtime: true,
    force_direct_for_single_tool: true,
};
>>>>>>> origin/main

export class ApproachSelector {
  private analyzer: ComplexityAnalyzer
  private config: ApproachConfig

  constructor(config: Partial<ApproachConfig> = {}) {
    this.analyzer = new ComplexityAnalyzer()
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  /**
   * Selects the appropriate MCP pattern for a given task
   */
  async selectApproach(
    taskDescription: string,
    context?: {
      is_realtime?: boolean
      expected_frequency?: 'once' | 'occasional' | 'frequent' | 'continuous'
      has_pii?: boolean
      data_size_estimate_kb?: number
    }
  ): Promise<ApproachDecision> {
    // Analyze task complexity
    const complexityScore = await this.analyzer.analyzeComplexity(taskDescription)

    // Extract factors
    const factors = {
      complexity_score: complexityScore.overall_score,
      estimated_tools: complexityScore.estimated_tools,
      data_size_kb: context?.data_size_estimate_kb || 0,
      has_pii: context?.has_pii || false,
      is_repeated:
        context?.expected_frequency === 'frequent' || context?.expected_frequency === 'continuous',
      workflow_type: complexityScore.workflow_structure
    }

<<<<<<< HEAD
    // Apply forced rules
    if (this.config.force_direct_for_realtime && context?.is_realtime) {
      return this.createDecision('direct', factors, 1.0, [
        'Real-time interaction requires low latency',
        'Direct MCP is optimal for immediate responses'
      ])
    }

    if (this.config.force_direct_for_single_tool && factors.estimated_tools <= 1) {
      return this.createDecision('direct', factors, 1.0, [
        'Single tool operation is simple',
        'Direct MCP has lower overhead for simple tasks'
      ])
=======
    /**
     * Selects the appropriate MCP pattern for a given task
     */
    async selectApproach(
        taskDescription: string,
        context?: {
            is_realtime?: boolean;
            expected_frequency?: 'once' | 'occasional' | 'frequent' | 'continuous';
            has_pii?: boolean;
            data_size_estimate_kb?: number;
        }
    ): Promise<ApproachDecision> {
        // Analyze task complexity
        const complexityScore = await this.analyzer.analyzeComplexity(taskDescription);

        // Extract factors
        const factors = {
            complexity_score: complexityScore.overall_score,
            estimated_tools: complexityScore.estimated_tools,
            data_size_kb: context?.data_size_estimate_kb || 0,
            has_pii: context?.has_pii || false,
            is_repeated: context?.expected_frequency === 'frequent' || context?.expected_frequency === 'continuous',
            workflow_type: complexityScore.workflow_structure,
        };

        // Apply forced rules
        if (this.config.force_direct_for_realtime && context?.is_realtime) {
            return this.createDecision('direct', factors, 1.0, [
                'Real-time interaction requires low latency',
                'Direct MCP is optimal for immediate responses',
            ]);
        }

        if (this.config.force_direct_for_single_tool && factors.estimated_tools <= 1) {
            // Only force direct if no complicating factors
            if (!factors.has_pii && !factors.is_repeated && factors.data_size_kb <= this.config.data_size_threshold_kb) {
                return this.createDecision('direct', factors, 1.0, [
                    'Single tool operation is simple',
                    'Direct MCP has lower overhead for simple tasks',
                ]);
            }
        }

        // Calculate weighted score
        const score = this.calculateScore(factors);

        // Make decision based on score
        if (score >= 0.4) {
            const reasoning = [
                `High complexity score: ${factors.complexity_score}/10`,
                `Multiple tools needed: ${factors.estimated_tools}`,
                factors.has_pii ? 'PII present - benefits from security layers' : null,
                factors.is_repeated ? 'Repeated execution - skills will optimize' : null,
                factors.data_size_kb > 10 ? `Large data payload: ${factors.data_size_kb}KB` : null,
            ].filter(Boolean) as string[];
            console.log('DECISION REASONING (Code Exec):', reasoning);
            return this.createDecision('code-execution', factors, score, reasoning);
        } else {
            const reasoning = [
                `Low to medium complexity: ${factors.complexity_score}/10`,
                `Few tools needed: ${factors.estimated_tools}`,
                'Direct MCP is simpler and more reliable',
                factors.data_size_kb <= 10 ? 'Small data payload' : null,
            ].filter(Boolean) as string[];
            console.log('DECISION REASONING (Direct):', reasoning);
            return this.createDecision('direct', factors, 1 - score, reasoning);
        }
    }

    /**
     * Calculate weighted score for code execution preference (0-1)
     */
    private calculateScore(factors: ApproachDecision['factors']): number {
        let score = 0;

        // Complexity factor (0-1)
        const complexityFactor = Math.min(factors.complexity_score / 10, 1);
        score += complexityFactor * this.config.complexity_weight;

        // Tools factor (0-1, sigmoid curve)
        const toolsFactor = 1 / (1 + Math.exp(-(factors.estimated_tools - this.config.tools_threshold) / 2));
        score += toolsFactor * this.config.tools_weight;

        // Data size factor (0-1, sigmoid curve)
        const dataSizeFactor = 1 / (1 + Math.exp(-(factors.data_size_kb - this.config.data_size_threshold_kb) / 5));
        score += dataSizeFactor * this.config.data_size_weight;

        // PII factor (0 or 1)
        const piiFactor = factors.has_pii ? 1 : 0;
        score += piiFactor * this.config.pii_weight;

        // Frequency factor (0 or 1)
        const frequencyFactor = factors.is_repeated ? 1 : 0;
        score += frequencyFactor * this.config.frequency_weight;

        // Workflow complexity factor (embedded in complexity_score, but boost for branching)
        if (factors.workflow_type === 'complex') {
            score += 0.1; // Small boost for complex workflows
        }

        // Boosts for critical factors
        if (factors.has_pii) score += 0.25;
        if (factors.is_repeated) score += 0.25;
        if (factors.data_size_kb > this.config.data_size_threshold_kb) score += 0.25;

        return Math.min(score, 1.0);
>>>>>>> origin/main
    }

    // Calculate weighted score
    const score = this.calculateScore(factors)

    // Make decision based on score
    if (score >= 0.7) {
      return this.createDecision(
        'code-execution',
        factors,
        score,
        [
          `High complexity score: ${factors.complexity_score}/10`,
          `Multiple tools needed: ${factors.estimated_tools}`,
          factors.has_pii ? 'PII present - benefits from security layers' : null,
          factors.is_repeated ? 'Repeated execution - skills will optimize' : null,
          factors.data_size_kb > 10 ? `Large data payload: ${factors.data_size_kb}KB` : null
        ].filter(Boolean) as string[]
      )
    } else {
      return this.createDecision(
        'direct',
        factors,
        1 - score,
        [
          `Low to medium complexity: ${factors.complexity_score}/10`,
          `Few tools needed: ${factors.estimated_tools}`,
          'Direct MCP is simpler and more reliable',
          factors.data_size_kb <= 10 ? 'Small data payload' : null
        ].filter(Boolean) as string[]
      )
    }
  }

  /**
   * Calculate weighted score for code execution preference (0-1)
   */
  private calculateScore(factors: ApproachDecision['factors']): number {
    let score = 0

    // Complexity factor (0-1)
    const complexityFactor = Math.min(factors.complexity_score / 10, 1)
    score += complexityFactor * this.config.complexity_weight

    // Tools factor (0-1, sigmoid curve)
    const toolsFactor =
      1 / (1 + Math.exp(-(factors.estimated_tools - this.config.tools_threshold) / 2))
    score += toolsFactor * this.config.tools_weight

    // Data size factor (0-1, sigmoid curve)
    const dataSizeFactor =
      1 / (1 + Math.exp(-(factors.data_size_kb - this.config.data_size_threshold_kb) / 5))
    score += dataSizeFactor * this.config.data_size_weight

    // PII factor (0 or 1)
    const piiFactor = factors.has_pii ? 1 : 0
    score += piiFactor * this.config.pii_weight

    // Frequency factor (0 or 1)
    const frequencyFactor = factors.is_repeated ? 1 : 0
    score += frequencyFactor * this.config.frequency_weight

    // Workflow complexity factor (embedded in complexity_score, but boost for branching)
    if (factors.workflow_type === 'complex') {
      score += 0.1 // Small boost for complex workflows
    }

    return Math.min(score, 1.0)
  }

  /**
   * Create decision object with estimates
   */
  private createDecision(
    pattern: MCPPattern,
    factors: ApproachDecision['factors'],
    confidence: number,
    reasoning: string[]
  ): ApproachDecision {
    const decision: ApproachDecision = {
      pattern,
      confidence,
      reasoning,
      factors
    }

    // Estimate token savings if code-execution
    if (pattern === 'code-execution') {
      // Rough estimates based on complexity
      const baselineTokens = 100000 + factors.estimated_tools * 5000

      // First run: 40-60% reduction
      const firstRunTokens = baselineTokens * 0.5

      // With skills: 85-95% reduction
      const withSkillsTokens = baselineTokens * 0.1

      decision.estimated_token_savings = Math.round(
        factors.is_repeated ? withSkillsTokens : firstRunTokens
      )

      // Estimate cost ($3 per 1M input tokens, $15 per 1M output tokens)
      // Rough split: 80% input, 20% output
      const inputTokens = decision.estimated_token_savings * 0.8
      const outputTokens = decision.estimated_token_savings * 0.2
      decision.estimated_cost_per_run = inputTokens * 0.000003 + outputTokens * 0.000015
    }

    return decision
  }

  /**
   * Batch selection for multiple tasks
   */
  async selectApproachBatch(
    tasks: Array<{
      description: string
      context?: Parameters<typeof this.selectApproach>[1]
    }>
  ): Promise<ApproachDecision[]> {
    const decisions = await Promise.all(
      tasks.map(task => this.selectApproach(task.description, task.context))
    )
    return decisions
  }

  /**
   * Get statistics on pattern distribution
   */
  getPatternStats(decisions: ApproachDecision[]): {
    direct_count: number
    code_execution_count: number
    direct_percentage: number
    code_execution_percentage: number
    average_confidence: number
  } {
    const directCount = decisions.filter(d => d.pattern === 'direct').length
    const codeExecCount = decisions.filter(d => d.pattern === 'code-execution').length
    const total = decisions.length

    return {
      direct_count: directCount,
      code_execution_count: codeExecCount,
      direct_percentage: (directCount / total) * 100,
      code_execution_percentage: (codeExecCount / total) * 100,
      average_confidence: decisions.reduce((sum, d) => sum + d.confidence, 0) / total
    }
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<ApproachConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }

  /**
   * Get current configuration
   */
  getConfig(): ApproachConfig {
    return { ...this.config }
  }
}

// Export singleton instance
export const approachSelector = new ApproachSelector()

// Export for testing with custom config
export function createApproachSelector(config?: Partial<ApproachConfig>): ApproachSelector {
  return new ApproachSelector(config)
}
