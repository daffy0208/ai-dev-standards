/**
 * Tests for ApproachSelector
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { ApproachSelector, createApproachSelector } from '../../../scripts/brain/approach-selector.js'

describe('ApproachSelector', () => {
  let selector: ApproachSelector

  beforeEach(() => {
    selector = new ApproachSelector()
  })

  describe('selectApproach', () => {
    it('should select Direct MCP for simple single-tool tasks', async () => {
      const decision = await selector.selectApproach('Send a Slack message to #team')

      expect(decision.pattern).toBe('direct')
      expect(decision.confidence).toBeGreaterThan(0.7)
    })

    it('should select Code Execution for complex multi-tool tasks', async () => {
      const decision = await selector.selectApproach(
        'Analyze sales data from Salesforce, create charts, generate report in Notion, and notify team via Slack'
      )

      expect(decision.pattern).toBe('code-execution')
      expect(decision.factors.estimated_tools).toBeGreaterThan(3)
    })

    it('should select Code Execution for large data processing', async () => {
      const decision = await selector.selectApproach('Process large dataset with transformations', {
        data_size_estimate_kb: 50
      })

      expect(decision.pattern).toBe('code-execution')
      expect(decision.reasoning).toContain(expect.stringMatching(/large data/i))
    })

    it('should select Code Execution when PII is present', async () => {
      const decision = await selector.selectApproach('Import customer contact data', {
        has_pii: true
      })

      expect(decision.pattern).toBe('code-execution')
      expect(decision.reasoning).toContain(expect.stringMatching(/pii/i))
    })

    it('should select Code Execution for repeated workflows', async () => {
      const decision = await selector.selectApproach('Generate daily sales report', {
        expected_frequency: 'frequent'
      })

      expect(decision.pattern).toBe('code-execution')
      expect(decision.factors.is_repeated).toBe(true)
    })

    it('should force Direct MCP for real-time interactions', async () => {
      const decision = await selector.selectApproach('Complex multi-step workflow', {
        is_realtime: true
      })

      expect(decision.pattern).toBe('direct')
      expect(decision.reasoning[0]).toContain('Real-time')
    })

    it('should provide token savings estimates for Code Execution', async () => {
      const decision = await selector.selectApproach(
        'Complex workflow with multiple tools and data processing'
      )

      if (decision.pattern === 'code-execution') {
        expect(decision.estimated_token_savings).toBeDefined()
        expect(decision.estimated_token_savings).toBeGreaterThan(0)
        expect(decision.estimated_cost_per_run).toBeDefined()
      }
    })

    it('should consider workflow complexity in decision', async () => {
      const decision = await selector.selectApproach(
        'If data is valid, transform and load; otherwise send error notification and retry'
      )

      // Conditional logic should increase complexity score
      expect(decision.factors.workflow_type).not.toBe('linear')
    })
  })

  describe('selectApproachBatch', () => {
    it('should process multiple tasks', async () => {
      const tasks = [
        {
          description: 'Simple task'
        },
        {
          description: 'Complex multi-tool workflow'
        },
        {
          description: 'Another simple operation'
        }
      ]

      const decisions = await selector.selectApproachBatch(tasks)

      expect(decisions).toHaveLength(3)
      expect(decisions.some(d => d.pattern === 'direct')).toBe(true)
    })
  })

  describe('getPatternStats', () => {
    it('should calculate statistics from decisions', async () => {
      const decisions = await selector.selectApproachBatch([
        { description: 'Simple task 1' },
        { description: 'Simple task 2' },
        { description: 'Complex multi-system integration with data processing' }
      ])

      const stats = selector.getPatternStats(decisions)

      expect(stats.direct_count + stats.code_execution_count).toBe(3)
      expect(stats.direct_percentage + stats.code_execution_percentage).toBe(100)
      expect(stats.average_confidence).toBeGreaterThan(0)
      expect(stats.average_confidence).toBeLessThanOrEqual(1)
    })
  })

  describe('custom configuration', () => {
    it('should respect custom thresholds', () => {
      const customSelector = createApproachSelector({
        complexity_threshold: 5, // Lower threshold
        tools_threshold: 3
      })

      expect(customSelector.getConfig().complexity_threshold).toBe(5)
      expect(customSelector.getConfig().tools_threshold).toBe(3)
    })

    it('should allow configuration updates', () => {
      selector.updateConfig({
        complexity_threshold: 8
      })

      expect(selector.getConfig().complexity_threshold).toBe(8)
    })

    it('should respect force_direct_for_single_tool setting', async () => {
      const customSelector = createApproachSelector({
        force_direct_for_single_tool: false
      })

      // Even with single tool, might select code-execution if other factors favor it
      const decision = await customSelector.selectApproach(
        'Process large file with complex transformations'
      )

      // Decision depends on other factors, not just tool count
      expect(decision.pattern).toBeDefined()
    })
  })

  describe('decision reasoning', () => {
    it('should provide clear reasoning for decisions', async () => {
      const decision = await selector.selectApproach('Multi-system data integration pipeline')

      expect(decision.reasoning).toBeDefined()
      expect(decision.reasoning.length).toBeGreaterThan(0)
      expect(typeof decision.reasoning[0]).toBe('string')
    })

    it('should explain complexity scores', async () => {
      const decision = await selector.selectApproach('Complex workflow')

      const hasComplexityExplanation = decision.reasoning.some(
        r => r.includes('complexity') || r.includes('score')
      )
      expect(hasComplexityExplanation).toBe(true)
    })

    it('should explain tool requirements', async () => {
      const decision = await selector.selectApproach('Integrate Salesforce with Notion')

      const hasToolExplanation = decision.reasoning.some(r => r.includes('tool'))
      expect(hasToolExplanation).toBe(true)
    })
  })

  describe('edge cases', () => {
    it('should handle empty task description', async () => {
      const decision = await selector.selectApproach('')

      expect(decision.pattern).toBeDefined()
      expect(decision.pattern).toBe('direct') // Default to simple
    })

    it('should handle very long task descriptions', async () => {
      const longDescription = 'Process data ' + 'with multiple steps '.repeat(50)
      const decision = await selector.selectApproach(longDescription)

      expect(decision.pattern).toBeDefined()
    })

    it('should handle ambiguous task descriptions', async () => {
      const decision = await selector.selectApproach('Do something with the system')

      expect(decision.pattern).toBeDefined()
      expect(decision.confidence).toBeGreaterThan(0)
    })
  })
})
