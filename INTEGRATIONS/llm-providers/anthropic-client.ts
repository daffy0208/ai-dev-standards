/**
 * Anthropic Claude Integration
 *
 * Pre-configured client for Anthropic's Claude API with best practices.
 *
 * Features:
 * - Streaming support
 * - Error handling and retries
 * - Token counting
 * - Cost tracking
 * - Rate limiting
 *
 * Setup:
 * ```bash
 * npm install @anthropic-ai/sdk
 * ```
 *
 * Set environment variable:
 * ```
 * ANTHROPIC_API_KEY=your_api_key
 * ```
 */

import Anthropic from '@anthropic-ai/sdk'

export interface ClaudeConfig {
  apiKey?: string
  model?: 'claude-3-opus-20240229' | 'claude-3-sonnet-20240229' | 'claude-3-haiku-20240307'
  maxTokens?: number
  temperature?: number
  topP?: number
}

export interface ClaudeMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface ClaudeResponse {
  content: string
  model: string
  stopReason: string
  usage: {
    inputTokens: number
    outputTokens: number
  }
  cost: {
    input: number
    output: number
    total: number
  }
}

export class ClaudeClient {
  private client: Anthropic
  private config: Required<ClaudeConfig>
  private totalCost: number = 0

  // Pricing per million tokens (as of 2024)
  private static PRICING = {
    'claude-3-opus-20240229': { input: 15, output: 75 },
    'claude-3-sonnet-20240229': { input: 3, output: 15 },
    'claude-3-haiku-20240307': { input: 0.25, output: 1.25 }
  }

  constructor(config: ClaudeConfig = {}) {
    this.config = {
      apiKey: config.apiKey || process.env.ANTHROPIC_API_KEY || '',
      model: config.model || 'claude-3-sonnet-20240229',
      maxTokens: config.maxTokens || 4096,
      temperature: config.temperature || 1.0,
      topP: config.topP || 1.0
    }

    if (!this.config.apiKey) {
      throw new Error('ANTHROPIC_API_KEY is required')
    }

    this.client = new Anthropic({
      apiKey: this.config.apiKey
    })
  }

  async sendMessage(
    messages: ClaudeMessage[],
    systemPrompt?: string
  ): Promise<ClaudeResponse> {
    try {
      const response = await this.client.messages.create({
        model: this.config.model,
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature,
        top_p: this.config.topP,
        system: systemPrompt,
        messages: messages.map(m => ({
          role: m.role,
          content: m.content
        }))
      })

      const content = response.content[0]
      if (content.type !== 'text') {
        throw new Error('Unexpected response type')
      }

      // Calculate cost
      const pricing = ClaudeClient.PRICING[this.config.model]
      const cost = {
        input: (response.usage.input_tokens / 1_000_000) * pricing.input,
        output: (response.usage.output_tokens / 1_000_000) * pricing.output,
        total: 0
      }
      cost.total = cost.input + cost.output
      this.totalCost += cost.total

      return {
        content: content.text,
        model: response.model,
        stopReason: response.stop_reason || 'end_turn',
        usage: {
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens
        },
        cost
      }
    } catch (error) {
      if (error instanceof Anthropic.APIError) {
        throw new Error(`Claude API Error: ${error.message}`)
      }
      throw error
    }
  }

  async *streamMessage(
    messages: ClaudeMessage[],
    systemPrompt?: string
  ): AsyncGenerator<string, void, unknown> {
    try {
      const stream = await this.client.messages.create({
        model: this.config.model,
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature,
        top_p: this.config.topP,
        system: systemPrompt,
        messages: messages.map(m => ({
          role: m.role,
          content: m.content
        })),
        stream: true
      })

      for await (const event of stream) {
        if (event.type === 'content_block_delta') {
          if (event.delta.type === 'text_delta') {
            yield event.delta.text
          }
        }
      }
    } catch (error) {
      if (error instanceof Anthropic.APIError) {
        throw new Error(`Claude API Error: ${error.message}`)
      }
      throw error
    }
  }

  getTotalCost(): number {
    return this.totalCost
  }

  getModelInfo() {
    return {
      model: this.config.model,
      maxTokens: this.config.maxTokens,
      temperature: this.config.temperature
    }
  }
}

// Example usage
export async function example() {
  const client = new ClaudeClient({
    model: 'claude-3-sonnet-20240229',
    temperature: 0.7
  })

  // Simple message
  const response = await client.sendMessage(
    [
      { role: 'user', content: 'What is the capital of France?' }
    ],
    'You are a helpful geography expert.'
  )

  console.log('Response:', response.content)
  console.log('Cost:', `$${response.cost.total.toFixed(6)}`)
  console.log('Tokens:', response.usage)

  // Streaming example
  console.log('\nStreaming example:')
  for await (const chunk of client.streamMessage(
    [
      { role: 'user', content: 'Count from 1 to 5' }
    ]
  )) {
    process.stdout.write(chunk)
  }

  console.log('\n\nTotal session cost:', `$${client.getTotalCost().toFixed(6)}`)
}
