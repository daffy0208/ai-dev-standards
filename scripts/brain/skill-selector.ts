/**
 * LAYER 3: SKILL SELECTOR
 *
 * Advanced skill selection engine with scoring algorithms.
 * Analyzes task descriptions and recommends optimal skills.
 */

import { Skill } from './knowledge-layer';

export interface SkillScore {
  skill: string;
  score: number;
  matchReasons: string[];
  confidence: 'high' | 'medium' | 'low';
}

export interface SkillSelection {
  primary: string[];
  secondary: string[];
  optional: string[];
  reasoning: string;
  confidence: number;
}

export class SkillSelector {
  private skills: Skill[];

  constructor(skills: Skill[]) {
    this.skills = skills;
  }

  /**
   * Select skills for a task with detailed scoring
   */
  select(taskDescription: string): SkillSelection {
    const lowerTask = taskDescription.toLowerCase();

    // Score all skills
    const scored = this.scoreAllSkills(lowerTask);

    // Sort by score
    scored.sort((a, b) => b.score - a.score);

    // Categorize skills
    const primary = scored
      .filter(s => s.score >= 15 && s.confidence === 'high')
      .slice(0, 3)
      .map(s => s.skill);

    const secondary = scored
      .filter(s => s.score >= 8 && s.score < 15 && (s.confidence === 'high' || s.confidence === 'medium'))
      .slice(0, 3)
      .map(s => s.skill);

    const optional = scored
      .filter(s => s.score >= 3 && s.score < 8)
      .slice(0, 3)
      .map(s => s.skill);

    // Calculate overall confidence
    const avgScore = primary.length > 0
      ? scored.filter(s => primary.includes(s.skill)).reduce((sum, s) => sum + s.score, 0) / primary.length
      : 0;
    const confidence = Math.min(100, Math.round((avgScore / 30) * 100));

    // Generate reasoning
    const reasoning = this.generateReasoning(primary, scored);

    return {
      primary,
      secondary,
      optional,
      reasoning,
      confidence
    };
  }

  /**
   * Score all skills against task description
   */
  private scoreAllSkills(taskDescription: string): SkillScore[] {
    return this.skills.map(skill => this.scoreSkill(skill, taskDescription));
  }

  /**
   * Score a single skill with detailed reasoning
   */
  private scoreSkill(skill: Skill, taskDescription: string): SkillScore {
    let score = 0;
    const matchReasons: string[] = [];

    // Rule 1: Trigger matching (highest priority)
    for (const trigger of skill.triggers) {
      if (taskDescription.includes(trigger.toLowerCase())) {
        score += 15;
        matchReasons.push(`Trigger match: "${trigger}"`);
      } else if (this.fuzzyMatch(taskDescription, trigger.toLowerCase())) {
        score += 8;
        matchReasons.push(`Fuzzy trigger match: "${trigger}"`);
      }
    }

    // Rule 2: Name matching
    if (taskDescription.includes(skill.name.toLowerCase())) {
      score += 10;
      matchReasons.push(`Skill name in task: "${skill.name}"`);
    } else if (this.fuzzyMatch(taskDescription, skill.name.toLowerCase())) {
      score += 5;
      matchReasons.push(`Fuzzy name match: "${skill.name}"`);
    }

    // Rule 3: Description keyword matching
    const descWords = skill.description.toLowerCase().split(/\s+/);
    const taskWords = taskDescription.split(/\s+/);
    let descMatchCount = 0;

    for (const taskWord of taskWords) {
      if (taskWord.length > 3 && descWords.includes(taskWord)) {
        score += 1;
        descMatchCount++;
      }
    }

    if (descMatchCount > 0) {
      matchReasons.push(`${descMatchCount} description keyword matches`);
    }

    // Rule 4: Category bonus
    const categoryKeywords: Record<string, string[]> = {
      'product-development': ['product', 'mvp', 'launch', 'market'],
      'ai-native': ['ai', 'rag', 'agent', 'llm', 'knowledge'],
      'technical': ['api', 'frontend', 'backend', 'implement'],
      'infrastructure': ['deploy', 'performance', 'optimize', 'scale'],
      'ux-design': ['design', 'ux', 'ui', 'user'],
      'security': ['security', 'secure', 'auth', 'vulnerability']
    };

    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      if (skill.category === category) {
        for (const keyword of keywords) {
          if (taskDescription.includes(keyword)) {
            score += 2;
            matchReasons.push(`Category match: ${category}`);
            break;
          }
        }
      }
    }

    // Rule 5: Tag matching
    for (const tag of skill.tags) {
      if (taskDescription.includes(tag.toLowerCase())) {
        score += 3;
        matchReasons.push(`Tag match: "${tag}"`);
      }
    }

