/**
 * Complexity Analyzer: Analyzes task complexity to inform pattern selection
 *
 * Scores tasks on multiple dimensions:
 * - Number of steps required
 * - Number of tools/MCPs needed
 * - Data transformation complexity
 * - Conditional logic presence
 * - Error handling requirements
 *
 * Output: Complexity score (1-10) and detailed breakdown
 *
 * @module complexity-analyzer
 */

export interface ComplexityScore {
    overall_score: number;          // 1-10 (simple to very complex)
    estimated_tools: number;         // Estimated number of tools needed
    estimated_steps: number;         // Estimated number of sequential steps
    workflow_structure: 'linear' | 'branching' | 'complex';
    data_complexity: 'simple' | 'moderate' | 'complex';
    has_conditionals: boolean;
    has_loops: boolean;
    has_error_handling: boolean;
    breakdown: {
        tools_score: number;        // 1-10
        steps_score: number;        // 1-10
        data_score: number;         // 1-10
        logic_score: number;        // 1-10
    };
    reasoning: string[];
}

export class ComplexityAnalyzer {
    /**
     * Analyze task complexity from description
     */
    async analyzeComplexity(taskDescription: string): Promise<ComplexityScore> {
        const text = taskDescription.toLowerCase();

        // Analyze different dimensions
        const toolsAnalysis = this.analyzeToolsNeeded(text);
        const stepsAnalysis = this.analyzeSteps(text);
        const dataAnalysis = this.analyzeDataComplexity(text);
        const logicAnalysis = this.analyzeLogicComplexity(text);

        // Calculate scores for each dimension (1-10)
        const toolsScore = this.calculateToolsScore(toolsAnalysis.count);
        const stepsScore = this.calculateStepsScore(stepsAnalysis.count);
        const dataScore = this.calculateDataScore(dataAnalysis);
        const logicScore = this.calculateLogicScore(logicAnalysis);

        // Overall score (weighted average)
        const overallScore = Math.round(
            (toolsScore * 0.3 +
             stepsScore * 0.25 +
             dataScore * 0.25 +
             logicScore * 0.2) * 10
        ) / 10;

        // Determine workflow structure
        const workflowStructure = this.determineWorkflowStructure(
            stepsAnalysis,
            logicAnalysis
        );

        // Build reasoning
        const reasoning: string[] = [];
        reasoning.push(`Estimated ${toolsAnalysis.count} tool(s) needed: ${toolsAnalysis.tools.join(', ')}`);
        reasoning.push(`Estimated ${stepsAnalysis.count} step(s)`);

        if (dataAnalysis.complexity !== 'simple') {
            reasoning.push(`Data complexity: ${dataAnalysis.complexity}`);
        }

        if (logicAnalysis.has_conditionals) {
            reasoning.push('Conditional logic detected');
        }

        if (logicAnalysis.has_loops) {
            reasoning.push('Iterative processing detected');
        }

        if (logicAnalysis.has_error_handling) {
            reasoning.push('Error handling required');
        }

        return {
            overall_score: overallScore,
            estimated_tools: toolsAnalysis.count,
            estimated_steps: stepsAnalysis.count,
            workflow_structure: workflowStructure,
            data_complexity: dataAnalysis.complexity,
            has_conditionals: logicAnalysis.has_conditionals,
            has_loops: logicAnalysis.has_loops,
            has_error_handling: logicAnalysis.has_error_handling,
            breakdown: {
                tools_score: toolsScore,
                steps_score: stepsScore,
                data_score: dataScore,
                logic_score: logicScore,
            },
            reasoning,
        };
    }

