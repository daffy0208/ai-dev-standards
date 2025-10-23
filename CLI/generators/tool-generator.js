const prettier = require('prettier')

/**
 * Tool Generator
 *
 * Generates reusable tools for AI agents:
 * - LangChain tools
 * - CrewAI tools
 * - Custom tools
 */
class ToolGenerator {
  async generate(config) {
    const { name, framework = 'custom', category = 'custom' } = config

    const files = []

    // Tool implementation
    files.push({
      path: `tools/${framework}-tools/${name}-tool.ts`,
      content: await this.formatCode(this.generateTool(name, framework, category))
    })

    // README
    files.push({
      path: `tools/${framework}-tools/${name}-tool.md`,
      content: this.generateReadme(name, framework, category)
    })

    return files
  }

  /**
   * Generate tool code
   */
  generateTool(name, framework, category) {
    if (framework === 'langchain') {
      return this.generateLangChainTool(name, category)
    } else if (framework === 'crewai') {
      return this.generateCrewAITool(name, category)
    } else {
      return this.generateCustomTool(name, category)
    }
  }

  /**
   * Generate LangChain tool
   */
  generateLangChainTool(name, category) {
    const toolName = name.replace(/-/g, '_')
    const className = name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('')

    return `import { Tool } from 'langchain/tools'
import { z } from 'zod'

/**
 * ${className} Tool
 * Category: ${category}
 */
export class ${className}Tool extends Tool {
  name = '${toolName}'

  description = 'Use this tool to ${name.replace(/-/g, ' ')}. Input should be a JSON string with the required parameters.'

  schema = z.object({
    input: z.string().describe('The input data for the tool'),
    options: z.object({
      // Add your options here
    }).optional()
  })

  async _call(input: string): Promise<string> {
    try {
      const parsed = JSON.parse(input)

      // Implement your tool logic here
      const result = await this.execute(parsed.input, parsed.options)

      return JSON.stringify(result, null, 2)
    } catch (error) {
      return \`Error: \${error instanceof Error ? error.message : 'Unknown error'}\`
    }
  }

  /**
   * Execute the tool logic
   */
  private async execute(input: string, options?: any): Promise<any> {
    // TODO: Implement your tool logic here

    return {
      success: true,
      result: \`Processed: \${input}\`,
      timestamp: new Date().toISOString()
    }
  }
}

// Export singleton instance
export const ${toolName}Tool = new ${className}Tool()
`
  }

  /**
   * Generate CrewAI tool
   */
  generateCrewAITool(name, category) {
    const toolName = name.replace(/-/g, '_')
    const className = name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('')

    return `from crewai_tools import BaseTool
from typing import Type, Any
from pydantic import BaseModel, Field

class ${className}Input(BaseModel):
    """Input schema for ${className}."""
    input: str = Field(..., description="The input data for the tool")
    options: dict = Field(default={}, description="Optional parameters")

class ${className}Tool(BaseTool):
    name: str = "${toolName}"
    description: str = "Use this tool to ${name.replace(/-/g, ' ')}."
    args_schema: Type[BaseModel] = ${className}Input

    def _run(self, input: str, options: dict = {}) -> str:
        """Execute the tool."""
        try:
            # Implement your tool logic here
            result = self.execute(input, options)

            return str(result)
        except Exception as e:
            return f"Error: {str(e)}"

    def execute(self, input: str, options: dict) -> dict:
        """Execute the tool logic."""
        # TODO: Implement your tool logic here

        return {
            "success": True,
            "result": f"Processed: {input}",
            "timestamp": str(datetime.now())
        }

# Export tool instance
${toolName}_tool = ${className}Tool()
`
  }

  /**
   * Generate custom tool
   */
  generateCustomTool(name, category) {
    const className = name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('')

    return `/**
 * ${className} Tool
 * Category: ${category}
 */

export interface ${className}Input {
  input: string
  options?: {
    [key: string]: any
  }
}

export interface ${className}Output {
  success: boolean
  result: any
  error?: string
  timestamp: string
}

export class ${className}Tool {
  name = '${name}'
  description = 'Use this tool to ${name.replace(/-/g, ' ')}'

  /**
   * Execute the tool
   */
  async execute(input: ${className}Input): Promise<${className}Output> {
    try {
      // Implement your tool logic here
      const result = await this.process(input.input, input.options)

      return {
        success: true,
        result,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      return {
        success: false,
        result: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }
    }
  }

  /**
   * Process the input
   */
  private async process(input: string, options?: any): Promise<any> {
    // TODO: Implement your tool logic here

    return {
      processed: input,
      options
    }
  }
}

// Export singleton instance
export const ${name.replace(/-/g, '_')}Tool = new ${className}Tool()
`
  }

  /**
   * Generate README
   */
  generateReadme(name, framework, category) {
    const className = name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('')

    return `# ${className} Tool

**Framework:** ${framework}
**Category:** ${category}

## Description

${className} tool for ${name.replace(/-/g, ' ')}.

## Usage

${framework === 'langchain' ? `
\`\`\`typescript
import { ${name.replace(/-/g, '_')}Tool } from './tools/langchain-tools/${name}-tool'

// Use with LangChain agent
const agent = await initializeAgentExecutorWithOptions(
  [${name.replace(/-/g, '_')}Tool],
  model,
  {
    agentType: 'structured-chat-zero-shot-react-description'
  }
)

// Execute
const result = await agent.call({
  input: 'Use the ${name} tool to process this data'
})
\`\`\`
` : framework === 'crewai' ? `
\`\`\`python
from tools.crewai_tools.${name}_tool import ${name.replace(/-/g, '_')}_tool

# Use with CrewAI agent
agent = Agent(
    role='Data Processor',
    goal='Process data using ${name}',
    tools=[${name.replace(/-/g, '_')}_tool],
    verbose=True
)

# Execute
result = agent.execute_task(task)
\`\`\`
` : `
\`\`\`typescript
import { ${name.replace(/-/g, '_')}Tool } from './tools/custom-tools/${name}-tool'

// Execute tool
const result = await ${name.replace(/-/g, '_')}Tool.execute({
  input: 'your input here',
  options: {
    // optional parameters
  }
})

console.log(result)
\`\`\`
`}

## Input Schema

\`\`\`typescript
{
  input: string
  options?: {
    // Add your options here
  }
}
\`\`\`

## Output Schema

\`\`\`typescript
{
  success: boolean
  result: any
  error?: string
  timestamp: string
}
\`\`\`

## Examples

### Example 1: Basic Usage

\`\`\`typescript
const result = await ${name.replace(/-/g, '_')}Tool.execute({
  input: 'example input'
})
\`\`\`

### Example 2: With Options

\`\`\`typescript
const result = await ${name.replace(/-/g, '_')}Tool.execute({
  input: 'example input',
  options: {
    format: 'json',
    verbose: true
  }
})
\`\`\`

## Implementation Notes

- Customize the \`execute\` method with your specific logic
- Add error handling as needed
- Consider adding retries for external API calls
- Add logging for debugging

## Related Tools

- List related tools here
`
  }

  /**
   * Format code
   */
  async formatCode(code) {
    try {
      if (code.includes('from crewai')) {
        // Python code - no formatting for now
        return code
      }

      return await prettier.format(code, {
        parser: 'typescript',
        semi: false,
        singleQuote: true,
        trailingComma: 'es5',
        printWidth: 100
      })
    } catch (error) {
      return code
    }
  }
}

module.exports = ToolGenerator
