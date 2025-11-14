const prettier = require('prettier')
const { sanitizeName, validatePythonIdentifier, toSnakeCase } = require('../utils/validation')

/**
 * Tool File Generator for Code Execution Pattern
 *
 * Generates Python tool files for MCP servers using the Code Execution pattern.
 * These tool files are discovered progressively by the agent through file navigation.
 *
 * Key Features:
 * - Python-based tool implementations
 * - Compatible with IPython execution environment
 * - Follows Code Execution pattern conventions
 * - Includes comprehensive documentation
 * - Type hints for better IDE support
 */
class ToolFileGenerator {
  async generate(config) {
    const {
      name,
      serverName,
      category = 'custom',
      description = '',
      inputSchema = {},
      outputSchema = {}
    } = config

    // Validate and sanitize tool name (SECURITY: prevent path traversal)
    const sanitizedName = sanitizeName(name, 'tool')

    // Convert to snake_case for Python
    const toolIdentifier = toSnakeCase(sanitizedName)
    validatePythonIdentifier(toolIdentifier, 'tool name')

    // Validate server name
    const sanitizedServerName = sanitizeName(serverName, 'server')

    const files = []

    // Tool implementation file
    files.push({
      path: `MCP-SERVERS/${sanitizedServerName}-mcp/servers/${sanitizedServerName}/tools/${toolIdentifier}.py`,
      content: this.generateToolFile(toolIdentifier, category, description, inputSchema, outputSchema)
    })

    // Update tool_list.txt
    files.push({
      path: `MCP-SERVERS/${sanitizedServerName}-mcp/servers/${sanitizedServerName}/tool_list.txt`,
      content: this.generateToolListEntry(toolIdentifier, description),
      mode: 'append'
    })

    return files
  }

  /**
   * Generate Python tool file
   */
  generateToolFile(toolName, category, description, inputSchema, outputSchema) {
    const functionName = toolName
    const className = toolName.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('')

    // Extract input parameters from schema
    const inputParams = this.extractParameters(inputSchema)
    const outputType = this.extractOutputType(outputSchema)

    return `"""
${className} Tool

${description || `Tool for ${toolName.replace(/_/g, ' ')} operations`}

Category: ${category}
Pattern: Code Execution
"""

from typing import Dict, Any, Optional, List, Union
from datetime import datetime
import json


def ${functionName}(
    ${inputParams.map(p => `${p.name}: ${p.type}${p.optional ? ' = None' : ''}`).join(',\n    ') || 'input_data: str'}
) -> ${outputType}:
    """
    ${description || `Execute ${toolName.replace(/_/g, ' ')} operation.`}

    Args:
${inputParams.map(p => `        ${p.name}: ${p.description || `${p.name} parameter`}`).join('\n') || '        input_data: Input data for the tool'}

    Returns:
        ${outputType}: Result of the operation

    Raises:
        ValueError: If input validation fails
        RuntimeError: If operation fails

    Example:
        >>> result = ${functionName}(${inputParams[0]?.name || 'input_data'}="example")
        >>> print(result)
        {'success': True, 'result': '...'}
    """
    try:
        # IMPLEMENTATION NOTE: Replace with actual tool logic

        # Input validation
        ${inputParams.map(p =>
          p.optional ? '' : `if not ${p.name}:
            raise ValueError("${p.name} is required")`
        ).filter(Boolean).join('\n        ') || '# Add validation logic here'}

        # Execute core logic
        result = _execute_${functionName}(${inputParams.map(p => p.name).join(', ') || 'input_data'})

        # Return structured response
        return {
            'success': True,
            'result': result,
            'tool': '${functionName}',
            'timestamp': datetime.now().isoformat(),
            'metadata': {
                'category': '${category}',
                'pattern': 'code-execution'
            }
        }

    except ValueError as e:
        return {
            'success': False,
            'error': str(e),
            'error_type': 'validation_error',
            'tool': '${functionName}',
            'timestamp': datetime.now().isoformat()
        }

    except Exception as e:
        return {
            'success': False,
            'error': str(e),
            'error_type': 'runtime_error',
            'tool': '${functionName}',
            'timestamp': datetime.now().isoformat()
        }


def _execute_${functionName}(${inputParams.map(p => p.name).join(', ') || 'input_data'}) -> Any:
    """
    Core execution logic for ${functionName}.

    This is separated from the main function to allow for easier testing
    and reusability.

    Args:
${inputParams.map(p => `        ${p.name}: ${p.description || p.name}`).join('\n') || '        input_data: Input data'}

    Returns:
        Any: Processed result
    """
    # IMPLEMENTATION NOTE: Implement your core logic here

    result = {
        'processed': True,
        'data': ${inputParams[0]?.name || 'input_data'}
    }

    return result


# Helper functions

def validate_input(${inputParams.map(p => p.name).join(', ') || 'input_data'}) -> bool:
    """
    Validate input parameters.

    Returns:
        bool: True if valid, raises ValueError if invalid
    """
    # IMPLEMENTATION NOTE: Add validation logic
    return True


def format_output(result: Any) -> Dict[str, Any]:
    """
    Format output to standardized structure.

    Args:
        result: Raw result from execution

    Returns:
        Dict[str, Any]: Formatted result
    """
    return {
        'data': result,
        'formatted_at': datetime.now().isoformat()
    }


# Tool metadata for discovery
TOOL_METADATA = {
    'name': '${functionName}',
    'category': '${category}',
    'description': '${description || `Tool for ${toolName.replace(/_/g, ' ')}`}',
    'pattern': 'code-execution',
    'version': '1.0.0',
    'input_schema': ${JSON.stringify(inputSchema, null, 4) || '{}'},
    'output_schema': ${JSON.stringify(outputSchema, null, 4) || '{}'}
}


# Example usage and tests
if __name__ == "__main__":
    print(f"Testing {TOOL_METADATA['name']} tool...")

    # Test case 1: Basic usage
    test_result = ${functionName}(${inputParams[0]?.name || 'input_data'}="test input"${inputParams.length > 1 ? ', ' + inputParams.slice(1).map(p => `${p.name}=${p.optional ? 'None' : '"test"'}`).join(', ') : ''})
    print("Test 1:", json.dumps(test_result, indent=2))

    # Test case 2: Error handling
    try:
        error_result = ${functionName}(${inputParams[0]?.name || 'input_data'}=""${inputParams.length > 1 ? ', ' + inputParams.slice(1).map(p => `${p.name}=None`).join(', ') : ''})
        print("Test 2:", json.dumps(error_result, indent=2))
    except Exception as e:
        print(f"Test 2 (expected error): {e}")

    print("\\nTool metadata:")
    print(json.dumps(TOOL_METADATA, indent=2))
`
  }

