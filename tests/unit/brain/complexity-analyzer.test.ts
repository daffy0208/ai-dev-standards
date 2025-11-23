/**
 * Tests for ComplexityAnalyzer
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { ComplexityAnalyzer } from '../../../scripts/brain/complexity-analyzer'

describe('ComplexityAnalyzer', () => {
  let analyzer: ComplexityAnalyzer

  beforeEach(() => {
    analyzer = new ComplexityAnalyzer()
  })

  describe('analyzeComplexity', () => {
    it('should identify simple tasks with low complexity', async () => {
      const result = await analyzer.analyzeComplexity(
        'Send a message to Slack channel #engineering'
      )

      expect(result.overall_score).toBeLessThan(4)
      expect(result.estimated_tools).toBe(1)
      expect(result.workflow_structure).toBe('linear')
    })

    it('should identify complex multi-tool tasks', async () => {
      const result = await analyzer.analyzeComplexity(
        'Copy document from Google Drive, analyze the content, create charts, then post summary to Notion and Slack'
      )

      expect(result.overall_score).toBeGreaterThan(3.5)
      expect(result.estimated_tools).toBeGreaterThan(3)
    })

    it('should detect conditional logic', async () => {
      const result = await analyzer.analyzeComplexity(
        'If the sales data shows decline, send alert to manager, otherwise generate standard report'
      )

      expect(result.has_conditionals).toBe(true)
      expect(result.workflow_structure).not.toBe('linear')
    })

    it('should detect iterative operations', async () => {
      const result = await analyzer.analyzeComplexity(
        'Process each file in the folder and validate the data'
      )

      expect(result.has_loops).toBe(true)
    })

    it('should detect error handling requirements', async () => {
      const result = await analyzer.analyzeComplexity(
        'Try to import data, and handle errors if the API fails'
      )

      expect(result.has_error_handling).toBe(true)
    })

    it('should identify multi-step workflows', async () => {
      const result = await analyzer.analyzeComplexity(
        'First fetch the data, then transform it, then validate, and finally save to database'
      )

      expect(result.estimated_steps).toBeGreaterThan(3)
      expect(result.breakdown.steps_score).toBeGreaterThan(5)
    })

    it('should detect data complexity', async () => {
      const result = await analyzer.analyzeComplexity(
        'Process large dataset with multiple transformations and complex filtering rules'
      )

      expect(result.data_complexity).not.toBe('simple')
    })
  })

  describe('analyzeComplexityBatch', () => {
    it('should analyze multiple tasks', async () => {
      const tasks = [
        'Simple task',
        'Complex task with multiple tools and conditions',
        'Another simple operation'
      ]

      const results = await analyzer.analyzeComplexityBatch(tasks)

      expect(results).toHaveLength(3)
      expect(results[1].overall_score).toBeGreaterThan(results[0].overall_score)
    })
  })

  describe('tool detection', () => {
    it('should detect Google Drive operations', async () => {
      const result = await analyzer.analyzeComplexity('Get document from Google Drive')

      expect(result.reasoning.some(r => r.includes('google-drive'))).toBe(true)
    })

    it('should detect multiple systems', async () => {
      const result = await analyzer.analyzeComplexity('Copy from Notion to Salesforce')

      expect(result.estimated_tools).toBe(2)
    })

    it('should handle generic multi-tool operations', async () => {
      const result = await analyzer.analyzeComplexity('Integrate data from multiple sources')

      expect(result.estimated_tools).toBeGreaterThanOrEqual(3)
    })
  })

  describe('workflow structure determination', () => {
    it('should identify linear workflows', async () => {
      const result = await analyzer.analyzeComplexity('Read file, process it, save result')

      expect(result.workflow_structure).toBe('linear')
    })

    it('should identify branching workflows', async () => {
      const result = await analyzer.analyzeComplexity(
        'Check if data is valid, if yes process normally, otherwise send error notification'
      )

      expect(result.workflow_structure).toBe('branching')
    })

    it('should identify complex workflows', async () => {
      const result = await analyzer.analyzeComplexity(
        'For each record, if condition A then do X, else if condition B do Y, and handle errors for each case'
      )

      expect(result.workflow_structure).toBe('complex')
      expect(result.has_conditionals).toBe(true)
      expect(result.has_loops).toBe(true)
    })
  })
})
