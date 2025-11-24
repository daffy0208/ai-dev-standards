export interface ProjectRequirements {
  projectType: string
  complexity: string
  requirements: any
  timeline?: string
  teamSize?: number
}

export interface ProjectAnalysis {
  pattern: 'A' | 'B' | 'C'
  confidence: number
  rationale: string
  estimated_timeline: string
  recommended_frameworks: string[]
}

export class ProjectAnalyzer {
  async analyze(req: ProjectRequirements): Promise<ProjectAnalysis> {
    let pattern: 'A' | 'B' | 'C' = 'B'
    let rationale = ''

    // Pattern determination logic
    if (req.complexity === 'simple' && !req.requirements?.has_ai_features) {
      pattern = 'A'
      rationale = 'Simple project, single feature or tool - Pattern A (4-8 hours)'
    } else if (req.requirements?.needs_multi_agent || req.requirements?.requires_knowledge_graph) {
      pattern = 'C'
      rationale =
        'Complex AI system with multi-agent orchestration or knowledge graph - Pattern C (4-12+ weeks)'
    } else {
      pattern = 'B'
      rationale = 'Full-stack application with moderate complexity - Pattern B (2-8 weeks)'
    }

    const frameworks = await this.selectFrameworksForPattern(pattern, req.requirements)
    const timeline = this.estimateTimeline(pattern, req.complexity)

    return {
      pattern,
      confidence: 0.9,
      rationale,
      estimated_timeline: timeline,
      recommended_frameworks: frameworks
    }
  }

  private async selectFrameworksForPattern(pattern: string, requirements: any): Promise<string[]> {
    const baseFrameworks = ['framework_orchestration_guide_with_quick_start']

    if (pattern === 'A') {
      return [
        ...baseFrameworks,
        'context_engineering_framework',
        'ai_coding_workflow_framework',
        'testing_validation_framework'
      ]
    }

    if (pattern === 'B') {
      const frameworks = [
        ...baseFrameworks,
        'discovery_validation_framework',
        'full_stack_dev_framework',
        'testing_validation_framework',
        'deployment-devops-framework'
      ]

      if (requirements?.security_critical || requirements?.handles_pii) {
        frameworks.push('ai_security_compliance_framework')
      }

      if (requirements?.has_ai_features) {
        frameworks.push('responsible_ai_review_framework')
      }

      return frameworks
    }

    // Pattern C
    return [
      ...baseFrameworks,
      'ai_development_workflow_framework',
      'context_engineering_v2',
      'knowledge_graph_framework',
      'rag_framework',
      'multi_agent_orchestration_framework',
      'mcp_integration_framework',
      'ai_security_compliance_framework',
      'testing_validation_framework',
      'deployment-devops-framework',
      'system_intelligence_framework'
    ]
  }

  private estimateTimeline(pattern: string, complexity: string): string {
    if (pattern === 'A') return '4-8 hours'
    if (pattern === 'C') return '4-12 weeks'

    // Pattern B
    if (complexity === 'simple') return '2-4 weeks'
    if (complexity === 'complex') return '6-8 weeks'
    return '4-6 weeks'
  }
}
