/**
 * Pattern Router: Routes MCP execution to appropriate pattern based on analysis
 *
 * Uses ApproachSelector to decide between Direct MCP and Code Execution,
 * then routes the execution accordingly.
 *
 * @module pattern-router
 */

import { ApproachSelector, ApproachDecision, MCPPattern } from './approach-selector'

export interface RoutingContext {
  task_description: string
  is_realtime?: boolean
  expected_frequency?: 'once' | 'occasional' | 'frequent' | 'continuous'
  has_pii?: boolean
  data_size_estimate_kb?: number
  force_pattern?: MCPPattern // Override automatic selection
}

export interface RoutingResult {
  pattern_used: MCPPattern
  decision: ApproachDecision
  execution_path: 'direct-mcp' | 'code-execution'
  timestamp: string
  performance_metrics?: {
    decision_time_ms: number
    execution_time_ms?: number
    tokens_used?: number
  }
}

export interface PatternStats {
  total_routes: number
  direct_mcp_routes: number
  code_execution_routes: number
  forced_routes: number
  average_decision_time_ms: number
  pattern_distribution: {
    direct_percentage: number
    code_execution_percentage: number
  }
}

export class PatternRouter {
  private selector: ApproachSelector
  private stats: {
    total: number
    direct: number
    codeExecution: number
    forced: number
    totalDecisionTime: number
  }

  constructor(selector?: ApproachSelector) {
    this.selector = selector || new ApproachSelector()
    this.stats = {
      total: 0,
      direct: 0,
      codeExecution: 0,
      forced: 0,
      totalDecisionTime: 0
    }
  }

  /**
   * Route a task to the appropriate MCP pattern
   */
  async route(context: RoutingContext): Promise<RoutingResult> {
    const startTime = Date.now()

    // If pattern is forced, use it
    if (context.force_pattern) {
      this.stats.forced++
      const decision = await this.selector.selectApproach(context.task_description, {
        is_realtime: context.is_realtime,
        expected_frequency: context.expected_frequency,
        has_pii: context.has_pii,
        data_size_estimate_kb: context.data_size_estimate_kb
      })

      // Override decision pattern
      decision.pattern = context.force_pattern
      decision.reasoning.unshift(`Pattern manually forced to: ${context.force_pattern}`)

      return this.createResult(context.force_pattern, decision, startTime)
    }

    // Automatic pattern selection
    const decision = await this.selector.selectApproach(context.task_description, {
      is_realtime: context.is_realtime,
      expected_frequency: context.expected_frequency,
      has_pii: context.has_pii,
      data_size_estimate_kb: context.data_size_estimate_kb
    })

    return this.createResult(decision.pattern, decision, startTime)
  }

  /**
   * Create routing result and update stats
   */
  private createResult(
    pattern: MCPPattern,
    decision: ApproachDecision,
    startTime: number
  ): RoutingResult {
    const decisionTime = Date.now() - startTime

    // Update stats
    this.stats.total++
    this.stats.totalDecisionTime += decisionTime
    if (pattern === 'direct') {
      this.stats.direct++
    } else {
      this.stats.codeExecution++
    }

    return {
      pattern_used: pattern,
      decision,
      execution_path: pattern === 'direct' ? 'direct-mcp' : 'code-execution',
      timestamp: new Date().toISOString(),
      performance_metrics: {
        decision_time_ms: decisionTime
      }
    }
  }

  /**
   * Batch route multiple tasks
   */
  async routeBatch(contexts: RoutingContext[]): Promise<RoutingResult[]> {
    return Promise.all(contexts.map(ctx => this.route(ctx)))
  }

  /**
   * Get routing statistics
   */
  getStats(): PatternStats {
    const total = this.stats.total || 1 // Avoid division by zero

    return {
      total_routes: this.stats.total,
      direct_mcp_routes: this.stats.direct,
      code_execution_routes: this.stats.codeExecution,
      forced_routes: this.stats.forced,
      average_decision_time_ms: this.stats.totalDecisionTime / total,
      pattern_distribution: {
        direct_percentage: (this.stats.direct / total) * 100,
        code_execution_percentage: (this.stats.codeExecution / total) * 100
      }
    }
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.stats = {
      total: 0,
      direct: 0,
      codeExecution: 0,
      forced: 0,
      totalDecisionTime: 0
    }
  }

