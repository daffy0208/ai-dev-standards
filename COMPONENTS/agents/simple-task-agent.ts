/**
 * Simple Task Agent
 *
 * A lightweight agent implementation for executing single tasks with context.
 *
 * Features:
 * - Context-aware task execution
 * - Error handling and retries
 * - Observable execution with events
 * - Memory/conversation history support
 *
 * Usage:
 * ```typescript
 * const agent = new SimpleTaskAgent({
 *   name: 'MyAgent',
 *   model: 'gpt-4',
 *   temperature: 0.7
 * })
 *
 * const result = await agent.execute({
 *   task: 'Analyze this data and provide insights',
 *   context: { data: [...] }
 * })
 * ```
 */

export interface AgentConfig {
  name: string
  model: string
  temperature?: number
  maxTokens?: number
  systemPrompt?: string
  maxRetries?: number
}

export interface TaskInput {
  task: string
  context?: Record<string, any>
  conversationHistory?: Array<{ role: string; content: string }>
}

export interface TaskResult {
  success: boolean
  output: string
  metadata: {
    tokensUsed: number
    duration: number
    retries: number
  }
  error?: string
}

export class SimpleTaskAgent {
  private config: Required<AgentConfig>
  private executionCount: number = 0

  constructor(config: AgentConfig) {
    this.config = {
      temperature: 0.7,
      maxTokens: 2000,
      systemPrompt: 'You are a helpful AI assistant that completes tasks accurately and efficiently.',
      maxRetries: 3,
      ...config
    }
  }

  async execute(input: TaskInput): Promise<TaskResult> {
    const startTime = Date.now()
    let retries = 0

    while (retries < this.config.maxRetries) {
      try {
        this.executionCount++

        // Build messages
        const messages = [
          { role: 'system', content: this.config.systemPrompt },
          ...(input.conversationHistory || []),
          {
            role: 'user',
            content: this.buildPrompt(input.task, input.context)
          }
        ]

        // Execute with LLM (placeholder - integrate with your LLM provider)
        const response = await this.callLLM(messages)

        return {
          success: true,
          output: response.content,
          metadata: {
            tokensUsed: response.tokensUsed,
            duration: Date.now() - startTime,
            retries
          }
        }
      } catch (error) {
        retries++

        if (retries >= this.config.maxRetries) {
          return {
            success: false,
            output: '',
            metadata: {
              tokensUsed: 0,
              duration: Date.now() - startTime,
              retries
            },
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        }

        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, retries) * 1000))
      }
    }

    throw new Error('Unexpected execution path')
  }

  private buildPrompt(task: string, context?: Record<string, any>): string {
    let prompt = task

    if (context && Object.keys(context).length > 0) {
      prompt += '\n\nContext:\n'
      prompt += JSON.stringify(context, null, 2)
    }

    return prompt
  }

  private async callLLM(messages: Array<{ role: string; content: string }>) {
    // Placeholder - integrate with OpenAI, Anthropic, or other LLM provider
    // Example with OpenAI:
    // const response = await openai.chat.completions.create({
    //   model: this.config.model,
    //   messages,
    //   temperature: this.config.temperature,
    //   max_tokens: this.config.maxTokens
    // })
    // return {
    //   content: response.choices[0].message.content,
    //   tokensUsed: response.usage.total_tokens
    // }

    throw new Error('LLM integration not configured. Implement callLLM() with your provider.')
  }

  getStats() {
    return {
      name: this.config.name,
      model: this.config.model,
      executionCount: this.executionCount
    }
  }
}

// Example usage
export async function example() {
  const agent = new SimpleTaskAgent({
    name: 'DataAnalyzer',
    model: 'gpt-4',
    temperature: 0.3,
    systemPrompt: 'You are a data analysis expert. Analyze data and provide clear, actionable insights.'
  })

  const result = await agent.execute({
    task: 'Analyze the following sales data and identify trends',
    context: {
      sales: [
        { month: 'Jan', amount: 10000 },
        { month: 'Feb', amount: 15000 },
        { month: 'Mar', amount: 12000 }
      ]
    }
  })

  console.log('Result:', result)
}
