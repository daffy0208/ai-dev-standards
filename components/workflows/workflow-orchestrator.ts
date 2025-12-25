/**
 * Workflow Orchestrator for Multi-Agent Systems
 *
 * Step-by-step workflow execution with conditional branching, error recovery, and state persistence.
 *
 * Features:
 * - Linear and parallel step execution
 * - Conditional branching
 * - Error recovery strategies (retry, skip, abort)
 * - Step dependencies
 * - Workflow state persistence
 * - Rollback support
 * - Step timeout handling
 * - Progress tracking
 *
 * @example
 * ```typescript
 * const orchestrator = new WorkflowOrchestrator({
 *   id: 'data-pipeline',
 *   persistence: true,
 *   onStepComplete: (step, result) => console.log(`${step.id} complete`)
 * })
 *
 * orchestrator
 *   .addStep({
 *     id: 'fetch-data',
 *     execute: async (context) => {
 *       const data = await fetchData()
 *       return { data }
 *     }
 *   })
 *   .addStep({
 *     id: 'process-data',
 *     execute: async (context) => {
 *       const processed = processData(context.data)
 *       return { processed }
 *     },
 *     dependsOn: ['fetch-data']
 *   })
 *   .addStep({
 *     id: 'save-data',
 *     execute: async (context) => {
 *       await saveData(context.processed)
 *     },
 *     dependsOn: ['process-data']
 *   })
 *
 * const result = await orchestrator.execute()
 * ```
 */

export type StepStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped' | 'rolled_back'
export type ExecutionMode = 'linear' | 'parallel'
export type ErrorStrategy = 'retry' | 'skip' | 'abort' | 'continue'
export type WorkflowStatus = 'idle' | 'running' | 'paused' | 'completed' | 'failed' | 'rolled_back'

/**
 * Custom error class for workflow errors
 */
export class WorkflowError extends Error {
  constructor(
    message: string,
    public stepId: string,
    public originalError?: Error
  ) {
    super(message)
    this.name = 'WorkflowError'
  }
}

/**
 * Result of a step execution
 */
export interface StepResult<T = unknown> {
  success: boolean
  data?: T
  error?: Error
  duration?: number
  attempts?: number
}

/**
 * Workflow step definition
 */
export interface WorkflowStep<T = unknown> {
  id: string
  name?: string
  execute: (context: WorkflowContext) => Promise<T>
  condition?: (context: WorkflowContext) => boolean | Promise<boolean>
  onSuccess?: (result: T, context: WorkflowContext) => void | Promise<void>
  onError?: (error: Error, context: WorkflowContext) => void | Promise<void>
  rollback?: (context: WorkflowContext) => void | Promise<void>
  dependsOn?: string[]
  timeout?: number
  retryAttempts?: number
  retryDelay?: number
  errorStrategy?: ErrorStrategy
  metadata?: Record<string, unknown>
}

/**
 * Workflow context - shared state across steps
 */
export type WorkflowContext = Record<string, unknown>

/**
 * Workflow options
 */
export interface WorkflowOptions {
  id: string
  name?: string
  mode?: ExecutionMode
  maxConcurrency?: number
  defaultTimeout?: number
  defaultRetryAttempts?: number
  defaultRetryDelay?: number
  defaultErrorStrategy?: ErrorStrategy
  persistence?: boolean
  persistencePath?: string
  onStepStart?: (step: WorkflowStep) => void | Promise<void>
  onStepComplete?: (step: WorkflowStep, result: StepResult) => void | Promise<void>
  onStepError?: (step: WorkflowStep, error: Error) => void | Promise<void>
  onWorkflowComplete?: (state: WorkflowState) => void | Promise<void>
  onWorkflowError?: (error: Error, state: WorkflowState) => void | Promise<void>
}

/**
 * Internal step state
 */
interface StepState<T = unknown> extends WorkflowStep<T> {
  status: StepStatus
  attempts: number
  result?: StepResult<T>
  startTime?: number
  endTime?: number
}

/**
 * Workflow state snapshot
 */
export interface WorkflowState {
  id: string
  status: WorkflowStatus
  context: WorkflowContext
  steps: Map<string, StepState>
  executionOrder: string[]
  currentStep?: string
  startTime?: number
  endTime?: number
  error?: Error
}

/**
 * Workflow Orchestrator
 */
