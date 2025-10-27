/**
 * LAYER 3: WORKFLOW ENGINE
 *
 * Advanced workflow selection and orchestration engine.
 * Analyzes scenarios and generates detailed, context-aware workflows.
 */

export interface WorkflowStep {
  order: number;
  action: string;
  description: string;
  estimatedTime: string;
  requiredSkills: string[];
  optional: boolean;
}

export interface WorkflowDecision {
  scenario: string;
  workflowType: string;
  steps: WorkflowStep[];
  skills: string[];
  mcps: string[];
  integrations: string[];
  estimatedTime: string;
  reasoning: string;
  alternatives: string[];
  warnings: string[];
}

export class WorkflowEngine {
  /**
   * Decide complete workflow for a scenario
   */
  decide(scenario: string, skillRecommendations: string[]): WorkflowDecision {
    const lowerScenario = scenario.toLowerCase();

    // Detect workflow type
    const workflowType = this.detectWorkflowType(lowerScenario);

    // Generate workflow steps
    const steps = this.generateWorkflowSteps(workflowType, lowerScenario);

    // Calculate total time
    const estimatedTime = this.calculateTotalTime(steps);

    // Determine required integrations
    const integrations = this.determineIntegrations(workflowType, skillRecommendations);

    // Generate reasoning
    const reasoning = this.generateReasoning(workflowType, steps, skillRecommendations);

    // Find alternatives
    const alternatives = this.findAlternatives(workflowType);

    // Check for warnings
    const warnings = this.checkWarnings(workflowType, lowerScenario);

    return {
      scenario,
      workflowType,
      steps,
      skills: skillRecommendations,
      mcps: [], // Will be filled by mcp-integrator
      integrations,
      estimatedTime,
      reasoning,
      alternatives,
      warnings
    };
  }

  /**
   * Detect workflow type from scenario
   */
  private detectWorkflowType(scenario: string): string {
    const patterns = [
      { type: 'new-skill', keywords: ['new skill', 'add skill', 'create skill'] },
      { type: 'new-mcp', keywords: ['new mcp', 'add mcp', 'create mcp', 'mcp server'] },
      { type: 'new-feature', keywords: ['new feature', 'add feature', 'implement feature'] },
      { type: 'enhancement', keywords: ['enhance', 'improve', 'optimize', 'refactor', 'better'] },
      { type: 'bug-fix', keywords: ['fix bug', 'debug', 'resolve issue', 'fix error'] },
      { type: 'documentation', keywords: ['document', 'write docs', 'update docs', 'readme'] },
      { type: 'testing', keywords: ['add tests', 'test', 'testing', 'coverage'] },
      { type: 'deployment', keywords: ['deploy', 'deployment', 'production', 'ci/cd'] },
      { type: 'architecture', keywords: ['architecture', 'design system', 'pattern', 'structure'] },
      { type: 'integration', keywords: ['integrate', 'integration', 'connect', 'api'] },
      { type: 'mvp', keywords: ['mvp', 'minimum viable', 'prototype', 'quick build'] },
      { type: 'rag-system', keywords: ['rag', 'retrieval', 'knowledge base', 'semantic search'] },
      { type: 'multi-agent', keywords: ['agent', 'multi-agent', 'orchestration'] },
      { type: 'security', keywords: ['security', 'secure', 'authentication', 'authorization'] }
    ];

    for (const pattern of patterns) {
      if (pattern.keywords.some(keyword => scenario.includes(keyword))) {
        return pattern.type;
      }
    }

    return 'general';
  }

