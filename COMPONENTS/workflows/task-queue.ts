/**
 * Task Queue for Workflow Orchestration
 *
 * Priority-based task queue with retry logic and concurrency control.
 *
 * Features:
 * - Priority levels
 * - Retry with exponential backoff
 * - Concurrency limits
 * - Task dependencies
 * - Progress tracking
 * - Error handling
 *
 * @example
 * ```typescript
 * const queue = new TaskQueue({
 *   concurrency: 5,
 *   retryAttempts: 3
 * })
 *
 * await queue.addTask({
 *   id: 'task-1',
 *   priority: 'high',
 *   execute: async () => {
 *     // Task logic
 *   }
 * })
 *
 * await queue.start()
 * ```
 */

export type TaskPriority = 'low' | 'normal' | 'high' | 'urgent'
export type TaskStatus = 'pending' | 'running' | 'completed' | 'failed' | 'retry'

export interface Task<T = any> {
  id: string
  priority?: TaskPriority
  execute: () => Promise<T>
  onSuccess?: (result: T) => void | Promise<void>
  onError?: (error: Error) => void | Promise<void>
  dependsOn?: string[]
  timeout?: number
  metadata?: Record<string, any>
}

export interface TaskQueueOptions {
  concurrency?: number
  retryAttempts?: number
  retryDelay?: number
  timeout?: number
  onTaskComplete?: (task: Task, result: any) => void
  onTaskError?: (task: Task, error: Error) => void
}

interface QueuedTask<T = any> extends Task<T> {
  status: TaskStatus
  attempts: number
  error?: Error
  result?: T
  startTime?: number
  endTime?: number
}

export class TaskQueue {
  private options: Required<Omit<TaskQueueOptions, 'onTaskComplete' | 'onTaskError'>> & {
    onTaskComplete?: (task: Task, result: any) => void
    onTaskError?: (task: Task, error: Error) => void
  }

  private tasks: Map<string, QueuedTask> = new Map()
  private running: Set<string> = new Set()
  private completed: Set<string> = new Set()
  private failed: Set<string> = new Set()

  private isRunning = false
  private isPaused = false

  constructor(options: TaskQueueOptions = {}) {
    this.options = {
      concurrency: options.concurrency || 5,
      retryAttempts: options.retryAttempts || 3,
      retryDelay: options.retryDelay || 1000,
      timeout: options.timeout || 30000,
      onTaskComplete: options.onTaskComplete,
      onTaskError: options.onTaskError,
    }
  }

  /**
   * Add task to queue
   */
  async addTask<T>(task: Task<T>): Promise<void> {
    if (this.tasks.has(task.id)) {
      throw new Error(`Task with id ${task.id} already exists`)
    }

    const queuedTask: QueuedTask<T> = {
      ...task,
      priority: task.priority || 'normal',
      status: 'pending',
      attempts: 0,
    }

    this.tasks.set(task.id, queuedTask)

    // Auto-start if not running
    if (!this.isRunning) {
      await this.start()
    }
  }

  /**
   * Add multiple tasks
   */
  async addTasks(tasks: Task[]): Promise<void> {
    for (const task of tasks) {
      await this.addTask(task)
    }
  }

  /**
   * Start processing queue
   */
  async start(): Promise<void> {
    if (this.isRunning) return

    this.isRunning = true
    this.isPaused = false

    while (this.hasTasksToProcess() && !this.isPaused) {
      if (this.running.size < this.options.concurrency) {
        const task = this.getNextTask()
        if (task) {
          this.processTask(task)
        }
      }

      // Wait a bit before checking again
      await this.sleep(10)
    }

    // Wait for all running tasks to complete
    while (this.running.size > 0) {
      await this.sleep(100)
    }

    this.isRunning = false
  }

  /**
   * Pause queue processing
   */
  pause(): void {
    this.isPaused = true
  }

  /**
   * Resume queue processing
   */
  async resume(): Promise<void> {
    if (!this.isPaused) return
    this.isPaused = false
    await this.start()
  }

  /**
   * Stop queue and cancel pending tasks
   */
  stop(): void {
    this.isPaused = true
    this.isRunning = false
  }