export class WorkflowOrchestrator {
  private options: Required<
    Omit<
      WorkflowOptions,
      | 'name'
      | 'onStepStart'
      | 'onStepComplete'
      | 'onStepError'
      | 'onWorkflowComplete'
      | 'onWorkflowError'
      | 'persistencePath'
    >
  > & {
    name?: string
    persistencePath?: string
    onStepStart?: (step: WorkflowStep) => void | Promise<void>
    onStepComplete?: (step: WorkflowStep, result: StepResult) => void | Promise<void>
    onStepError?: (step: WorkflowStep, error: Error) => void | Promise<void>
    onWorkflowComplete?: (state: WorkflowState) => void | Promise<void>
    onWorkflowError?: (error: Error, state: WorkflowState) => void | Promise<void>
  }

  private steps: Map<string, StepState> = new Map()
  private context: WorkflowContext = {}
  private status: WorkflowStatus = 'idle'
  private executionOrder: string[] = []
  private currentStep?: string
  private startTime?: number
  private endTime?: number
  private isPaused = false
  private error?: Error

  constructor(options: WorkflowOptions) {
    this.options = {
      id: options.id,
      name: options.name,
      mode: options.mode || 'linear',
      maxConcurrency: options.maxConcurrency || 5,
      defaultTimeout: options.defaultTimeout || 60000,
      defaultRetryAttempts: options.defaultRetryAttempts || 3,
      defaultRetryDelay: options.defaultRetryDelay || 1000,
      defaultErrorStrategy: options.defaultErrorStrategy || 'abort',
      persistence: options.persistence || false,
      persistencePath: options.persistencePath,
      onStepStart: options.onStepStart,
      onStepComplete: options.onStepComplete,
      onStepError: options.onStepError,
      onWorkflowComplete: options.onWorkflowComplete,
      onWorkflowError: options.onWorkflowError
    }

    // Try to restore state if persistence enabled
    if (this.options.persistence) {
      this.restoreState()
    }
  }

  /**
   * Add a step to the workflow
   */
  addStep<T>(step: WorkflowStep<T>): this {
    if (this.steps.has(step.id)) {
      throw new WorkflowError(`Step with id ${step.id} already exists`, step.id)
    }

    const stepState: StepState<T> = {
      ...step,
      status: 'pending',
      attempts: 0,
      retryAttempts: step.retryAttempts ?? this.options.defaultRetryAttempts,
      retryDelay: step.retryDelay ?? this.options.defaultRetryDelay,
      timeout: step.timeout ?? this.options.defaultTimeout,
      errorStrategy: step.errorStrategy ?? this.options.defaultErrorStrategy
    }

    this.steps.set(step.id, stepState)
    return this
  }

  /**
   * Add multiple steps
   */
  addSteps(steps: WorkflowStep[]): this {
    steps.forEach(step => this.addStep(step))
    return this
  }

  /**
   * Execute the workflow
   */
  async execute(initialContext: WorkflowContext = {}): Promise<WorkflowState> {
    if (this.status === 'running') {
      throw new WorkflowError('Workflow is already running', 'workflow')
    }

    // Initialize
    this.status = 'running'
    this.context = { ...this.context, ...initialContext }
    this.executionOrder = []
    this.startTime = Date.now()
    this.error = undefined
    this.isPaused = false

    try {
      // Validate dependencies
      this.validateDependencies()

      // Execute based on mode
      if (this.options.mode === 'parallel') {
        await this.executeParallel()
      } else {
        await this.executeLinear()
      }

      // Mark as completed
      this.status = 'completed'
      this.endTime = Date.now()

      const state = this.getState()
      await this.options.onWorkflowComplete?.(state)

      // Persist final state
      if (this.options.persistence) {
        await this.persistState()
      }

      return state
    } catch (error) {
      this.status = 'failed'
      this.endTime = Date.now()
      this.error = error as Error

      const state = this.getState()
      await this.options.onWorkflowError?.(error as Error, state)

      if (this.options.persistence) {
        await this.persistState()
      }

      throw error
    }
  }

  /**
   * Execute steps linearly
   */
  private async executeLinear(): Promise<void> {
    const sortedSteps = this.topologicalSort()

    for (const stepId of sortedSteps) {
      if (this.isPaused) {
        this.status = 'paused'
        return
      }

      const step = this.steps.get(stepId)!
      await this.executeStep(step)

      // Check error strategy
      if (step.status === 'failed') {
        const strategy = step.errorStrategy || this.options.defaultErrorStrategy
        if (strategy === 'abort') {
          throw new WorkflowError(
            `Step ${stepId} failed and error strategy is abort`,
            stepId,
            step.result?.error
          )
        }
      }
    }
  }