  /**
   * Generate workflow steps based on type
   */
  private generateWorkflowSteps(workflowType: string, scenario: string): WorkflowStep[] {
    const workflows: Record<string, WorkflowStep[]> = {
      'new-skill': [
        { order: 1, action: 'Research', description: 'Research existing patterns and similar skills', estimatedTime: '30 min', requiredSkills: [], optional: false },
        { order: 2, action: 'Check MCPs', description: 'Check if official MCP exists for this capability', estimatedTime: '15 min', requiredSkills: [], optional: false },
        { order: 3, action: 'Create SKILL.md', description: 'Write comprehensive skill documentation with patterns', estimatedTime: '45 min', requiredSkills: ['technical-writer'], optional: false },
        { order: 4, action: 'Create README.md', description: 'Create skill README with overview', estimatedTime: '15 min', requiredSkills: ['technical-writer'], optional: true },
        { order: 5, action: 'Update Registries', description: 'Update skill-registry.json with new skill', estimatedTime: '10 min', requiredSkills: [], optional: false },
        { order: 6, action: 'Update Relationships', description: 'Update relationship-mapping.json with dependencies', estimatedTime: '10 min', requiredSkills: [], optional: false },
        { order: 7, action: 'Update CLAUDE.md', description: 'Add skill to .claude/CLAUDE.md', estimatedTime: '10 min', requiredSkills: [], optional: false },
        { order: 8, action: 'Update README', description: 'Add skill to main README.md', estimatedTime: '10 min', requiredSkills: [], optional: false },
        { order: 9, action: 'Validate', description: 'Run brain validate to check consistency', estimatedTime: '5 min', requiredSkills: [], optional: false },
        { order: 10, action: 'Commit', description: 'Commit and push changes', estimatedTime: '5 min', requiredSkills: [], optional: false }
      ],
      'new-mcp': [
        { order: 1, action: 'Research', description: 'Research MCP patterns and official MCPs', estimatedTime: '30 min', requiredSkills: [], optional: false },
        { order: 2, action: 'Design API', description: 'Design MCP tool interfaces', estimatedTime: '30 min', requiredSkills: ['api-designer'], optional: false },
        { order: 3, action: 'Implement', description: 'Implement MCP server', estimatedTime: '2 hours', requiredSkills: [], optional: false },
        { order: 4, action: 'Add Tests', description: 'Create integration tests', estimatedTime: '45 min', requiredSkills: ['testing-strategist'], optional: false },
        { order: 5, action: 'Update Registries', description: 'Update mcp-registry.json', estimatedTime: '10 min', requiredSkills: [], optional: false },
        { order: 6, action: 'Update Relationships', description: 'Link MCP to skills in relationship-mapping.json', estimatedTime: '10 min', requiredSkills: [], optional: false },
        { order: 7, action: 'Validate', description: 'Run brain validate', estimatedTime: '5 min', requiredSkills: [], optional: false },
        { order: 8, action: 'Commit', description: 'Commit and push', estimatedTime: '5 min', requiredSkills: [], optional: false }
      ],
      'new-feature': [
        { order: 1, action: 'Context', description: 'Load project context and understand requirements', estimatedTime: '15 min', requiredSkills: [], optional: false },
        { order: 2, action: 'Design', description: 'Design feature architecture and data flow', estimatedTime: '30 min', requiredSkills: [], optional: false },
        { order: 3, action: 'Check Playbooks', description: 'Review playbooks for relevant patterns', estimatedTime: '10 min', requiredSkills: [], optional: true },
        { order: 4, action: 'Implement Backend', description: 'Implement backend logic and APIs', estimatedTime: '1.5 hours', requiredSkills: ['api-designer'], optional: false },
        { order: 5, action: 'Implement Frontend', description: 'Implement UI components', estimatedTime: '1.5 hours', requiredSkills: ['frontend-builder'], optional: false },
        { order: 6, action: 'Write Tests', description: 'Add unit and integration tests', estimatedTime: '45 min', requiredSkills: ['testing-strategist'], optional: false },
        { order: 7, action: 'Update Docs', description: 'Update relevant documentation', estimatedTime: '20 min', requiredSkills: ['technical-writer'], optional: false },
        { order: 8, action: 'Validate', description: 'Run tests and validation', estimatedTime: '10 min', requiredSkills: [], optional: false },
        { order: 9, action: 'Commit', description: 'Commit changes', estimatedTime: '5 min', requiredSkills: [], optional: false }
      ],
      'enhancement': [
        { order: 1, action: 'Analyze', description: 'Analyze existing implementation', estimatedTime: '20 min', requiredSkills: [], optional: false },
        { order: 2, action: 'Identify Gaps', description: 'Identify improvement opportunities', estimatedTime: '15 min', requiredSkills: ['quality-auditor'], optional: false },
        { order: 3, action: 'Research', description: 'Research best practices', estimatedTime: '20 min', requiredSkills: [], optional: true },
        { order: 4, action: 'Implement', description: 'Implement enhancements', estimatedTime: '1.5 hours', requiredSkills: [], optional: false },
        { order: 5, action: 'Update Tests', description: 'Update or add tests', estimatedTime: '30 min', requiredSkills: ['testing-strategist'], optional: false },
        { order: 6, action: 'Update Docs', description: 'Update documentation', estimatedTime: '15 min', requiredSkills: ['technical-writer'], optional: false },
        { order: 7, action: 'Validate', description: 'Run validation', estimatedTime: '10 min', requiredSkills: [], optional: false },
        { order: 8, action: 'Commit', description: 'Commit changes', estimatedTime: '5 min', requiredSkills: [], optional: false }
      ],
      'bug-fix': [
        { order: 1, action: 'Reproduce', description: 'Reproduce the bug', estimatedTime: '15 min', requiredSkills: [], optional: false },
        { order: 2, action: 'Diagnose', description: 'Identify root cause', estimatedTime: '30 min', requiredSkills: [], optional: false },
        { order: 3, action: 'Fix', description: 'Implement fix', estimatedTime: '45 min', requiredSkills: [], optional: false },
        { order: 4, action: 'Test Fix', description: 'Verify fix resolves issue', estimatedTime: '15 min', requiredSkills: [], optional: false },
        { order: 5, action: 'Regression Test', description: 'Add regression test', estimatedTime: '20 min', requiredSkills: ['testing-strategist'], optional: false },
        { order: 6, action: 'Update Docs', description: 'Update docs if needed', estimatedTime: '10 min', requiredSkills: ['technical-writer'], optional: true },
        { order: 7, action: 'Commit', description: 'Commit fix', estimatedTime: '5 min', requiredSkills: [], optional: false }
      ],
      'mvp': [
        { order: 1, action: 'Validate Problem', description: 'Validate problem-solution fit', estimatedTime: '30 min', requiredSkills: ['product-strategist'], optional: false },
        { order: 2, action: 'Prioritize', description: 'Prioritize features (P0/P1/P2)', estimatedTime: '30 min', requiredSkills: ['mvp-builder'], optional: false },
        { order: 3, action: 'Choose Stack', description: 'Select technology stack', estimatedTime: '20 min', requiredSkills: ['deployment-advisor'], optional: false },
        { order: 4, action: 'Design', description: 'Design MVP architecture', estimatedTime: '45 min', requiredSkills: ['api-designer', 'frontend-builder'], optional: false },
        { order: 5, action: 'Build P0', description: 'Implement P0 features only', estimatedTime: '3 hours', requiredSkills: ['mvp-builder', 'frontend-builder'], optional: false },
        { order: 6, action: 'Test', description: 'Basic testing', estimatedTime: '30 min', requiredSkills: ['testing-strategist'], optional: false },
        { order: 7, action: 'Deploy', description: 'Deploy to staging', estimatedTime: '30 min', requiredSkills: ['deployment-advisor'], optional: false },
        { order: 8, action: 'Validate', description: 'User validation', estimatedTime: '1 hour', requiredSkills: ['user-researcher'], optional: false }
      ],
      'rag-system': [
        { order: 1, action: 'Design', description: 'Design RAG architecture', estimatedTime: '45 min', requiredSkills: ['rag-implementer'], optional: false },
        { order: 2, action: 'Setup Vector DB', description: 'Configure vector database', estimatedTime: '30 min', requiredSkills: ['rag-implementer'], optional: false },
        { order: 3, action: 'Embeddings', description: 'Implement embedding generation', estimatedTime: '45 min', requiredSkills: ['rag-implementer'], optional: false },
        { order: 4, action: 'Ingestion', description: 'Build document ingestion pipeline', estimatedTime: '1 hour', requiredSkills: ['data-engineer'], optional: false },
        { order: 5, action: 'Retrieval', description: 'Implement retrieval logic', estimatedTime: '1 hour', requiredSkills: ['rag-implementer'], optional: false },
        { order: 6, action: 'LLM Integration', description: 'Integrate with LLM', estimatedTime: '45 min', requiredSkills: ['rag-implementer'], optional: false },
        { order: 7, action: 'Evaluation', description: 'Build evaluation framework', estimatedTime: '45 min', requiredSkills: ['testing-strategist'], optional: false },
        { order: 8, action: 'Test', description: 'Test end-to-end', estimatedTime: '30 min', requiredSkills: [], optional: false }
      ],
      'multi-agent': [
        { order: 1, action: 'Design', description: 'Design agent system architecture', estimatedTime: '1 hour', requiredSkills: ['multi-agent-architect'], optional: false },
        { order: 2, action: 'Define Roles', description: 'Define agent roles and responsibilities', estimatedTime: '30 min', requiredSkills: ['multi-agent-architect'], optional: false },
        { order: 3, action: 'Communication', description: 'Design agent communication protocol', estimatedTime: '45 min', requiredSkills: ['multi-agent-architect'], optional: false },
        { order: 4, action: 'Implement Agents', description: 'Implement individual agents', estimatedTime: '2 hours', requiredSkills: ['multi-agent-architect'], optional: false },
        { order: 5, action: 'Orchestration', description: 'Implement orchestration layer', estimatedTime: '1.5 hours', requiredSkills: ['multi-agent-architect'], optional: false },
        { order: 6, action: 'Test', description: 'Test agent coordination', estimatedTime: '45 min', requiredSkills: ['testing-strategist'], optional: false }
      ]
    };

    return workflows[workflowType] || workflows['new-feature'];
  }

