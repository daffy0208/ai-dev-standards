/**
 * State Manager for Multi-Agent Systems
 *
 * Distributed state management with snapshots, history, and pub/sub capabilities.
 *
 * Features:
 * - State get/set/delete operations
 * - State snapshots and restoration
 * - State history with undo/redo
 * - State diffing
 * - State persistence (localStorage/file)
 * - Pub/sub for state changes
 * - Typed state access
 * - State validation
 * - Time travel debugging
 *
 * @example
 * ```typescript
 * const stateManager = new StateManager({
 *   persistence: true,
 *   maxHistory: 50,
 *   validation: (state) => {
 *     if (!state.userId) throw new Error('userId required')
 *   }
 * })
 *
 * // Set state
 * stateManager.set('user', { id: 1, name: 'John' })
 *
 * // Subscribe to changes
 * stateManager.subscribe('user', (newValue, oldValue) => {
 *   console.log('User changed:', newValue)
 * })
 *
 * // Create snapshot
 * const snapshot = stateManager.snapshot()
 *
 * // Undo/redo
 * stateManager.undo()
 * stateManager.redo()
 * ```
 */

export type StateChangeListener<T = any> = (newValue: T, oldValue: T | undefined, path: string) => void
export type StateValidator = (state: Record<string, any>) => void | Promise<void>

/**
 * Custom error class for state errors
 */
export class StateError extends Error {
  constructor(message: string, public path?: string) {
    super(message)
    this.name = 'StateError'
  }
}

/**
 * State change record
 */
export interface StateChange {
  timestamp: number
  type: 'set' | 'delete'
  path: string
  oldValue?: any
  newValue?: any
}

/**
 * State snapshot
 */
export interface StateSnapshot {
  timestamp: number
  state: Record<string, any>
  metadata?: Record<string, any>
}

/**
 * State manager options
 */
export interface StateOptions {
  initialState?: Record<string, any>
  persistence?: boolean
  persistenceKey?: string
  persistencePath?: string
  maxHistory?: number
  validation?: StateValidator
  onChange?: StateChangeListener
  onError?: (error: Error) => void
  debounceMs?: number
}

/**
 * Subscription handle
 */
interface Subscription {
  id: string
  path: string
  pattern: RegExp
  listener: StateChangeListener
}

/**
 * State Manager
 */
export class StateManager {
  private options: Required<Omit<StateOptions,
    'initialState' | 'validation' | 'onChange' | 'onError' | 'persistencePath'
  >> & {
    initialState?: Record<string, any>
    validation?: StateValidator
    onChange?: StateChangeListener
    onError?: (error: Error) => void
    persistencePath?: string
  }

  private state: Record<string, any> = {}
  private history: StateChange[] = []
  private historyIndex = -1
  private subscriptions: Map<string, Subscription> = new Map()
  private snapshots: StateSnapshot[] = []
  private subscriptionCounter = 0
  private debounceTimers: Map<string, NodeJS.Timeout> = new Map()

  constructor(options: StateOptions = {}) {
    this.options = {
      initialState: options.initialState,
      persistence: options.persistence || false,
      persistenceKey: options.persistenceKey || 'state-manager',
      persistencePath: options.persistencePath,
      maxHistory: options.maxHistory || 100,
      validation: options.validation,
      onChange: options.onChange,
      onError: options.onError,
      debounceMs: options.debounceMs || 0,
    }

    // Initialize state
    if (this.options.initialState) {
      this.state = { ...this.options.initialState }
    }

    // Try to restore from persistence
    if (this.options.persistence) {
      this.restore()
    }
  }

  /**
   * Get state value by path
   */
  get<T = any>(path: string): T | undefined {
    return this.getNestedValue(this.state, path)
  }