  /**
   * Execute steps in parallel
   */
  private async executeParallel(): Promise<void> {
    const sortedSteps = this.topologicalSort()
    const running = new Set<string>()
    const completed = new Set<string>()
    let index = 0

    while (index < sortedSteps.length || running.size > 0) {
      if (this.isPaused) {
        this.status = 'paused'
        return
      }

      // Start new steps up to concurrency limit
      while (running.size < this.options.maxConcurrency && index < sortedSteps.length) {
        const stepId = sortedSteps[index]
        const step = this.steps.get(stepId)!

        // Check if dependencies are met
        if (this.areDependenciesMet(step, completed)) {
          running.add(stepId)
          index++

          // Execute step without waiting
          this.executeStep(step)
            .then(() => {
              running.delete(stepId)
              if (step.status === 'completed') {
                completed.add(stepId)
              }
            })
            .catch(error => {
              running.delete(stepId)
              const strategy = step.errorStrategy || this.options.defaultErrorStrategy
              if (strategy === 'abort') {
                this.isPaused = true
                throw new WorkflowError(
                  `Step ${stepId} failed and error strategy is abort`,
                  stepId,
                  error
                )
              }
            })
        } else {
          break
        }
      }

      // Wait a bit before checking again
      await this.sleep(10)
    }
  }

  /**
   * Execute a single step
   */
  private async executeStep<T>(step: StepState<T>): Promise<void> {
    this.currentStep = step.id
    step.status = 'running'
    step.startTime = Date.now()

    await this.options.onStepStart?.(step)

    // Check condition
    if (step.condition) {
      try {
        const shouldExecute = await step.condition(this.context)
        if (!shouldExecute) {
          step.status = 'skipped'
          step.endTime = Date.now()
          this.executionOrder.push(step.id)
          return
        }
      } catch (error) {
        step.status = 'failed'
        step.result = {
          success: false,
          error: error as Error,
          duration: Date.now() - step.startTime!
        }
        await this.options.onStepError?.(step, error as Error)
        return
      }
    }

    // Execute with retry
    let lastError: Error | undefined
    for (let attempt = 0; attempt < (step.retryAttempts || 1); attempt++) {
      step.attempts = attempt + 1

      try {
        // Execute with timeout
        const result = await this.executeWithTimeout(step.execute(this.context), step.timeout!)

        // Success
        step.status = 'completed'
        step.endTime = Date.now()
        step.result = {
          success: true,
          data: result,
          duration: step.endTime - step.startTime!,
          attempts: step.attempts
        }

        // Update context with result
        this.context[step.id] = result

        // Callbacks
        await step.onSuccess?.(result, this.context)
        await this.options.onStepComplete?.(step, step.result)

        this.executionOrder.push(step.id)

        // Persist state after each step
        if (this.options.persistence) {
          await this.persistState()
        }

        return
      } catch (error) {
        lastError = error as Error

        // Wait before retry
        if (attempt < (step.retryAttempts || 1) - 1) {
          const delay = (step.retryDelay || 1000) * Math.pow(2, attempt)
          await this.sleep(delay)
        }
      }
    }

    // All retries failed
    step.status = 'failed'
    step.endTime = Date.now()
    step.result = {
      success: false,
      error: lastError,
      duration: step.endTime - step.startTime!,
      attempts: step.attempts
    }

    await step.onError?.(lastError!, this.context)
    await this.options.onStepError?.(step, lastError!)

    this.executionOrder.push(step.id)

    // Handle error strategy
    const strategy = step.errorStrategy || this.options.defaultErrorStrategy
    if (strategy === 'abort') {
      throw new WorkflowError(
        `Step ${step.id} failed after ${step.attempts} attempts`,
        step.id,
        lastError
      )
    }
  }

  /**
   * Pause workflow execution
   */
  pause(): void {
    this.isPaused = true
  }

  /**
   * Resume workflow execution
   */
  async resume(): Promise<WorkflowState> {
    if (!this.isPaused) {
      throw new WorkflowError('Workflow is not paused', 'workflow')
    }

    this.isPaused = false
    return this.execute(this.context)
  }

  /**
   * Rollback workflow
   */
  async rollback(): Promise<void> {
    // Execute rollback in reverse order
    const completedSteps = this.executionOrder.reverse()

    for (const stepId of completedSteps) {
      const step = this.steps.get(stepId)
      if (step && step.status === 'completed' && step.rollback) {
        try {
          await step.rollback(this.context)
          step.status = 'rolled_back'
        } catch (error) {
          console.error(`Failed to rollback step ${stepId}:`, error)
        }
      }
    }

    this.status = 'rolled_back'
    this.executionOrder.reverse() // Restore original order
  }