  /**
   * Calculate total estimated time
   */
  private calculateTotalTime(steps: WorkflowStep[]): string {
    let totalMinutes = 0;

    for (const step of steps) {
      const time = step.estimatedTime;
      if (time.includes('hour')) {
        const hours = parseFloat(time);
        totalMinutes += hours * 60;
      } else if (time.includes('min')) {
        const minutes = parseInt(time);
        totalMinutes += minutes;
      }
    }

    if (totalMinutes < 60) {
      return `${totalMinutes} minutes`;
    } else {
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      return minutes > 0 ? `${hours}-${hours + 1} hours` : `${hours} hours`;
    }
  }

  /**
   * Determine required integrations
   */
  private determineIntegrations(workflowType: string, skills: string[]): string[] {
    const integrations: string[] = [];

    // Based on workflow type
    if (workflowType === 'rag-system') {
      integrations.push('openai', 'pinecone');
    } else if (workflowType === 'multi-agent') {
      integrations.push('openai', 'anthropic');
    }

    // Based on skills
    if (skills.includes('rag-implementer')) {
      if (!integrations.includes('openai')) integrations.push('openai');
      if (!integrations.includes('pinecone')) integrations.push('pinecone');
    }
    if (skills.includes('api-designer') && workflowType === 'new-feature') {
      integrations.push('supabase');
    }

    return integrations;
  }

