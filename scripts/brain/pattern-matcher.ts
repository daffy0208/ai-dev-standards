/**
 * LAYER 3: PATTERN MATCHER
 *
 * Architecture pattern matching and recommendation engine.
 * Matches problems to proven architecture patterns with trade-offs.
 */

export interface ArchitecturePattern {
  name: string;
  description: string;
  useCases: string[];
  skills: string[];
  mcps: string[];
  components: string[];
  integrations: string[];
  complexity: 'simple' | 'moderate' | 'complex';
  tradeoffs: {
    pros: string[];
    cons: string[];
  };
  when_to_use: string[];
  when_not_to_use: string[];
  estimated_time: string;
  reference: string;
}

export interface PatternMatch {
  pattern: ArchitecturePattern;
  score: number;
  matchReasons: string[];
  confidence: number;
}

export class PatternMatcher {
  private patterns: ArchitecturePattern[];

  constructor() {
    this.patterns = this.initializePatterns();
  }

  /**
   * Match patterns to a problem description
   */
  match(problemDescription: string): PatternMatch[] {
    const lowerProblem = problemDescription.toLowerCase();

    const scored = this.patterns.map(pattern => {
      let score = 0;
      const matchReasons: string[] = [];

      // Check use cases
      for (const useCase of pattern.useCases) {
        if (lowerProblem.includes(useCase.toLowerCase())) {
          score += 15;
          matchReasons.push(`Use case match: "${useCase}"`);
        }
      }

      // Check when_to_use conditions
      for (const condition of pattern.when_to_use) {
        const keywords = condition.toLowerCase().split(/\s+/);
        const matchCount = keywords.filter(kw => lowerProblem.includes(kw)).length;
        if (matchCount >= keywords.length * 0.6) {
          score += 10;
          matchReasons.push(`Condition match: "${condition}"`);
        }
      }

      // Check pattern name and description
      if (lowerProblem.includes(pattern.name.toLowerCase())) {
        score += 20;
        matchReasons.push(`Pattern name in description`);
      }

      const confidence = Math.min(100, Math.round((score / 30) * 100));

      return {
        pattern,
        score,
        matchReasons,
        confidence
      };
    });

    return scored
      .filter(m => m.score > 0)
      .sort((a, b) => b.score - a.score);
  }

  /**
   * Get pattern by name
   */
  getPattern(name: string): ArchitecturePattern | null {
    return this.patterns.find(p => p.name === name) || null;
  }

  /**
   * Get all patterns
   */
  getAllPatterns(): ArchitecturePattern[] {
    return this.patterns;
  }

  /**
   * Get patterns by complexity
   */
  getPatternsByComplexity(complexity: string): ArchitecturePattern[] {
    return this.patterns.filter(p => p.complexity === complexity);
  }

