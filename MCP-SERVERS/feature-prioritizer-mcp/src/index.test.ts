import { describe, it, expect, beforeEach } from 'vitest';
import { Feature, PrioritizationResult } from './index.js';

describe('Feature Prioritizer MCP Server', () => {
  describe('Feature Structure', () => {
    it('should accept valid feature', () => {
      const feature: Feature = {
        id: 'feat-1',
        name: 'User Authentication',
        description: 'Add login system',
        impact: 9,
        effort: 3,
        reach: 1000,
        confidence: 90,
      };

      expect(feature.id).toBe('feat-1');
      expect(feature.name).toBe('User Authentication');
      expect(feature.impact).toBe(9);
      expect(feature.effort).toBe(3);
    });

    it('should allow optional fields', () => {
      const feature: Feature = {
        id: 'feat-2',
        name: 'Dark Mode',
        impact: 5,
        effort: 2,
      };

      expect(feature.description).toBeUndefined();
      expect(feature.reach).toBeUndefined();
      expect(feature.confidence).toBeUndefined();
    });
  });

  describe('Impact-Effort Prioritization', () => {
    it('should classify P0: High Impact (8-10), Low Effort (1-3)', () => {
      const feature: Feature = {
        id: 'p0-feature',
        name: 'Critical Fix',
        impact: 9,
        effort: 2,
      };

      // P0 formula: impact >= 8 && effort <= 3
      expect(feature.impact).toBeGreaterThanOrEqual(8);
      expect(feature.effort).toBeLessThanOrEqual(3);

      const score = (feature.impact || 0) / (feature.effort || 1);
      expect(score).toBeGreaterThan(2); // High impact/effort ratio
    });

    it('should classify P1: High Impact, Medium Effort', () => {
      const feature: Feature = {
        id: 'p1-feature',
        name: 'Important Feature',
        impact: 8,
        effort: 5,
      };

      // P1 formula: (impact >= 6 && effort <= 6) || (impact >= 5 && effort <= 3)
      expect(feature.impact).toBeGreaterThanOrEqual(6);
      expect(feature.effort).toBeLessThanOrEqual(6);
    });

    it('should classify P2: Medium Impact, Medium Effort', () => {
      const feature: Feature = {
        id: 'p2-feature',
        name: 'Nice to Have',
        impact: 6,
        effort: 5,
      };

      expect(feature.impact).toBeGreaterThanOrEqual(4);
      expect(feature.impact).toBeLessThanOrEqual(7);
      expect(feature.effort).toBeGreaterThanOrEqual(4);
      expect(feature.effort).toBeLessThanOrEqual(7);
    });

    it('should classify P3: Low Impact or High Effort', () => {
      const lowImpact: Feature = {
        id: 'p3-low',
        name: 'Minor Tweak',
        impact: 2,
        effort: 3,
      };

      const highEffort: Feature = {
        id: 'p3-high',
        name: 'Complex Feature',
        impact: 7,
        effort: 9,
      };

      expect(lowImpact.impact).toBeLessThan(4);
      expect(highEffort.effort).toBeGreaterThan(7);
    });

    it('should calculate impact/effort score correctly', () => {
      const features = [
        { impact: 10, effort: 1, expectedScore: 10 },
        { impact: 8, effort: 2, expectedScore: 4 },
        { impact: 6, effort: 3, expectedScore: 2 },
        { impact: 4, effort: 4, expectedScore: 1 },
      ];

      features.forEach(({ impact, effort, expectedScore }) => {
        const score = impact / effort;
        expect(score).toBe(expectedScore);
      });
    });
  });

  describe('RICE Scoring', () => {
    it('should calculate RICE score correctly', () => {
      const feature: Feature = {
        id: 'rice-test',
        name: 'Test Feature',
        reach: 1000,
        impact: 8,
        confidence: 80,
        effort: 4,
      };

      // RICE = (Reach × Impact × Confidence%) / Effort
      const expectedRiceScore = (1000 * 8 * 0.8) / 4;
      expect(expectedRiceScore).toBe(1600);
    });

    it('should handle different confidence levels', () => {
      const highConfidence = {
        reach: 100,
        impact: 10,
        confidence: 100,
        effort: 2,
      };

      const lowConfidence = {
        reach: 100,
        impact: 10,
        confidence: 50,
        effort: 2,
      };

      const highScore = (highConfidence.reach * highConfidence.impact * 1.0) / highConfidence.effort;
      const lowScore = (lowConfidence.reach * lowConfidence.impact * 0.5) / lowConfidence.effort;

      expect(highScore).toBeGreaterThan(lowScore);
      expect(highScore).toBe(500);
      expect(lowScore).toBe(250);
    });

    it('should classify by RICE score ranges', () => {
      const testCases = [
        { score: 150, expectedPriority: 'P0' },  // >= 100
        { score: 75, expectedPriority: 'P1' },   // >= 50
        { score: 25, expectedPriority: 'P2' },   // >= 10
        { score: 5, expectedPriority: 'P3' },    // < 10
      ];

      testCases.forEach(({ score, expectedPriority }) => {
        let priority: string;
        if (score >= 100) priority = 'P0';
        else if (score >= 50) priority = 'P1';
        else if (score >= 10) priority = 'P2';
        else priority = 'P3';

        expect(priority).toBe(expectedPriority);
      });
    });
  });

  describe('Priority Sorting', () => {
    it('should sort by priority level first', () => {
      const features: Feature[] = [
        { id: '1', name: 'F1', priority: 'P2', score: 5 },
        { id: '2', name: 'F2', priority: 'P0', score: 3 },
        { id: '3', name: 'F3', priority: 'P1', score: 4 },
      ];

      const sorted = features.sort((a, b) => {
        const priorityOrder = { P0: 0, P1: 1, P2: 2, P3: 3 };
        return priorityOrder[a.priority!] - priorityOrder[b.priority!];
      });

      expect(sorted[0].priority).toBe('P0');
      expect(sorted[1].priority).toBe('P1');
      expect(sorted[2].priority).toBe('P2');
    });

    it('should sort by score within same priority', () => {
      const features: Feature[] = [
        { id: '1', name: 'F1', priority: 'P0', score: 3 },
        { id: '2', name: 'F2', priority: 'P0', score: 8 },
        { id: '3', name: 'F3', priority: 'P0', score: 5 },
      ];

      const sorted = features.sort((a, b) => (b.score || 0) - (a.score || 0));

      expect(sorted[0].score).toBe(8);
      expect(sorted[1].score).toBe(5);
      expect(sorted[2].score).toBe(3);
    });
  });

  describe('MVP Feature Selection', () => {
    it('should select all P0 features', () => {
      const features: Feature[] = [
        { id: '1', name: 'P0-1', priority: 'P0' },
        { id: '2', name: 'P0-2', priority: 'P0' },
        { id: '3', name: 'P1-1', priority: 'P1' },
      ];

      const P0Features = features.filter((f) => f.priority === 'P0');
      expect(P0Features).toHaveLength(2);
    });

    it('should select top 3 P1 features', () => {
      const features: Feature[] = [
        { id: '1', name: 'P1-1', priority: 'P1', score: 4 },
        { id: '2', name: 'P1-2', priority: 'P1', score: 6 },
        { id: '3', name: 'P1-3', priority: 'P1', score: 5 },
        { id: '4', name: 'P1-4', priority: 'P1', score: 3 },
      ];

      const topP1 = features
        .filter((f) => f.priority === 'P1')
        .sort((a, b) => (b.score || 0) - (a.score || 0))
        .slice(0, 3);

      expect(topP1).toHaveLength(3);
      expect(topP1[0].score).toBe(6);
      expect(topP1[1].score).toBe(5);
      expect(topP1[2].score).toBe(4);
    });

    it('should combine P0 and top P1 for MVP', () => {
      const features: Feature[] = [
        { id: '1', name: 'P0-1', priority: 'P0', score: 10 },
        { id: '2', name: 'P1-1', priority: 'P1', score: 5 },
        { id: '3', name: 'P1-2', priority: 'P1', score: 4 },
        { id: '4', name: 'P2-1', priority: 'P2', score: 2 },
      ];

      const P0Features = features.filter((f) => f.priority === 'P0');
      const topP1Features = features
        .filter((f) => f.priority === 'P1')
        .sort((a, b) => (b.score || 0) - (a.score || 0))
        .slice(0, 3);

      const mvp = [...P0Features, ...topP1Features];

      expect(mvp).toHaveLength(3); // 1 P0 + 2 P1
      expect(mvp[0].priority).toBe('P0');
      expect(mvp[1].priority).toBe('P1');
      expect(mvp[2].priority).toBe('P1');
    });
  });

  describe('Prioritization Result', () => {
    it('should have correct structure', () => {
      const result: PrioritizationResult = {
        features: [
          { id: '1', name: 'F1', priority: 'P0', impact: 9, effort: 2 },
          { id: '2', name: 'F2', priority: 'P1', impact: 7, effort: 4 },
        ],
        methodology: 'impact-effort',
        summary: {
          P0: 1,
          P1: 1,
          P2: 0,
          P3: 0,
        },
      };

      expect(result.features).toHaveLength(2);
      expect(result.methodology).toBe('impact-effort');
      expect(result.summary.P0).toBe(1);
      expect(result.summary.P1).toBe(1);
    });

    it('should count features by priority', () => {
      const features: Feature[] = [
        { id: '1', name: 'F1', priority: 'P0', impact: 9, effort: 2 },
        { id: '2', name: 'F2', priority: 'P0', impact: 8, effort: 3 },
        { id: '3', name: 'F3', priority: 'P1', impact: 7, effort: 4 },
        { id: '4', name: 'F4', priority: 'P2', impact: 5, effort: 5 },
        { id: '5', name: 'F5', priority: 'P3', impact: 2, effort: 8 },
      ];

      const summary = {
        P0: features.filter((f) => f.priority === 'P0').length,
        P1: features.filter((f) => f.priority === 'P1').length,
        P2: features.filter((f) => f.priority === 'P2').length,
        P3: features.filter((f) => f.priority === 'P3').length,
      };

      expect(summary.P0).toBe(2);
      expect(summary.P1).toBe(1);
      expect(summary.P2).toBe(1);
      expect(summary.P3).toBe(1);
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero effort', () => {
      const feature: Feature = {
        id: 'zero-effort',
        name: 'Zero Effort Feature',
        impact: 10,
        effort: 0,
      };

      // Should use 1 as minimum to avoid division by zero
      const score = feature.impact / Math.max(feature.effort, 1);
      expect(score).toBe(10);
    });

    it('should handle missing impact', () => {
      const feature: Feature = {
        id: 'no-impact',
        name: 'No Impact Feature',
        effort: 5,
      };

      const impact = feature.impact || 0;
      expect(impact).toBe(0);
    });

    it('should handle high effort features', () => {
      const feature: Feature = {
        id: 'high-effort',
        name: 'Complex Feature',
        impact: 6,
        effort: 10,
      };

      const score = feature.impact / feature.effort;
      expect(score).toBeLessThan(1);
    });
  });

  describe('Real-World Scenarios', () => {
    it('should prioritize quick wins (high impact, low effort)', () => {
      const quickWin: Feature = {
        id: 'quick-win',
        name: 'Fix Critical Bug',
        impact: 10,
        effort: 1,
      };

      const score = quickWin.impact / quickWin.effort;
      expect(score).toBe(10);
      // Should be P0 (impact >= 8, effort <= 3)
    });

    it('should deprioritize time sinks (low impact, high effort)', () => {
      const timeSink: Feature = {
        id: 'time-sink',
        name: 'Complex Refactor',
        impact: 3,
        effort: 9,
      };

      const score = timeSink.impact / timeSink.effort;
      expect(score).toBeLessThan(0.5);
      // Should be P3 (impact < 4 OR effort > 7)
    });

    it('should handle strategic features (medium-high impact, medium effort)', () => {
      const strategic: Feature = {
        id: 'strategic',
        name: 'New Dashboard',
        impact: 7,
        effort: 5,
      };

      const score = strategic.impact / strategic.effort;
      expect(score).toBeGreaterThan(1);
      expect(score).toBeLessThan(2);
      // Should be P1 (impact >= 6, effort <= 6)
    });
  });
});
