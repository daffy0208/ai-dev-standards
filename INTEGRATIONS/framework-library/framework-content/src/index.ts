#!/usr/bin/env node

/**
 * Framework Content MCP Server
 *
 * Serves framework markdown files as MCP resources for AI consumption.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { FrameworkLoader } from "./resources/framework-loader.js";
import { FrameworkIndex } from "./utils/framework-index.js";

const FRAMEWORK_ROOT = process.env.FRAMEWORK_ROOT || "../../";

// Initialize framework loader and index
const frameworkLoader = new FrameworkLoader(FRAMEWORK_ROOT);
const frameworkIndex = new FrameworkIndex(FRAMEWORK_ROOT);

// Create MCP server
const server = new Server(
  {
    name: "framework-content",
    version: "1.0.0",
  },
  {
    capabilities: {
      resources: {},
      tools: {},
    },
  }
);

/**
 * List all available framework resources
 */
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  try {
    const frameworks = await frameworkIndex.getAllFrameworks();

    const resources = frameworks.map((fw) => ({
      uri: `framework:///${fw.category}/${fw.id}`,
      name: fw.name,
      description: fw.description || `${fw.category} framework`,
      mimeType: "text/markdown",
    }));

    // Add special "all frameworks" resource
    resources.push({
      uri: "framework:///all",
      name: "All Frameworks Index",
      description: "Complete index of all 52 frameworks",
      mimeType: "application/json",
    });

    return { resources };
  } catch (error) {
    console.error("Error listing resources:", error);
    return { resources: [] };
  }
});

/**
 * Read a specific framework resource
 */
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const uri = request.params.uri;

  try {
    // Handle special "all" resource
    if (uri === "framework:///all") {
      const frameworks = await frameworkIndex.getAllFrameworks();
      return {
        contents: [
          {
            uri,
            mimeType: "application/json",
            text: JSON.stringify(frameworks, null, 2),
          },
        ],
      };
    }

    // Parse URI: framework:///{category}/{id}
    const match = uri.match(/^framework:\/\/\/([^/]+)\/([^/]+)$/);
    if (!match) {
      throw new Error(`Invalid framework URI: ${uri}`);
    }

    const [, category, id] = match;
    const content = await frameworkLoader.loadFramework(category, id);

    return {
      contents: [
        {
          uri,
          mimeType: "text/markdown",
          text: content,
        },
      ],
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to read framework: ${errorMessage}`);
  }
});

/**
 * List available tools
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  const tools: Tool[] = [
    {
      name: "search_frameworks",
      description: "Search frameworks by keyword, category, or capability",
      inputSchema: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Search query (keyword, framework name, or description)",
          },
          category: {
            type: "string",
            enum: ["security", "build", "all"],
            description: "Filter by category",
          },
          limit: {
            type: "number",
            description: "Maximum number of results (default: 10)",
          },
        },
        required: ["query"],
      },
    },
    {
      name: "get_framework_metadata",
      description: "Get detailed metadata about a specific framework",
      inputSchema: {
        type: "object",
        properties: {
          framework_id: {
            type: "string",
            description: "Framework ID (e.g., 'full_stack_dev_framework')",
          },
        },
        required: ["framework_id"],
      },
    },
  ];

  return { tools };
});

/**
 * Handle tool calls
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (!args) {
      throw new Error("No arguments provided");
    }

    switch (name) {
      case "search_frameworks": {
        const query = args.query as string;
        const category = (args.category as string) || "all";
        const limit = (args.limit as number) || 10;

        const results = await frameworkIndex.search(query, category, limit);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(results, null, 2),
            },
          ],
        };
      }

      case "get_framework_metadata": {
        const frameworkId = args.framework_id as string;
        const metadata = await frameworkIndex.getMetadata(frameworkId);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(metadata, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Tool execution failed: ${errorMessage}`);
  }
});

/**
 * Start the server
 */
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error("Framework Content MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
