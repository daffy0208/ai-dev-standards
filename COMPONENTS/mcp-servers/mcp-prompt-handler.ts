/**
 * MCP Prompt Handler Component
 *
 * Standardized prompt handling pattern for MCP servers.
 * Manages prompt templates, variable substitution, and prompt execution.
 *
 * @example
 * ```typescript
 * import { MCPPromptHandler } from './mcp-prompt-handler';
 *
 * const promptHandler = new MCPPromptHandler({
 *   name: 'code_review',
 *   description: 'Generate code review prompt',
 *   template: `Review the following {{language}} code:\n\n{{code}}\n\nFocus on: {{focus_areas}}`,
 *   variables: {
 *     language: { type: 'string', required: true },
 *     code: { type: 'string', required: true },
 *     focus_areas: { type: 'array', default: ['security', 'performance'] }
 *   }
 * });
 *
 * const prompt = await promptHandler.execute({
 *   language: 'TypeScript',
 *   code: 'const x = 1;',
 *   focus_areas: ['security']
 * });
 * ```
 */

import { z } from 'zod'

export interface PromptHandlerConfig {
  name: string
  description: string
  template: string | ((args: Record<string, any>) => string | Promise<string>)
  variables?: Record<string, PromptVariable>
  examples?: PromptExample[]
  metadata?: Record<string, any>
  validation?: {
    maxLength?: number
    minLength?: number
    allowedPatterns?: RegExp[]
    blockedPatterns?: RegExp[]
  }
}

export interface PromptVariable {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object'
  description?: string
  required?: boolean
  default?: any
  validation?: z.ZodSchema | ((value: any) => boolean)
}

export interface PromptExample {
  description: string
  input: Record<string, any>
  expectedOutput: string
}

export interface PromptExecutionResult {
  success: boolean
  prompt?: string
  metadata: {
    promptName: string
    variables: Record<string, any>
    length: number
    executionTime: number
    timestamp: Date
  }
  error?: {
    code: string
    message: string
    details?: any
  }
}

/**
 * MCP Prompt Handler
 *
 * Handles prompt generation with:
 * - Template processing
 * - Variable validation and substitution
 * - Dynamic prompt generation
 * - Prompt caching
 * - Example management
 */
export class MCPPromptHandler {
  private config: PromptHandlerConfig
  private cache: Map<string, { prompt: string; expiresAt: number }> = new Map()
  private executionCount: number = 0

  constructor(config: PromptHandlerConfig) {
    this.config = config
    this.validateConfig()
  }

  /**
   * Execute the prompt with provided variables
   */
  async execute(args: Record<string, any> = {}): Promise<PromptExecutionResult> {
    const startTime = Date.now()

    try {
      // Validate and process variables
      const processedArgs = this.processVariables(args)

      // Check cache
      const cacheKey = this.getCacheKey(processedArgs)
      const cached = this.cache.get(cacheKey)

      if (cached && Date.now() < cached.expiresAt) {
        return this.createSuccessResult(cached.prompt, processedArgs, startTime)
      }

      // Generate prompt
      let prompt: string
      if (typeof this.config.template === 'function') {
        prompt = await this.config.template(processedArgs)
      } else {
        prompt = this.substituteVariables(this.config.template, processedArgs)
      }

      // Validate prompt
      this.validatePrompt(prompt)

      // Cache result (5 minutes default)
      this.cache.set(cacheKey, {
        prompt,
        expiresAt: Date.now() + 300000
      })

      this.executionCount++
      return this.createSuccessResult(prompt, processedArgs, startTime)
    } catch (error) {
      return this.createErrorResult(
        error.code || 'PROMPT_EXECUTION_FAILED',
        error.message || 'Failed to execute prompt',
        args,
        startTime,
        error.details
      )
    }
  }

  /**
   * Process and validate variables
   */
  private processVariables(args: Record<string, any>): Record<string, any> {
    const processed: Record<string, any> = {}

    // Process defined variables
    if (this.config.variables) {
      for (const [name, variable] of Object.entries(this.config.variables)) {
        let value = args[name]

        // Check required
        if (variable.required && (value === undefined || value === null)) {
          throw {
            code: 'MISSING_REQUIRED_VARIABLE',
            message: `Required variable '${name}' is missing`,
            details: { variable: name }
          }
        }

        // Apply default
        if (value === undefined && variable.default !== undefined) {
          value = variable.default
        }

        // Validate type
        if (value !== undefined) {
          this.validateVariableType(name, value, variable)
        }

        // Apply validation
        if (value !== undefined && variable.validation) {
          this.validateVariableValue(name, value, variable)
        }

        if (value !== undefined) {
          processed[name] = value
        }
      }
    }

    // Include any additional args
    for (const [name, value] of Object.entries(args)) {
      if (!(name in processed)) {
        processed[name] = value
      }
    }

    return processed
  }

  /**
   * Validate variable type
   */
  private validateVariableType(name: string, value: any, variable: PromptVariable): void {
    const actualType = Array.isArray(value) ? 'array' : typeof value

    if (variable.type === 'object' && actualType !== 'object') {
      throw {
        code: 'INVALID_VARIABLE_TYPE',
        message: `Variable '${name}' must be of type ${variable.type}, got ${actualType}`,
        details: { variable: name, expected: variable.type, actual: actualType }
      }
    }

    if (variable.type !== 'object' && variable.type !== actualType) {
      throw {
        code: 'INVALID_VARIABLE_TYPE',
        message: `Variable '${name}' must be of type ${variable.type}, got ${actualType}`,
        details: { variable: name, expected: variable.type, actual: actualType }
      }
    }
  }