  /**
   * Set state value by path
   */
  async set<T = any>(path: string, value: T): Promise<void> {
    const oldValue = this.get(path)

    // Validate if validator provided
    if (this.options.validation) {
      try {
        const newState = { ...this.state }
        this.setNestedValue(newState, path, value)
        await this.options.validation(newState)
      } catch (error) {
        const stateError = new StateError(
          `Validation failed for path ${path}: ${(error as Error).message}`,
          path
        )
        this.options.onError?.(stateError)
        throw stateError
      }
    }

    // Set the value
    this.setNestedValue(this.state, path, value)

    // Record change
    this.recordChange({
      timestamp: Date.now(),
      type: 'set',
      path,
      oldValue,
      newValue: value,
    })

    // Notify subscribers
    if (this.options.debounceMs > 0) {
      this.notifySubscribersDebounced(path, value, oldValue)
    } else {
      this.notifySubscribers(path, value, oldValue)
    }

    // Persist
    if (this.options.persistence) {
      await this.persist()
    }
  }

  /**
   * Delete state value by path
   */
  async delete(path: string): Promise<void> {
    const oldValue = this.get(path)
    if (oldValue === undefined) return

    // Delete the value
    this.deleteNestedValue(this.state, path)

    // Record change
    this.recordChange({
      timestamp: Date.now(),
      type: 'delete',
      path,
      oldValue,
      newValue: undefined,
    })

    // Notify subscribers
    this.notifySubscribers(path, undefined, oldValue)

    // Persist
    if (this.options.persistence) {
      await this.persist()
    }
  }

  /**
   * Check if path exists
   */
  has(path: string): boolean {
    return this.get(path) !== undefined
  }

  /**
   * Get all state
   */
  getAll(): Record<string, any> {
    return { ...this.state }
  }

  /**
   * Set multiple values at once
   */
  async setMany(values: Record<string, any>): Promise<void> {
    for (const [path, value] of Object.entries(values)) {
      await this.set(path, value)
    }
  }

  /**
   * Clear all state
   */
  async clear(): Promise<void> {
    const oldState = { ...this.state }
    this.state = {}

    // Record change
    this.recordChange({
      timestamp: Date.now(),
      type: 'delete',
      path: '*',
      oldValue: oldState,
      newValue: undefined,
    })

    // Notify all subscribers
    for (const [path, value] of Object.entries(oldState)) {
      this.notifySubscribers(path, undefined, value)
    }

    // Persist
    if (this.options.persistence) {
      await this.persist()
    }
  }

  /**
   * Subscribe to state changes
   */
  subscribe<T = any>(path: string, listener: StateChangeListener<T>): string {
    const id = `sub-${++this.subscriptionCounter}`
    const pattern = this.pathToRegex(path)

    this.subscriptions.set(id, {
      id,
      path,
      pattern,
      listener: listener as StateChangeListener,
    })

    return id
  }

  /**
   * Unsubscribe from state changes
   */
  unsubscribe(id: string): void {
    this.subscriptions.delete(id)
  }

  /**
   * Subscribe once
   */
  once<T = any>(path: string, listener: StateChangeListener<T>): string {
    const wrappedListener: StateChangeListener<T> = (newValue, oldValue, path) => {
      listener(newValue, oldValue, path)
      this.unsubscribe(id)
    }

    const id = this.subscribe(path, wrappedListener)
    return id
  }

  /**
   * Create state snapshot
   */
  snapshot(metadata?: Record<string, any>): StateSnapshot {
    const snapshot: StateSnapshot = {
      timestamp: Date.now(),
      state: JSON.parse(JSON.stringify(this.state)),
      metadata,
    }

    this.snapshots.push(snapshot)
    return snapshot
  }

  /**
   * Restore state from snapshot
   */
  async restore(snapshot?: StateSnapshot): Promise<void> {
    let targetSnapshot: StateSnapshot | undefined = snapshot

    if (!targetSnapshot) {
      // Restore from persistence
      if (this.options.persistence) {
        const persisted = this.loadFromPersistence()
        if (persisted) {
          this.state = persisted
          return
        }
      }
      return
    }

    const oldState = { ...this.state }
    this.state = JSON.parse(JSON.stringify(targetSnapshot.state))

    // Notify subscribers of all changes
    for (const path of this.getAllPaths(oldState)) {
      const oldValue = this.getNestedValue(oldState, path)
      const newValue = this.getNestedValue(this.state, path)
      if (oldValue !== newValue) {
        this.notifySubscribers(path, newValue, oldValue)
      }
    }

    for (const path of this.getAllPaths(this.state)) {
      const oldValue = this.getNestedValue(oldState, path)
      const newValue = this.getNestedValue(this.state, path)
      if (oldValue !== newValue) {
        this.notifySubscribers(path, newValue, oldValue)
      }
    }

    // Persist
    if (this.options.persistence) {
      await this.persist()
    }
  }