    /**
     * Analyze number and types of tools needed
     */
    private analyzeToolsNeeded(text: string): { count: number; tools: string[] } {
        const tools: string[] = [];

        // Look for explicit tool/system mentions
        const systemPatterns = [
            { pattern: /google\s+(drive|docs?|sheets?)/i, tool: 'google-drive' },
            { pattern: /notion/i, tool: 'notion' },
            { pattern: /salesforce/i, tool: 'salesforce' },
            { pattern: /slack/i, tool: 'slack' },
            { pattern: /github/i, tool: 'github' },
            { pattern: /jira/i, tool: 'jira' },
            { pattern: /database|sql|postgres/i, tool: 'database' },
            { pattern: /api|endpoint|http/i, tool: 'api-client' },
            { pattern: /email/i, tool: 'email' },
            { pattern: /calendar/i, tool: 'calendar' },
            { pattern: /chart|graph|visualization/i, tool: 'chart-builder' },
            { pattern: /search|query|find/i, tool: 'search' },
            { pattern: /analyze|analysis/i, tool: 'analyzer' },
        ];

        for (const { pattern, tool } of systemPatterns) {
            if (pattern.test(text) && !tools.includes(tool)) {
                tools.push(tool);
            }
        }

        // Look for action verbs that suggest multiple operations
        const multiToolVerbs = [
            /copy.*from.*to/i,
            /migrate.*from.*to/i,
            /sync.*with/i,
            /integrate.*with/i,
            /combine.*and/i,
        ];

        const hasMultiToolOperation = multiToolVerbs.some(pattern => pattern.test(text));

        // If no specific tools identified but multi-tool operation, estimate minimum 2
        let count = tools.length || 1;
        if (hasMultiToolOperation && count < 2) {
            count = 2;
            if (tools.length === 0) {
                tools.push('tool-1', 'tool-2');
            }
        }

        // Check for words suggesting multiple data sources
        if (/(multiple|several|various)\s+(sources?|systems?|platforms?|tools?)/i.test(text)) {
            count = Math.max(count, 3);
        }

        return { count, tools };
    }

    /**
     * Analyze number of steps required
     */
    private analyzeSteps(text: string): { count: number; is_sequential: boolean } {
        // Count step indicators
        let stepCount = 0;

        // Look for explicit step markers
        const stepMarkers = text.match(/\b(first|then|next|after|finally|lastly|followed by|and then)\b/gi);
        if (stepMarkers) {
            stepCount = stepMarkers.length + (text.match(/\bfirst\b/i) ? 0 : 1); // +1 for initial step unless 'first' is present
        }

        // Look for numbered/bulleted lists
        const numberedSteps = text.match(/\b[0-9]+\.\s+/g);
        if (numberedSteps && numberedSteps.length > stepCount) {
            stepCount = numberedSteps.length;
        }

        // Look for action verbs (each suggests a step)
        const actionVerbs = text.match(/\b(get|fetch|create|make|update|delete|remove|send|post|analyze|transform|process|validate|check|verify|generate|build|save|store|copy|move|read|write|upload|download)\b/gi);
        if (actionVerbs && actionVerbs.length > stepCount) {
            stepCount = Math.min(actionVerbs.length, 10); // Cap at 10
        }

        // Default to 1 if no steps detected
        stepCount = Math.max(stepCount, 1);

        // Check if steps are sequential
        const isSequential = /(then|next|after|followed by|sequential|step-by-step)/i.test(text);

        return { count: stepCount, is_sequential: isSequential };
    }

    /**
     * Analyze data complexity
     */
    private analyzeDataComplexity(text: string): {
        complexity: 'simple' | 'moderate' | 'complex';
        size_mentioned: boolean;
        transformation_needed: boolean;
    } {
        let complexity: 'simple' | 'moderate' | 'complex' = 'simple';
        let sizeMentioned = false;
        let transformationNeeded = false;

        // Check for size indicators
        const sizePatterns = [
            /\b(large|big|massive|extensive)\b/i,
            /\b\d+\s*(mb|gb|kb|thousand|million)\b/i,
            /\bmultiple\s+(files?|documents?|records?)\b/i,
        ];

        if (sizePatterns.some(p => p.test(text))) {
            complexity = 'moderate';
            // Upgrade to complex for explicit large sizes
            if (/\b\d+\s*(mb|gb|million)\b/i.test(text) || /\b(massive|extensive)\b/i.test(text)) {
                complexity = 'complex';
            }
            sizeMentioned = true;
        }

        // Check for transformation indicators
        const transformPatterns = [
            /\b(transform|convert|parse|format|restructure|normalize)\b/i,
            /\b(extract|filter|aggregate|merge|join|combine)\b/i,
            /\b(clean|sanitize|validate|process|analyze|visualize|chart|graph)\b/i,
        ];

        if (transformPatterns.some(p => p.test(text))) {
            transformationNeeded = true;
            if (complexity === 'simple') {
                complexity = 'moderate';
            }
        }

        // Check for complex data operations
        const complexPatterns = [
            /\b(pipeline|workflow|batch|bulk)\b/i,
            /\b(complex|sophisticated|advanced)\b.*\b(processing|analysis|transformation)\b/i,
            /\bmultiple\s+transformations?\b/i,
            /\b(visualization|chart|graph)s?\b/i,
        ];

        if (complexPatterns.some(p => p.test(text))) {
            complexity = 'complex';
        }

        return { complexity, size_mentioned: sizeMentioned, transformation_needed: transformationNeeded };
    }