  /**
   * Validate variable value
   */
  private validateVariableValue(name: string, value: any, variable: PromptVariable): void {
    if (!variable.validation) return

    if (variable.validation instanceof z.ZodSchema) {
      try {
        variable.validation.parse(value)
      } catch (error) {
        throw {
          code: 'VARIABLE_VALIDATION_FAILED',
          message: `Variable '${name}' failed validation: ${error.message}`,
          details: { variable: name, value, error: error.errors }
        }
      }
    } else if (typeof variable.validation === 'function') {
      const isValid = variable.validation(value)
      if (!isValid) {
        throw {
          code: 'VARIABLE_VALIDATION_FAILED',
          message: `Variable '${name}' failed validation`,
          details: { variable: name, value }
        }
      }
    }
  }

  /**
   * Substitute variables in template
   */
  private substituteVariables(template: string, args: Record<string, any>): string {
    let result = template

    // Replace {{variable}} syntax
    for (const [name, value] of Object.entries(args)) {
      const regex = new RegExp(`\\{\\{\\s*${name}\\s*\\}\\}`, 'g')
      const stringValue = this.formatValue(value)
      result = result.replace(regex, stringValue)
    }

    // Check for unsubstituted variables
    const unsubstituted = result.match(/\{\{\s*\w+\s*\}\}/g)
    if (unsubstituted) {
      const variables = unsubstituted.map(v => v.replace(/\{\{|\}\}/g, '').trim())
      throw {
        code: 'UNSUBSTITUTED_VARIABLES',
        message: `Template contains unsubstituted variables: ${variables.join(', ')}`,
        details: { variables }
      }
    }

    return result
  }

  /**
   * Format value for substitution
   */
  private formatValue(value: any): string {
    if (Array.isArray(value)) {
      return value.map(v => String(v)).join(', ')
    }

    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value, null, 2)
    }

    return String(value)
  }

  /**
   * Validate generated prompt
   */
  private validatePrompt(prompt: string): void {
    const validation = this.config.validation
    if (!validation) return

    // Check length
    if (validation.minLength && prompt.length < validation.minLength) {
      throw {
        code: 'PROMPT_TOO_SHORT',
        message: `Prompt must be at least ${validation.minLength} characters`,
        details: { length: prompt.length, minLength: validation.minLength }
      }
    }

    if (validation.maxLength && prompt.length > validation.maxLength) {
      throw {
        code: 'PROMPT_TOO_LONG',
        message: `Prompt must be at most ${validation.maxLength} characters`,
        details: { length: prompt.length, maxLength: validation.maxLength }
      }
    }

    // Check allowed patterns
    if (validation.allowedPatterns) {
      const matches = validation.allowedPatterns.some(pattern => pattern.test(prompt))
      if (!matches) {
        throw {
          code: 'PROMPT_PATTERN_MISMATCH',
          message: 'Prompt does not match any allowed patterns',
          details: {}
        }
      }
    }

    // Check blocked patterns
    if (validation.blockedPatterns) {
      const matches = validation.blockedPatterns.find(pattern => pattern.test(prompt))
      if (matches) {
        throw {
          code: 'PROMPT_CONTAINS_BLOCKED_PATTERN',
          message: 'Prompt contains blocked content',
          details: { pattern: matches.source }
        }
      }
    }
  }

  /**
   * Validate configuration
   */
  private validateConfig(): void {
    if (!this.config.name || !this.config.description || !this.config.template) {
      throw new Error('PromptHandler requires name, description, and template')
    }
  }

  /**
   * Get cache key
   */
  private getCacheKey(args: Record<string, any>): string {
    return `${this.config.name}:${JSON.stringify(args)}`
  }

  /**
   * Get examples for this prompt
   */
  getExamples(): PromptExample[] {
    return this.config.examples || []
  }

  /**
   * Get variable definitions
   */
  getVariables(): Record<string, PromptVariable> {
    return this.config.variables || {}
  }

  /**
   * Get prompt metadata
   */
  getMetadata() {
    return {
      name: this.config.name,
      description: this.config.description,
      variables: Object.keys(this.config.variables || {}),
      exampleCount: (this.config.examples || []).length,
      executionCount: this.executionCount
    }
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear()
  }

  /**
   * Create success result
   */
  private createSuccessResult(
    prompt: string,
    variables: Record<string, any>,
    startTime: number
  ): PromptExecutionResult {
    return {
      success: true,
      prompt,
      metadata: {
        promptName: this.config.name,
        variables,
        length: prompt.length,
        executionTime: Date.now() - startTime,
        timestamp: new Date()
      }
    }
  }

  /**
   * Create error result
   */
  private createErrorResult(
    code: string,
    message: string,
    variables: Record<string, any>,
    startTime: number,
    details?: any
  ): PromptExecutionResult {
    return {
      success: false,
      metadata: {
        promptName: this.config.name,
        variables,
        length: 0,
        executionTime: Date.now() - startTime,
        timestamp: new Date()
      },
      error: {
        code,
        message,
        details
      }
    }
  }
}

export default MCPPromptHandler