  /**
   * Get all snapshots
   */
  getSnapshots(): StateSnapshot[] {
    return [...this.snapshots]
  }

  /**
   * Clear all snapshots
   */
  clearSnapshots(): void {
    this.snapshots = []
  }

  /**
   * Get state history
   */
  getHistory(): StateChange[] {
    return [...this.history]
  }

  /**
   * Get history up to current index
   */
  getCurrentHistory(): StateChange[] {
    return this.history.slice(0, this.historyIndex + 1)
  }

  /**
   * Undo last change
   */
  async undo(): Promise<boolean> {
    if (this.historyIndex < 0) return false

    const change = this.history[this.historyIndex]
    this.historyIndex--

    // Revert the change
    if (change.type === 'set') {
      if (change.oldValue === undefined) {
        this.deleteNestedValue(this.state, change.path)
      } else {
        this.setNestedValue(this.state, change.path, change.oldValue)
      }
    } else if (change.type === 'delete') {
      this.setNestedValue(this.state, change.path, change.oldValue)
    }

    // Notify subscribers
    const currentValue = this.get(change.path)
    this.notifySubscribers(change.path, currentValue, change.newValue)

    // Persist
    if (this.options.persistence) {
      await this.persist()
    }

    return true
  }

  /**
   * Redo last undone change
   */
  async redo(): Promise<boolean> {
    if (this.historyIndex >= this.history.length - 1) return false

    this.historyIndex++
    const change = this.history[this.historyIndex]

    // Reapply the change
    if (change.type === 'set') {
      this.setNestedValue(this.state, change.path, change.newValue)
    } else if (change.type === 'delete') {
      this.deleteNestedValue(this.state, change.path)
    }

    // Notify subscribers
    const currentValue = this.get(change.path)
    this.notifySubscribers(change.path, currentValue, change.oldValue)

    // Persist
    if (this.options.persistence) {
      await this.persist()
    }

    return true
  }

  /**
   * Can undo
   */
  canUndo(): boolean {
    return this.historyIndex >= 0
  }

  /**
   * Can redo
   */
  canRedo(): boolean {
    return this.historyIndex < this.history.length - 1
  }

  /**
   * Get diff between current state and snapshot
   */
  diff(snapshot: StateSnapshot): Record<string, { old: any; new: any }> {
    const diff: Record<string, { old: any; new: any }> = {}
    const allPaths = new Set([
      ...this.getAllPaths(snapshot.state),
      ...this.getAllPaths(this.state),
    ])

    for (const path of allPaths) {
      const oldValue = this.getNestedValue(snapshot.state, path)
      const newValue = this.getNestedValue(this.state, path)

      if (!this.deepEqual(oldValue, newValue)) {
        diff[path] = { old: oldValue, new: newValue }
      }
    }

    return diff
  }

  /**
   * Record a state change
   */
  private recordChange(change: StateChange): void {
    // Remove any changes after current index (when undoing and making new changes)
    if (this.historyIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.historyIndex + 1)
    }

    // Add new change
    this.history.push(change)
    this.historyIndex++