  /**
   * Get current workflow state
   */
  getState(): WorkflowState {
    return {
      id: this.options.id,
      status: this.status,
      context: { ...this.context },
      steps: new Map(this.steps),
      executionOrder: [...this.executionOrder],
      currentStep: this.currentStep,
      startTime: this.startTime,
      endTime: this.endTime,
      error: this.error
    }
  }

  /**
   * Get step by ID
   */
  getStep(id: string): StepState | undefined {
    return this.steps.get(id)
  }

  /**
   * Clear workflow
   */
  clear(): void {
    this.steps.clear()
    this.context = {}
    this.status = 'idle'
    this.executionOrder = []
    this.currentStep = undefined
    this.startTime = undefined
    this.endTime = undefined
    this.error = undefined
  }

  /**
   * Validate step dependencies
   */
  private validateDependencies(): void {
    for (const [stepId, step] of this.steps) {
      if (step.dependsOn) {
        for (const depId of step.dependsOn) {
          if (!this.steps.has(depId)) {
            throw new WorkflowError(`Step ${stepId} depends on non-existent step ${depId}`, stepId)
          }
        }
      }
    }

    // Check for circular dependencies
    const visited = new Set<string>()
    const recursionStack = new Set<string>()

    const hasCycle = (stepId: string): boolean => {
      visited.add(stepId)
      recursionStack.add(stepId)

      const step = this.steps.get(stepId)!
      if (step.dependsOn) {
        for (const depId of step.dependsOn) {
          if (!visited.has(depId)) {
            if (hasCycle(depId)) return true
          } else if (recursionStack.has(depId)) {
            return true
          }
        }
      }

      recursionStack.delete(stepId)
      return false
    }

    for (const stepId of this.steps.keys()) {
      if (!visited.has(stepId)) {
        if (hasCycle(stepId)) {
          throw new WorkflowError('Circular dependency detected', stepId)
        }
      }
    }
  }

  /**
   * Topological sort of steps
   */
  private topologicalSort(): string[] {
    const sorted: string[] = []
    const visited = new Set<string>()

    const visit = (stepId: string): void => {
      if (visited.has(stepId)) return
      visited.add(stepId)

      const step = this.steps.get(stepId)!
      if (step.dependsOn) {
        for (const depId of step.dependsOn) {
          visit(depId)
        }
      }

      sorted.push(stepId)
    }

    for (const stepId of this.steps.keys()) {
      visit(stepId)
    }

    return sorted
  }

  /**
   * Check if step dependencies are met
   */
  private areDependenciesMet(step: StepState, completed: Set<string>): boolean {
    if (!step.dependsOn || step.dependsOn.length === 0) return true
    return step.dependsOn.every(depId => completed.has(depId))
  }

  /**
   * Execute with timeout
   */
  private async executeWithTimeout<T>(promise: Promise<T>, timeout: number): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) => setTimeout(() => reject(new Error('Step timeout')), timeout))
    ])
  }

  /**
   * Persist state to storage
   */
  private async persistState(): Promise<void> {
    if (!this.options.persistence) return

    const state = this.getState()
    const serialized = JSON.stringify({
      ...state,
      steps: Array.from(state.steps.entries())
    })

    // In browser: localStorage
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(`workflow:${this.options.id}`, serialized)
    }

    // In Node.js: file system (if path provided)
    if (this.options.persistencePath && typeof require !== 'undefined') {
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const fs = require('fs').promises
        await fs.writeFile(this.options.persistencePath, serialized, 'utf8')
      } catch (error) {
        console.error('Failed to persist workflow state:', error)
      }
    }
  }

  /**
   * Restore state from storage
   */
  private restoreState(): void {
    let serialized: string | null = null

    // Try browser localStorage
    if (typeof localStorage !== 'undefined') {
      serialized = localStorage.getItem(`workflow:${this.options.id}`)
    }

    // Try Node.js file system
    if (!serialized && this.options.persistencePath && typeof require !== 'undefined') {
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const fs = require('fs')
        serialized = fs.readFileSync(this.options.persistencePath, 'utf8')
      } catch (error) {
        // File doesn't exist or can't be read
      }
    }

    if (serialized) {
      try {
        const parsed = JSON.parse(serialized)
        this.status = parsed.status
        this.context = parsed.context
        this.steps = new Map(parsed.steps)
        this.executionOrder = parsed.executionOrder
        this.currentStep = parsed.currentStep
        this.startTime = parsed.startTime
        this.endTime = parsed.endTime
      } catch (error) {
        console.error('Failed to restore workflow state:', error)
      }
    }
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

/**
 * Create workflow orchestrator with default options
 */
export function createWorkflowOrchestrator(options: WorkflowOptions): WorkflowOrchestrator {
  return new WorkflowOrchestrator(options)
}