  /**
   * Initialize architecture patterns
   */
  private initializePatterns(): ArchitecturePattern[] {
    return [
      {
        name: 'RAG System',
        description: 'Retrieval-Augmented Generation for knowledge-intensive applications',
        useCases: [
          'knowledge base',
          'document search',
          'semantic search',
          'question answering',
          'chatbot with custom knowledge'
        ],
        skills: ['rag-implementer', 'knowledge-base-manager', 'data-engineer'],
        mcps: ['vector-database-mcp', 'embedding-generator-mcp', 'semantic-search-mcp'],
        components: [],
        integrations: ['openai', 'anthropic', 'pinecone'],
        complexity: 'moderate',
        tradeoffs: {
          pros: [
            'Grounds LLM responses in factual data',
            'Reduces hallucinations',
            'Enables up-to-date information',
            'Domain-specific knowledge'
          ],
          cons: [
            'Requires vector database infrastructure',
            'Embedding costs',
            'Retrieval quality depends on chunking',
            'Latency overhead'
          ]
        },
        when_to_use: [
          'Need domain-specific knowledge',
          'Want to reduce LLM hallucinations',
          'Have large document corpus',
          'Need factual accuracy'
        ],
        when_not_to_use: [
          'Simple queries without context',
          'Real-time data not needed',
          'Very small knowledge base'
        ],
        estimated_time: '1-2 weeks',
        reference: 'STANDARDS/architecture-patterns/rag-pattern.md'
      },
      {
        name: 'Multi-Agent System',
        description: 'Coordinated agents with specialized roles for complex tasks',
        useCases: [
          'complex workflow automation',
          'collaborative problem solving',
          'task delegation',
          'parallel processing',
          'specialized expertise'
        ],
        skills: ['multi-agent-architect', 'rag-implementer', 'api-designer'],
        mcps: ['agent-orchestrator-mcp', 'vector-database-mcp'],
        components: [],
        integrations: ['openai', 'anthropic'],
        complexity: 'complex',
        tradeoffs: {
          pros: [
            'Specialization improves quality',
            'Parallel processing speeds up tasks',
            'Modular and maintainable',
            'Handles complex workflows'
          ],
          cons: [
            'Higher complexity',
            'Coordination overhead',
            'More LLM calls (higher cost)',
            'Debugging is harder'
          ]
        },
        when_to_use: [
          'Task requires multiple specializations',
          'Complex workflow with dependencies',
          'Parallel processing beneficial',
          'Need quality over speed'
        ],
        when_not_to_use: [
          'Simple single-step tasks',
          'Low budget',
          'Real-time responses required'
        ],
        estimated_time: '2-3 weeks',
        reference: 'SKILLS/multi-agent-architect/SKILL.md'
      },
      {
        name: 'Full-Stack Web Application',
        description: 'Modern web app with React frontend and API backend',
        useCases: [
          'web application',
          'saas product',
          'user dashboard',
          'admin panel',
          'content management'
        ],
        skills: ['frontend-builder', 'api-designer', 'deployment-advisor', 'security-engineer'],
        mcps: ['component-generator-mcp', 'api-validator-mcp'],
        components: ['login-form', 'error-boundary', 'protected-route'],
        integrations: ['supabase', 'stripe'],
        complexity: 'moderate',
        tradeoffs: {
          pros: [
            'Full control over UX',
            'Modern tech stack',
            'Scalable architecture',
            'Rich user interactions'
          ],
          cons: [
            'Longer development time',
            'Frontend + backend complexity',
            'Deployment infrastructure needed',
            'More maintenance'
          ]
        },
        when_to_use: [
          'Custom UI/UX required',
          'Complex user interactions',
          'Need full control',
          'Long-term product'
        ],
        when_not_to_use: [
          'Simple CRUD operations',
          'Need quick validation',
          'Limited dev resources'
        ],
        estimated_time: '3-6 weeks',
        reference: 'SKILLS/frontend-builder/SKILL.md'
      },
      {
        name: 'MVP Pattern',
        description: 'Minimum viable product for rapid validation',
        useCases: [
          'product validation',
          'market testing',
          'proof of concept',
          'rapid prototyping',
          'startup launch'
        ],
        skills: ['mvp-builder', 'product-strategist', 'frontend-builder'],
        mcps: ['feature-prioritizer-mcp', 'component-generator-mcp'],
        components: [],
        integrations: ['supabase'],
        complexity: 'simple',
        tradeoffs: {
          pros: [
            'Fast time to market',
            'Validates assumptions quickly',
            'Low initial cost',
            'Focus on core value'
          ],
          cons: [
            'Technical debt accumulation',
            'Limited features',
            'May need refactoring',
            'Not production-grade'
          ]
        },
        when_to_use: [
          'Validating new idea',
          'Limited budget/time',
          'Need user feedback fast',
          'Uncertain market fit'
        ],
        when_not_to_use: [
          'Enterprise requirements',
          'Mature market',
          'Complex integrations needed'
        ],
        estimated_time: '1-2 weeks',
        reference: 'SKILLS/mvp-builder/SKILL.md'
      },
      {
        name: 'Microservices Architecture',
        description: 'Distributed system with independent services',
        useCases: [
          'large scale application',
          'team independence',
          'polyglot architecture',
          'independent deployment',
          'service scalability'
        ],
        skills: ['api-designer', 'deployment-advisor', 'performance-optimizer'],
        mcps: ['api-validator-mcp', 'deployment-orchestrator-mcp'],
        components: [],
        integrations: ['supabase'],
        complexity: 'complex',
        tradeoffs: {
          pros: [
            'Independent scaling',
            'Team autonomy',
            'Technology diversity',
            'Fault isolation'
          ],
          cons: [
            'Distributed system complexity',
            'Network overhead',
            'Data consistency challenges',
            'Higher operational cost'
          ]
        },
        when_to_use: [
          'Large team(s)',
          'Different scaling needs',
          'Independent deployment critical',
          'Service isolation important'
        ],
        when_not_to_use: [
          'Small team',
          'Simple application',
          'Tight coupling acceptable'
        ],
        estimated_time: '2-3 months',
        reference: 'STANDARDS/architecture-patterns/'
      },
      {
        name: 'Serverless Architecture',
        description: 'Event-driven functions without server management',
        useCases: [
          'event processing',
          'api endpoints',
          'scheduled tasks',
          'webhooks',
          'data processing'
        ],
        skills: ['api-designer', 'deployment-advisor'],
        mcps: [],
        components: [],
        integrations: [],
        complexity: 'simple',
        tradeoffs: {
          pros: [
            'No server management',
            'Pay-per-use pricing',
            'Auto-scaling',
            'Fast deployment'
          ],
          cons: [
            'Cold start latency',
            'Vendor lock-in',
            'Debugging challenges',
            'Stateless constraints'
          ]
        },
        when_to_use: [
          'Variable workload',
          'Event-driven architecture',
          'Minimal ops desired',
          'Cost optimization priority'
        ],
        when_not_to_use: [
          'Consistent high load',
          'Long-running processes',
          'Complex state management'
        ],
        estimated_time: '1-2 weeks',
        reference: 'SKILLS/deployment-advisor/SKILL.md'
      },
      {
        name: 'Knowledge Graph',
        description: 'Entity-relationship graph for complex domain modeling',
        useCases: [
          'complex relationships',
          'entity linking',
          'semantic queries',
          'recommendation system',
          'network analysis'
        ],
        skills: ['knowledge-graph-builder', 'knowledge-base-manager', 'data-engineer'],
        mcps: ['graph-database-mcp'],
        components: [],
        integrations: [],
        complexity: 'complex',
        tradeoffs: {
          pros: [
            'Rich relationship modeling',
            'Flexible schema',
            'Complex query support',
            'Inference capabilities'
          ],
          cons: [
            'Steep learning curve',
            'Query complexity',
            'Maintenance overhead',
            'Specialized database needed'
          ]
        },
        when_to_use: [
          'Complex entity relationships',
          'Need graph queries',
          'Domain has ontology',
          'Recommendation system'
        ],
        when_not_to_use: [
          'Simple hierarchical data',
          'Few relationships',
          'Standard CRUD sufficient'
        ],
        estimated_time: '3-4 weeks',
        reference: 'SKILLS/knowledge-graph-builder/SKILL.md'
      },
      {
        name: 'API-First Design',
        description: 'API as primary interface, clients as consumers',
        useCases: [
          'mobile + web clients',
          'third-party integrations',
          'multiple frontends',
          'api product',
          'microservices communication'
        ],
        skills: ['api-designer', 'security-engineer', 'technical-writer'],
        mcps: ['openapi-generator-mcp', 'api-validator-mcp'],
        components: [],
        integrations: [],
        complexity: 'moderate',
        tradeoffs: {
          pros: [
            'Client flexibility',
            'Reusable backend',
            'Clear contracts',
            'Parallel development'
          ],
          cons: [
            'Upfront API design needed',
            'Versioning complexity',
            'Documentation overhead',
            'Breaking changes costly'
          ]
        },
        when_to_use: [
          'Multiple client types',
          'Third-party integration',
          'Mobile app + web app',
          'API as product'
        ],
        when_not_to_use: [
          'Single tightly-coupled frontend',
          'Rapid prototyping phase',
          'Internal tool only'
        ],
        estimated_time: '2-3 weeks',
        reference: 'SKILLS/api-designer/SKILL.md'
      }
    ];
  }