  /**
   * Generate tool list entry
   */
  generateToolListEntry(toolName, description) {
    return `\n- ${toolName}: ${description || `Tool for ${toolName.replace(/_/g, ' ')}`}`
  }

  /**
   * Extract parameters from input schema
   */
  extractParameters(schema) {
    if (!schema || !schema.properties) {
      return [{ name: 'input_data', type: 'str', optional: false, description: 'Input data' }]
    }

    const required = schema.required || []

    return Object.entries(schema.properties).map(([name, prop]) => ({
      name,
      type: this.jsonTypeToPython(prop.type),
      optional: !required.includes(name),
      description: prop.description || ''
    }))
  }

  /**
   * Extract output type from schema
   */
  extractOutputType(schema) {
    if (!schema || !schema.type) {
      return 'Dict[str, Any]'
    }

    return this.jsonTypeToPython(schema.type)
  }

  /**
   * Convert JSON schema type to Python type hint
   */
  jsonTypeToPython(type) {
    const typeMap = {
      'string': 'str',
      'number': 'float',
      'integer': 'int',
      'boolean': 'bool',
      'array': 'List[Any]',
      'object': 'Dict[str, Any]',
      'null': 'None'
    }

    return typeMap[type] || 'Any'
  }

  /**
   * Batch generate multiple tool files
   */
  async generateBatch(tools) {
    const allFiles = []

    for (const toolConfig of tools) {
      const files = await this.generate(toolConfig)
      allFiles.push(...files)
    }

    return allFiles
  }

  /**
   * Generate tool file from template
   */
  async generateFromTemplate(templateName, config) {
    // IMPLEMENTATION NOTE: Add support for predefined templates
    const templates = {
      'api-caller': {
        category: 'api',
        inputSchema: {
          type: 'object',
          properties: {
            url: { type: 'string', description: 'API endpoint URL' },
            method: { type: 'string', description: 'HTTP method' },
            data: { type: 'object', description: 'Request data' }
          },
          required: ['url', 'method']
        }
      },
      'data-processor': {
        category: 'data',
        inputSchema: {
          type: 'object',
          properties: {
            data: { type: 'array', description: 'Data to process' },
            operation: { type: 'string', description: 'Operation to perform' }
          },
          required: ['data', 'operation']
        }
      },
      'file-handler': {
        category: 'file',
        inputSchema: {
          type: 'object',
          properties: {
            file_path: { type: 'string', description: 'Path to file' },
            operation: { type: 'string', description: 'File operation' }
          },
          required: ['file_path', 'operation']
        }
      }
    }

    const template = templates[templateName]
    if (!template) {
      throw new Error(`Unknown template: ${templateName}`)
    }

    return this.generate({ ...template, ...config })
  }
}

module.exports = ToolFileGenerator
