export type MCPToolArgs = Record<string, unknown>

export interface MCPToolSchema {
  type: 'object'
  properties: Record<string, unknown>
  required?: string[]
}

export interface MCPToolDefinition<TArgs extends MCPToolArgs = MCPToolArgs, TResult = unknown> {
  name: string
  description: string
  inputSchema: MCPToolSchema
  handler: (args: TArgs) => Promise<TResult> | TResult
}