  /**
   * Export stats to JSON
   */
  exportStats(): string {
    return JSON.stringify(
      {
        ...this.getStats(),
        timestamp: new Date().toISOString()
      },
      null,
      2
    )
  }

  /**
   * Get pattern recommendation without routing
   */
  async getRecommendation(context: RoutingContext): Promise<ApproachDecision> {
    return this.selector.selectApproach(context.task_description, {
      is_realtime: context.is_realtime,
      expected_frequency: context.expected_frequency,
      has_pii: context.has_pii,
      data_size_estimate_kb: context.data_size_estimate_kb
    })
  }

  /**
   * Validate routing decision against actual execution metrics
   */
  async validateDecision(
    routingResult: RoutingResult,
    actualMetrics: {
      tokens_used: number
      execution_time_ms: number
      success: boolean
      error?: string
    }
  ): Promise<{
    was_optimal: boolean
    reasoning: string[]
    suggested_improvement?: string
  }> {
    const { pattern_used, decision } = routingResult
    const reasoning: string[] = []

    // If code-execution was chosen, check if token savings were realized
    if (pattern_used === 'code-execution') {
      const estimatedSavings = decision.estimated_token_savings || 0
      const actualTokens = actualMetrics.tokens_used

      if (actualTokens > estimatedSavings * 1.5) {
        reasoning.push(
          `Token usage higher than expected: ${actualTokens} vs ${estimatedSavings} estimated`
        )
        reasoning.push('Code Execution may not have been optimal for this task')

        return {
          was_optimal: false,
          reasoning,
          suggested_improvement: 'Consider using Direct MCP for similar tasks'
        }
      }

      reasoning.push(`Token savings achieved: ~${estimatedSavings} tokens used`)
    }

    // Check execution time
    if (actualMetrics.execution_time_ms > 10000 && pattern_used === 'direct') {
      reasoning.push('Long execution time detected')
      reasoning.push('Code Execution might offer better performance for this workflow')

      return {
        was_optimal: false,
        reasoning,
        suggested_improvement: 'Consider migrating this workflow to Code Execution pattern'
      }
    }

    // Check for errors
    if (!actualMetrics.success) {
      reasoning.push(`Execution failed: ${actualMetrics.error || 'Unknown error'}`)
      reasoning.push('Pattern selection was appropriate, but execution encountered errors')

      return {
        was_optimal: true, // Pattern was fine, execution had other issues
        reasoning
      }
    }

    // All looks good
    reasoning.push('Pattern selection was appropriate')
    reasoning.push(`Execution completed successfully in ${actualMetrics.execution_time_ms}ms`)

    return {
      was_optimal: true,
      reasoning
    }
  }

  /**
   * Learn from routing history (placeholder for ML integration)
   */
  async learnFromHistory(
    history: Array<{
      context: RoutingContext
      result: RoutingResult
      metrics: Parameters<typeof this.validateDecision>[1]
    }>
  ): Promise<{
    patterns_identified: number
    accuracy: number
    recommendations: string[]
  }> {
    // Placeholder for future ML-based learning
    // This could:
    // 1. Identify common task patterns
    // 2. Learn optimal thresholds
    // 3. Adjust weights based on actual performance
    // 4. Suggest new routing rules

    const validations = await Promise.all(
      history.map(h => this.validateDecision(h.result, h.metrics))
    )

    const optimalCount = validations.filter(v => v.was_optimal).length
    const accuracy = (optimalCount / validations.length) * 100

    const recommendations: string[] = []
    if (accuracy < 70) {
      recommendations.push('Pattern selection accuracy is below 70%')
      recommendations.push('Consider adjusting decision thresholds')
      recommendations.push('Review failed decisions for patterns')
    }

    return {
      patterns_identified: history.length,
      accuracy,
      recommendations
    }
  }
}

// Export singleton instance
export const patternRouter = new PatternRouter()

// Export for testing with custom selector
export function createPatternRouter(selector?: ApproachSelector): PatternRouter {
  return new PatternRouter(selector)
}

// Helper function for simple routing
export async function routeTask(
  taskDescription: string,
  context?: Omit<RoutingContext, 'task_description'>
): Promise<RoutingResult> {
  return patternRouter.route({
    task_description: taskDescription,
    ...context
  })
}