  /**
   * Get next task to process
   */
  private getNextTask(): QueuedTask | null {
    const pendingTasks = Array.from(this.tasks.values()).filter(
      t => t.status === 'pending' || t.status === 'retry'
    )

    if (pendingTasks.length === 0) return null

    // Filter tasks whose dependencies are met
    const readyTasks = pendingTasks.filter(task =>
      this.areDependenciesMet(task)
    )

    if (readyTasks.length === 0) return null

    // Sort by priority
    readyTasks.sort((a, b) => {
      const priorityOrder: Record<TaskPriority, number> = {
        urgent: 4,
        high: 3,
        normal: 2,
        low: 1,
      }
      return priorityOrder[b.priority!] - priorityOrder[a.priority!]
    })

    return readyTasks[0]
  }

  /**
   * Check if task dependencies are met
   */
  private areDependenciesMet(task: QueuedTask): boolean {
    if (!task.dependsOn || task.dependsOn.length === 0) return true

    return task.dependsOn.every(depId => {
      const depTask = this.tasks.get(depId)
      return depTask && this.completed.has(depId)
    })
  }

  /**
   * Process a single task
   */
  private async processTask(task: QueuedTask): Promise<void> {
    this.running.add(task.id)
    task.status = 'running'
    task.startTime = Date.now()
    task.attempts++

    try {
      // Execute with timeout
      const timeout = task.timeout || this.options.timeout
      const result = await this.executeWithTimeout(task.execute(), timeout)

      // Task succeeded
      task.status = 'completed'
      task.result = result
      task.endTime = Date.now()

      this.completed.add(task.id)
      this.running.delete(task.id)

      // Callbacks
      await task.onSuccess?.(result)
      this.options.onTaskComplete?.(task, result)
    } catch (error) {
      // Task failed
      task.error = error as Error
      task.endTime = Date.now()

      // Retry if attempts remaining
      if (task.attempts < this.options.retryAttempts) {
        task.status = 'retry'
        this.running.delete(task.id)

        // Wait before retry (exponential backoff)
        const delay = this.options.retryDelay * Math.pow(2, task.attempts - 1)
        await this.sleep(delay)
      } else {
        // No more retries
        task.status = 'failed'
        this.failed.add(task.id)
        this.running.delete(task.id)

        // Callbacks
        await task.onError?.(task.error)
        this.options.onTaskError?.(task, task.error)
      }
    }
  }

  /**
   * Execute function with timeout
   */
  private async executeWithTimeout<T>(
    promise: Promise<T>,
    timeout: number
  ): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error('Task timeout')), timeout)
      ),
    ])
  }

  /**
   * Check if there are tasks to process
   */
  private hasTasksToProcess(): boolean {
    return Array.from(this.tasks.values()).some(
      t => (t.status === 'pending' || t.status === 'retry') && this.areDependenciesMet(t)
    )
  }

  /**
   * Get queue statistics
   */
  getStats(): {
    total: number
    pending: number
    running: number
    completed: number
    failed: number
  } {
    const tasks = Array.from(this.tasks.values())
    return {
      total: tasks.length,
      pending: tasks.filter(t => t.status === 'pending' || t.status === 'retry').length,
      running: this.running.size,
      completed: this.completed.size,
      failed: this.failed.size,
    }
  }

  /**
   * Get task by ID
   */
  getTask(id: string): QueuedTask | undefined {
    return this.tasks.get(id)
  }

  /**
   * Get all tasks
   */
  getAllTasks(): QueuedTask[] {
    return Array.from(this.tasks.values())
  }

  /**
   * Clear completed tasks
   */
  clearCompleted(): void {
    for (const id of this.completed) {
      this.tasks.delete(id)
    }
    this.completed.clear()
  }

  /**
   * Clear failed tasks
   */
  clearFailed(): void {
    for (const id of this.failed) {
      this.tasks.delete(id)
    }
    this.failed.clear()
  }

  /**
   * Clear all tasks
   */
  clear(): void {
    this.tasks.clear()
    this.running.clear()
    this.completed.clear()
    this.failed.clear()
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

/**
 * Create task queue with default options
 */
export function createTaskQueue(options: TaskQueueOptions = {}): TaskQueue {
  return new TaskQueue(options)
}
