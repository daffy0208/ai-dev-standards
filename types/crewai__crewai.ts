declare module '@crewai/crewai' {
  interface CrewAIToolConfig {
    name?: string
    description?: string
    returnDirect?: boolean
    [key: string]: unknown
  }

  /**
   * Minimal CrewAI Tool interface to keep TypeScript happy.
   * The actual runtime implementation is provided by the crewai package.
   */
  class Tool {
    name: string
    description: string
    returnDirect?: boolean

    constructor(config?: CrewAIToolConfig)

    _run?(input: unknown, config?: Record<string, unknown>): Promise<unknown> | unknown
    _call?(input: unknown, config?: Record<string, unknown>): Promise<unknown> | unknown
  }

  export { Tool, CrewAIToolConfig }
}