  /**
   * Compare patterns and recommend best fit
   */
  comparePatterns(patternNames: string[]): {
    comparison: Record<string, any>;
    recommendation: string;
    reasoning: string;
  } {
    const patterns = patternNames
      .map(name => this.getPattern(name))
      .filter(Boolean) as ArchitecturePattern[];

    if (patterns.length === 0) {
      return {
        comparison: {},
        recommendation: '',
        reasoning: 'No patterns found to compare'
      };
    }

    const comparison: Record<string, any> = {};

    for (const pattern of patterns) {
      comparison[pattern.name] = {
        complexity: pattern.complexity,
        estimated_time: pattern.estimated_time,
        pros_count: pattern.tradeoffs.pros.length,
        cons_count: pattern.tradeoffs.cons.length,
        skills_required: pattern.skills.length
      };
    }

    // Recommend simplest pattern by default
    const simplest = patterns.reduce((prev, curr) => {
      const complexityOrder = { simple: 1, moderate: 2, complex: 3 };
      return complexityOrder[curr.complexity] < complexityOrder[prev.complexity] ? curr : prev;
    });

    const reasoning = `Recommended ${simplest.name} due to ${simplest.complexity} complexity and ${simplest.estimated_time} estimated time`;

    return {
      comparison,
      recommendation: simplest.name,
      reasoning
    };
  }
}
