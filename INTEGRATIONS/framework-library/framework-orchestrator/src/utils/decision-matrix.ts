export class DecisionMatrix {
  async generate(requirements: any, constraints?: any) {
    const criteria = [
      { name: 'Time-to-First-Value', weight: 5 },
      { name: 'Team Familiarity', weight: 5 },
      { name: 'SEO/SSR Requirements', weight: 4 },
      { name: 'Real-time/Low-Latency', weight: 4 },
      { name: 'Mobile-First/Offline', weight: 3 },
      { name: 'Data Compliance', weight: 5 },
      { name: 'Vendor Lock-in Tolerance', weight: 3 },
      { name: 'Extensibility/Modularity', weight: 4 },
      { name: 'Cost Sensitivity', weight: 3 },
      { name: 'Accessibility & i18n', weight: 3 }
    ]

    const options = this.generateOptions(requirements)

    // Score each option based on requirements
    options.forEach(option => {
      this.scoreOption(option, requirements, constraints)
    })

    // Calculate weighted scores
    const scored = options.map(option => ({
      ...option,
      total_score: this.calculateTotalScore(option.scores, criteria)
    }))

    // Sort by score
    scored.sort((a, b) => b.total_score - a.total_score)

    return {
      criteria,
      options: scored,
      recommendation: scored[0].name,
      rationale: this.generateRationale(scored[0], requirements),
      alternatives: scored.slice(1, 3).map(o => o.name)
    }
  }

  private generateOptions(requirements: any) {
    const options = []

    // Always include common options
    options.push(
      { name: 'Next.js 14', category: 'full-stack', scores: {} },
      { name: 'Remix', category: 'full-stack', scores: {} },
      { name: 'Astro', category: 'static', scores: {} },
      { name: 'FastAPI + React', category: 'api-spa', scores: {} }
    )

    // Add AI-specific options if needed
    if (requirements?.has_ai_features) {
      options.push({ name: 'LangChain + FastAPI', category: 'ai-native', scores: {} })
    }

    return options
  }

  private scoreOption(option: any, requirements: any, constraints?: any) {
    // Simplified scoring logic (1-5 scale)
    const scores: any = {}

    if (option.name === 'Next.js 14') {
      scores['Time-to-First-Value'] = 5
      scores['Team Familiarity'] = 5
      scores['SEO/SSR Requirements'] = 5
      scores['Real-time/Low-Latency'] = 4
      scores['Mobile-First/Offline'] = 4
      scores['Data Compliance'] = 4
      scores['Vendor Lock-in Tolerance'] = 3
      scores['Extensibility/Modularity'] = 5
      scores['Cost Sensitivity'] = 4
      scores['Accessibility & i18n'] = 5
    } else if (option.name === 'Remix') {
      scores['Time-to-First-Value'] = 5
      scores['Team Familiarity'] = 4
      scores['SEO/SSR Requirements'] = 5
      scores['Real-time/Low-Latency'] = 5
      scores['Mobile-First/Offline'] = 5
      scores['Data Compliance'] = 4
      scores['Vendor Lock-in Tolerance'] = 5
      scores['Extensibility/Modularity'] = 5
      scores['Cost Sensitivity'] = 5
      scores['Accessibility & i18n'] = 4
    } else if (option.name === 'Astro') {
      scores['Time-to-First-Value'] = 5
      scores['Team Familiarity'] = 3
      scores['SEO/SSR Requirements'] = 5
      scores['Real-time/Low-Latency'] = 2
      scores['Mobile-First/Offline'] = 3
      scores['Data Compliance'] = 3
      scores['Vendor Lock-in Tolerance'] = 5
      scores['Extensibility/Modularity'] = 4
      scores['Cost Sensitivity'] = 5
      scores['Accessibility & i18n'] = 4
    } else {
      // Default scores
      Object.keys(scores).forEach(key => {
        scores[key] = 3
      })
    }

    option.scores = scores
  }

  private calculateTotalScore(scores: any, criteria: any[]): number {
    return criteria.reduce((total, criterion) => {
      const score = scores[criterion.name] || 0
      return total + score * criterion.weight
    }, 0)
  }

  private generateRationale(option: any, requirements: any): string {
    return `${option.name} scored highest (${option.total_score}) based on weighted criteria. Strong performance in Time-to-First-Value, Team Familiarity, and Extensibility.`
  }
}
