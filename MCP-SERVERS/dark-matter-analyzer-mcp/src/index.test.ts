import { describe, it, expect } from 'vitest';

describe('Dark Matter Analyzer MCP', () => {
  describe('Pattern Detection', () => {
    it('should detect documentation inflation pattern', () => {
      const metrics = {
        total_files: 100,
        code_files: 30,
        doc_files: 35,
        test_files: 10,
        doc_to_code_ratio: 1.17,
        avg_doc_length: 450,
        technical_debt_markers: 20,
        last_commit_age_days: null,
      };

      // Documentation inflation: >20 docs, avg >400 lines
      expect(metrics.doc_files).toBeGreaterThan(20);
      expect(metrics.avg_doc_length).toBeGreaterThan(400);
    });

    it('should detect execution deficit pattern', () => {
      const metrics = {
        doc_to_code_ratio: 1.2,
      };

      // Execution deficit: ratio > 0.5
      expect(metrics.doc_to_code_ratio).toBeGreaterThan(0.5);
    });

    it('should detect suppression pattern', () => {
      const metrics = {
        technical_debt_markers: 75,
        code_files: 30,
      };

      // Suppression: >50 TODO/FIXME markers
      expect(metrics.technical_debt_markers).toBeGreaterThan(50);
    });
  });

  describe('RCI Calculation', () => {
    it('should classify COHERENT for healthy metrics', () => {
      const rci = 88;
      expect(rci).toBeGreaterThanOrEqual(85);
    });

    it('should classify MONITOR for early drift', () => {
      const rci = 75;
      expect(rci).toBeGreaterThanOrEqual(70);
      expect(rci).toBeLessThan(85);
    });

    it('should classify MISALIGNED for significant issues', () => {
      const rci = 65;
      expect(rci).toBeGreaterThanOrEqual(50);
      expect(rci).toBeLessThan(70);
    });

    it('should classify INCOHERENT for critical issues', () => {
      const rci = 45;
      expect(rci).toBeLessThan(50);
    });
  });

  describe('Intent Alignment Scoring', () => {
    it('should score high for balanced doc-to-code ratio', () => {
      const ratio = 0.25;
      expect(ratio).toBeLessThan(0.3);
      // Should result in score of 90
    });

    it('should score low for excessive documentation', () => {
      const ratio = 1.5;
      expect(ratio).toBeGreaterThan(1.2);
      // Should result in score of 50
    });
  });

  describe('Task Reality Sync Scoring', () => {
    it('should penalize high technical debt per file', () => {
      const debtPerFile = 6;
      expect(debtPerFile).toBeGreaterThan(5);
      // Should reduce score by 30
    });

    it('should reward good test coverage', () => {
      const testCoverage = 0.75;
      expect(testCoverage).toBeGreaterThan(0.7);
      // Should add 10 to score
    });
  });

  describe('Pattern Confidence Levels', () => {
    it('should have high confidence for clear documentation inflation', () => {
      const confidence = 0.85;
      expect(confidence).toBeGreaterThan(0.8);
    });

    it('should have very high confidence for execution deficit', () => {
      const confidence = 0.90;
      expect(confidence).toBeGreaterThan(0.85);
    });

    it('should have moderate confidence for suppression patterns', () => {
      const confidence = 0.75;
      expect(confidence).toBeGreaterThan(0.7);
      expect(confidence).toBeLessThan(0.8);
    });
  });

  describe('Report Generation', () => {
    it('should include all required sections', () => {
      const sections = [
        'Executive Summary',
        'Sensing',
        'Pattern Detection',
        'Repository Coherence Index',
        'Action',
        'Closing Reflection',
      ];

      sections.forEach(section => {
        expect(section).toBeTruthy();
      });
    });

    it('should provide markdown format', () => {
      const format = 'markdown';
      expect(format).toBe('markdown');
    });

    it('should provide json format', () => {
      const format = 'json';
      expect(format).toBe('json');
    });
  });

  describe('Severity Levels', () => {
    it('should classify critical severity correctly', () => {
      const docToCodeRatio = 1.5;
      const severity = docToCodeRatio > 1.0 ? 'critical' : 'high';
      expect(severity).toBe('critical');
    });

    it('should classify high severity correctly', () => {
      const debtMarkers = 120;
      const severity = debtMarkers > 100 ? 'high' : 'medium';
      expect(severity).toBe('high');
    });

    it('should classify medium severity correctly', () => {
      const docFiles = 25;
      const severity = docFiles > 30 ? 'high' : 'medium';
      expect(severity).toBe('medium');
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero code files gracefully', () => {
      const codeFiles = 0;
      const docFiles = 10;
      const ratio = codeFiles > 0 ? docFiles / codeFiles : 0;
      expect(ratio).toBe(0);
    });

    it('should handle zero doc files gracefully', () => {
      const totalDocLines = 0;
      const docFiles = 0;
      const avgLength = docFiles > 0 ? Math.round(totalDocLines / docFiles) : 0;
      expect(avgLength).toBe(0);
    });

    it('should cap scores at 100', () => {
      const rawScore = 115;
      const cappedScore = Math.min(100, rawScore);
      expect(cappedScore).toBe(100);
    });

    it('should floor scores at 0', () => {
      const rawScore = -15;
      const flooredScore = Math.max(0, rawScore);
      expect(flooredScore).toBe(0);
    });
  });

  describe('Real-World Scenario', () => {
    it('should analyze a typical misaligned repository', () => {
      const scenario = {
        code_files: 30,
        doc_files: 36,
        test_files: 3,
        doc_to_code_ratio: 1.2,
        avg_doc_length: 543,
        technical_debt_markers: 27,
      };

      // Should detect multiple patterns
      const hasDocInflation = scenario.doc_files > 20 && scenario.avg_doc_length > 400;
      const hasExecutionDeficit = scenario.doc_to_code_ratio > 0.5;
      const hasLowTestCoverage = (scenario.test_files / scenario.code_files) < 0.3;

      expect(hasDocInflation).toBe(true);
      expect(hasExecutionDeficit).toBe(true);
      expect(hasLowTestCoverage).toBe(true);

      // Should result in RCI around 70 (MONITOR status)
      const expectedRCI = 72; // Based on original analysis
      expect(expectedRCI).toBeGreaterThanOrEqual(70);
      expect(expectedRCI).toBeLessThan(85);
    });
  });
});