    /**
     * Analyze logic complexity
     */
    private analyzeLogicComplexity(text: string): {
        has_conditionals: boolean;
        has_loops: boolean;
        has_error_handling: boolean;
        complexity_level: number; // 1-10
    } {
        // Check for conditional logic
        const conditionalPatterns = [
            /\b(if|when|unless|whether|depending on|based on)\b/i,
            /\b(either|or|otherwise)\b/i,
            /\b(condition|conditional|case)\b/i,
        ];
        const hasConditionals = conditionalPatterns.some(p => p.test(text));

        // Check for loops/iteration
        const loopPatterns = [
            /\b(each|every|all|multiple|batch|iterate|loop|repeat)\b/i,
            /\bfor\s+(each|every|all)\b/i,
        ];
        const hasLoops = loopPatterns.some(p => p.test(text));

        // Check for error handling mentions
        const errorPatterns = [
            /\b(error|exception|failure|handle|catch|retry|fallback)\b/i,
            /\b(if.*fails?|when.*fails?)\b/i,
        ];
        const hasErrorHandling = errorPatterns.some(p => p.test(text));

        // Calculate complexity level
        let complexityLevel = 1;
        if (hasConditionals) complexityLevel += 3;
        if (hasLoops) complexityLevel += 3;
        if (hasErrorHandling) complexityLevel += 2;
        if (hasConditionals && hasLoops) complexityLevel += 2; // Bonus for combination

        complexityLevel = Math.min(complexityLevel, 10);

        return {
            has_conditionals: hasConditionals,
            has_loops: hasLoops,
            has_error_handling: hasErrorHandling,
            complexity_level: complexityLevel,
        };
    }

    /**
     * Calculate tools score (1-10)
     */
    private calculateToolsScore(toolCount: number): number {
        // 1 tool = 2, 2 tools = 4, 3 tools = 6, 4 tools = 8, 5+ tools = 10
        if (toolCount === 1) return 2;
        if (toolCount === 2) return 4;
        if (toolCount === 3) return 6;
        if (toolCount === 4) return 8;
        if (toolCount >= 5) return 10;
        return 1;
    }

    /**
     * Calculate steps score (1-10)
     */
    private calculateStepsScore(stepCount: number): number {
        // 1 step = 2, 2 steps = 4, 3 steps = 6, 4 steps = 8, 5+ = 10
        if (stepCount === 1) return 2;
        if (stepCount === 2) return 4;
        if (stepCount === 3) return 6;
        if (stepCount === 4) return 8;
        return Math.min(8 + stepCount - 4, 10);
    }

    /**
     * Calculate data score (1-10)
     */
    private calculateDataScore(dataAnalysis: ReturnType<typeof this.analyzeDataComplexity>): number {
        if (dataAnalysis.complexity === 'simple') return 2;
        if (dataAnalysis.complexity === 'moderate') return 5;
        return 8;
    }

    /**
     * Calculate logic score (1-10)
     */
    private calculateLogicScore(logicAnalysis: ReturnType<typeof this.analyzeLogicComplexity>): number {
        return logicAnalysis.complexity_level;
    }

    /**
     * Determine workflow structure
     */
    private determineWorkflowStructure(
        stepsAnalysis: ReturnType<typeof this.analyzeSteps>,
        logicAnalysis: ReturnType<typeof this.analyzeLogicComplexity>
    ): 'linear' | 'branching' | 'complex' {
        if (logicAnalysis.has_conditionals && logicAnalysis.has_loops) {
            return 'complex';
        }

        if (logicAnalysis.has_conditionals || stepsAnalysis.count > 5) {
            return 'branching';
        }

        return 'linear';
    }

    /**
     * Batch analysis for multiple tasks
     */
    async analyzeComplexityBatch(tasks: string[]): Promise<ComplexityScore[]> {
        return Promise.all(tasks.map(task => this.analyzeComplexity(task)));
    }
}

// Export singleton instance
export const complexityAnalyzer = new ComplexityAnalyzer();