    // Determine confidence
    let confidence: 'high' | 'medium' | 'low' = 'low';
    if (score >= 15) {
      confidence = 'high';
    } else if (score >= 8) {
      confidence = 'medium';
    }

    return {
      skill: skill.name,
      score,
      matchReasons,
      confidence
    };
  }

  /**
   * Fuzzy string matching
   */
  private fuzzyMatch(text: string, pattern: string): boolean {
    const words = pattern.split(/[\s-]+/);
    return words.every(word => text.includes(word));
  }

  /**
   * Generate reasoning explanation
   */
  private generateReasoning(primarySkills: string[], allScored: SkillScore[]): string {
    if (primarySkills.length === 0) {
      return 'No strong matches found. Task description may be too vague or requires clarification.';
    }

    const topSkill = primarySkills[0];
    const topScore = allScored.find(s => s.skill === topSkill);

    if (!topScore) {
      return `Selected ${primarySkills.length} skills based on general matching.`;
    }

    const reasons = [
      `Primary match: ${topSkill} (score: ${topScore.score})`,
      topScore.matchReasons.length > 0 ? topScore.matchReasons[0] : ''
    ];

    if (primarySkills.length > 1) {
      reasons.push(`${primarySkills.length - 1} additional skill(s) recommended for comprehensive coverage`);
    }

    return reasons.filter(Boolean).join('. ') + '.';
  }

  /**
   * Get detailed scoring for a specific skill
   */
  getSkillScore(skillName: string, taskDescription: string): SkillScore | null {
    const skill = this.skills.find(s => s.name === skillName);
    if (!skill) return null;

    return this.scoreSkill(skill, taskDescription.toLowerCase());
  }

  /**
   * Find complementary skills
   */
  findComplementary(primarySkills: string[]): string[] {
    const complementary = new Set<string>();

    for (const skillName of primarySkills) {
      const skill = this.skills.find(s => s.name === skillName);
      if (skill) {
        skill.related_skills.forEach(related => complementary.add(related));
      }
    }

    // Remove skills that are already primary
    primarySkills.forEach(skill => complementary.delete(skill));

    return Array.from(complementary);
  }

  /**
   * Recommend skills based on project type
   */
  recommendByProjectType(projectType: string): string[] {
    const recommendations: Record<string, string[]> = {
      'web-app': ['frontend-builder', 'api-designer', 'deployment-advisor'],
      'mobile-app': ['mobile-developer', 'api-designer', 'ux-designer'],
      'mvp': ['mvp-builder', 'product-strategist', 'frontend-builder'],
      'ai-app': ['rag-implementer', 'multi-agent-architect', 'api-designer'],
      'knowledge-base': ['knowledge-base-manager', 'rag-implementer', 'data-engineer'],
      'api': ['api-designer', 'security-engineer', 'testing-strategist'],
      'library': ['technical-writer', 'testing-strategist', 'quality-auditor']
    };

    return recommendations[projectType.toLowerCase()] || [];
  }

  /**
   * Analyze task complexity and recommend team size
   */
  analyzeComplexity(taskDescription: string): {
    complexity: 'simple' | 'moderate' | 'complex';
    recommendedSkillCount: number;
    estimatedTime: string;
  } {
    const lowerTask = taskDescription.toLowerCase();

    let complexity: 'simple' | 'moderate' | 'complex' = 'moderate';
    let skillCount = 2;
    let estimatedTime = '2-4 hours';

    // Complexity indicators
    const complexityIndicators = {
      simple: ['fix', 'update', 'change', 'modify'],
      moderate: ['implement', 'add', 'create', 'build'],
      complex: ['system', 'architecture', 'integrate', 'refactor', 'migrate']
    };

    if (complexityIndicators.complex.some(word => lowerTask.includes(word))) {
      complexity = 'complex';
      skillCount = 4;
      estimatedTime = '1-2 weeks';
    } else if (complexityIndicators.simple.some(word => lowerTask.includes(word))) {
      complexity = 'simple';
      skillCount = 1;
      estimatedTime = '1-2 hours';
    }

    return {
      complexity,
      recommendedSkillCount: skillCount,
      estimatedTime
    };
  }

  /**
   * Get skills by difficulty level
   */
  getSkillsByDifficulty(difficulty: string): string[] {
    return this.skills
      .filter(s => s.difficulty === difficulty)
      .map(s => s.name);
  }

  /**
   * Find skills missing from task
   */
  findMissingSkills(taskDescription: string, currentSkills: string[]): string[] {
    const selection = this.select(taskDescription);
    const allRecommended = [...selection.primary, ...selection.secondary];

    return allRecommended.filter(skill => !currentSkills.includes(skill));
  }
}
