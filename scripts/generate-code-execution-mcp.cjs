#!/usr/bin/env node

/**
 * Generate MCP with Code Execution Pattern
 *
 * Usage: node scripts/generate-code-execution-mcp.cjs <mcp-name> <description>
 */

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

// Import the MCP generator
const McpGenerator = require('../CLI/generators/mcp-generator');

async function main() {
  const mcpName = process.argv[2] || 'semantic-search';
  const description = process.argv[3] || 'Semantic search MCP server with vector database integration';

  console.log(chalk.blue(`\n🚀 Generating MCP with Code Execution pattern: ${chalk.bold(mcpName)}\n`));

  try {
    const generator = new McpGenerator();

    // Generate with Code Execution pattern
    const files = await generator.generate({
      name: mcpName,
      template: 'custom',
      description: description,
      features: ['tools'],
      pattern: 'code-execution'
    });

    console.log(chalk.green(`\n✅ Generated ${files.length} files:\n`));

    // Write all files
    for (const file of files) {
      await fs.ensureDir(path.dirname(file.path));
      await fs.writeFile(file.path, file.content);
      console.log(chalk.gray(`  ✓ ${file.path}`));
    }

    console.log(chalk.green(`\n✅ Successfully created ${mcpName}-mcp with Code Execution pattern!\n`));

    // Show structure
    console.log(chalk.cyan('📁 MCP Structure:'));
    console.log(`
  MCP-SERVERS/${mcpName}-mcp/
  ├── servers/${mcpName}/
  │   ├── README.md           (Server documentation)
  │   ├── tool_list.txt       (Progressive discovery index)
  │   └── tools/
  │       └── example_tool.py (Example tool implementation)
  ├── skills/
  │   └── .gitkeep            (Persistent skills storage)
  ├── README.md               (Main documentation)
  └── .env.example            (Environment configuration)
    `);

    console.log(chalk.cyan('🎯 Next Steps:\n'));
    console.log(`  1. cd MCP-SERVERS/${mcpName}-mcp`);
    console.log(`  2. Implement tools in servers/${mcpName}/tools/`);
    console.log(`  3. Update tool_list.txt with tool names`);
    console.log(`  4. Test with Docker sandbox:`);
    console.log(`     docker run -v $(pwd):/workspace -v ${path.resolve('skills')}:/workspace/skills mcp-sandbox`);
    console.log('');

  } catch (error) {
    console.error(chalk.red(`\n❌ Error: ${error.message}\n`));
    console.error(error.stack);
    process.exit(1);
  }
}

main();