  /**
   * Generate reasoning for workflow selection
   */
  private generateReasoning(workflowType: string, steps: WorkflowStep[], skills: string[]): string {
    const reasons = [
      `Detected workflow type: ${workflowType}`,
      `Generated ${steps.length} step workflow`,
      skills.length > 0 ? `Recommended ${skills.length} skills for implementation` : 'No specific skills required'
    ];

    return reasons.join('. ') + '.';
  }

  /**
   * Find alternative approaches
   */
  private findAlternatives(workflowType: string): string[] {
    const alternatives: Record<string, string[]> = {
      'new-skill': ['Enhance existing skill instead of creating new one', 'Create sub-pattern within existing skill'],
      'new-mcp': ['Use official MCP if available', 'Create tool instead of full MCP'],
      'new-feature': ['Build as separate microservice', 'Use serverless functions'],
      'mvp': ['Use no-code tools for validation', 'Create Figma prototype first'],
      'rag-system': ['Use existing RAG service (e.g., LlamaIndex Cloud)', 'Start with simple keyword search']
    };

    return alternatives[workflowType] || [];
  }

  /**
   * Check for warnings
   */
  private checkWarnings(workflowType: string, scenario: string): string[] {
    const warnings: string[] = [];

    if (workflowType === 'new-skill' && !scenario.includes('research')) {
      warnings.push('Consider researching existing skills before creating new one');
    }

    if (workflowType === 'new-mcp' && !scenario.includes('official')) {
      warnings.push('Always check for official MCPs first before building custom');
    }

    if (workflowType === 'mvp' && scenario.includes('feature')) {
      warnings.push('For MVP, focus on P0 features only - avoid feature creep');
    }

    if (workflowType === 'rag-system' && !scenario.includes('vector')) {
      warnings.push('RAG systems require vector database - ensure infrastructure is ready');
    }

    return warnings;
  }

  /**
   * Get workflow template by type
   */
  getWorkflowTemplate(type: string): WorkflowStep[] {
    return this.generateWorkflowSteps(type, type);
  }

  /**
   * List all available workflow types
   */
  getAvailableWorkflows(): string[] {
    return [
      'new-skill',
      'new-mcp',
      'new-feature',
      'enhancement',
      'bug-fix',
      'documentation',
      'testing',
      'deployment',
      'architecture',
      'integration',
      'mvp',
      'rag-system',
      'multi-agent',
      'security',
      'general'
    ];
  }
}