    // Trim history if exceeds max
    if (this.history.length > this.options.maxHistory) {
      const excess = this.history.length - this.options.maxHistory
      this.history = this.history.slice(excess)
      this.historyIndex -= excess
    }
  }

  /**
   * Notify subscribers of change
   */
  private notifySubscribers(path: string, newValue: any, oldValue: any): void {
    for (const sub of this.subscriptions.values()) {
      if (sub.pattern.test(path)) {
        try {
          sub.listener(newValue, oldValue, path)
          this.options.onChange?.(newValue, oldValue, path)
        } catch (error) {
          this.options.onError?.(error as Error)
        }
      }
    }
  }

  /**
   * Notify subscribers with debouncing
   */
  private notifySubscribersDebounced(path: string, newValue: any, oldValue: any): void {
    // Clear existing timer for this path
    const existingTimer = this.debounceTimers.get(path)
    if (existingTimer) {
      clearTimeout(existingTimer)
    }

    // Set new timer
    const timer = setTimeout(() => {
      this.notifySubscribers(path, newValue, oldValue)
      this.debounceTimers.delete(path)
    }, this.options.debounceMs)

    this.debounceTimers.set(path, timer)
  }

  /**
   * Convert path pattern to regex
   */
  private pathToRegex(pattern: string): RegExp {
    // Support wildcards: 'user.*' matches 'user.name', 'user.email', etc.
    // Support '**': 'user.**' matches 'user.profile.name', etc.
    const escaped = pattern
      .replace(/\./g, '\\.')
      .replace(/\*\*/g, '.*')
      .replace(/\*/g, '[^.]*')

    return new RegExp(`^${escaped}$`)
  }

  /**
   * Get nested value by path
   */
  private getNestedValue(obj: any, path: string): any {
    const keys = path.split('.')
    let current = obj

    for (const key of keys) {
      if (current === null || current === undefined) {
        return undefined
      }
      current = current[key]
    }

    return current
  }

  /**
   * Set nested value by path
   */
  private setNestedValue(obj: any, path: string, value: any): void {
    const keys = path.split('.')
    const lastKey = keys.pop()!
    let current = obj

    for (const key of keys) {
      if (!(key in current) || typeof current[key] !== 'object') {
        current[key] = {}
      }
      current = current[key]
    }

    current[lastKey] = value
  }

  /**
   * Delete nested value by path
   */
  private deleteNestedValue(obj: any, path: string): void {
    const keys = path.split('.')
    const lastKey = keys.pop()!
    let current = obj

    for (const key of keys) {
      if (!(key in current)) {
        return
      }
      current = current[key]
    }

    delete current[lastKey]
  }

  /**
   * Get all paths in object
   */
  private getAllPaths(obj: any, prefix = ''): string[] {
    const paths: string[] = []

    for (const key in obj) {
      const path = prefix ? `${prefix}.${key}` : key
      paths.push(path)

      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        paths.push(...this.getAllPaths(obj[key], path))
      }
    }

    return paths
  }

  /**
   * Deep equality check
   */
  private deepEqual(a: any, b: any): boolean {
    if (a === b) return true
    if (a === null || b === null) return false
    if (typeof a !== typeof b) return false
    if (typeof a !== 'object') return false

    const keysA = Object.keys(a)
    const keysB = Object.keys(b)

    if (keysA.length !== keysB.length) return false

    for (const key of keysA) {
      if (!keysB.includes(key)) return false
      if (!this.deepEqual(a[key], b[key])) return false
    }

    return true
  }

  /**
   * Persist state to storage
   */
  private async persist(): Promise<void> {
    if (!this.options.persistence) return

    const serialized = JSON.stringify(this.state)

    // Browser: localStorage
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.options.persistenceKey, serialized)
    }

    // Node.js: file system
    if (this.options.persistencePath && typeof require !== 'undefined') {
      try {
        const fs = require('fs').promises
        await fs.writeFile(this.options.persistencePath, serialized, 'utf8')
      } catch (error) {
        this.options.onError?.(error as Error)
      }
    }
  }

  /**
   * Load state from persistence
   */
  private loadFromPersistence(): Record<string, any> | null {
    let serialized: string | null = null

    // Browser: localStorage
    if (typeof localStorage !== 'undefined') {
      serialized = localStorage.getItem(this.options.persistenceKey)
    }

    // Node.js: file system
    if (!serialized && this.options.persistencePath && typeof require !== 'undefined') {
      try {
        const fs = require('fs')
        serialized = fs.readFileSync(this.options.persistencePath, 'utf8')
      } catch (error) {
        // File doesn't exist
      }
    }

    if (serialized) {
      try {
        return JSON.parse(serialized)
      } catch (error) {
        this.options.onError?.(error as Error)
      }
    }

    return null
  }

  /**
   * Cleanup resources
   */
  dispose(): void {
    this.subscriptions.clear()
    this.debounceTimers.forEach(timer => clearTimeout(timer))
    this.debounceTimers.clear()
  }
}

/**
 * Create state manager with default options
 */
export function createStateManager(options: StateOptions = {}): StateManager {
  return new StateManager(options)
}
