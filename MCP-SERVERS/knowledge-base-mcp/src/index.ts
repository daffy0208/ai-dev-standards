#!/usr/bin/env node

/**
 * Knowledge Base MCP Server
 *
 * Provides CRUD operations for knowledge base management:
 * - Create, read, update, delete knowledge entries
 * - Query and search knowledge
 * - Validate for duplicates and conflicts
 * - Version tracking
 * - Import/export capabilities
 *
 * Supports both document-based (RAG) and entity-based (Graph) knowledge.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";

// Types
interface KnowledgeEntry {
  id: string;
  type: 'document' | 'entity' | 'relationship';
  content: string;
  metadata: {
    source: string;
    created_at: string;
    updated_at: string;
    author?: string;
    category?: string;
    tags?: string[];
    confidence?: number;
  };
  version: number;
  embedding?: number[];
  relationships?: Array<{
    type: string;
    target_id: string;
    properties?: Record<string, any>;
  }>;
}

interface KnowledgeBase {
  entries: Map<string, KnowledgeEntry[]>; // id -> version history
  index: Map<string, Set<string>>; // category/tag -> entry ids
}

// In-memory storage (replace with actual DB in production)
const knowledgeBase: KnowledgeBase = {
  entries: new Map(),
  index: new Map(),
};

// Helper functions
function generateId(): string {
  return `kb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function getCurrentVersion(id: string): KnowledgeEntry | null {
  const versions = knowledgeBase.entries.get(id);
  if (!versions || versions.length === 0) return null;
  return versions[versions.length - 1];
}

function addToIndex(entry: KnowledgeEntry): void {
  const { category, tags } = entry.metadata;

  if (category) {
    if (!knowledgeBase.index.has(category)) {
      knowledgeBase.index.set(category, new Set());
    }
    knowledgeBase.index.get(category)!.add(entry.id);
  }

  if (tags) {
    tags.forEach(tag => {
      if (!knowledgeBase.index.has(tag)) {
        knowledgeBase.index.set(tag, new Set());
      }
      knowledgeBase.index.get(tag)!.add(entry.id);
    });
  }
}

function removeFromIndex(entry: KnowledgeEntry): void {
  const { category, tags } = entry.metadata;

  if (category) {
    knowledgeBase.index.get(category)?.delete(entry.id);
  }

  if (tags) {
    tags.forEach(tag => {
      knowledgeBase.index.get(tag)?.delete(entry.id);
    });
  }
}

function findDuplicates(content: string, threshold: number = 0.9): string[] {
  const duplicates: string[] = [];

  for (const [id, versions] of knowledgeBase.entries) {
    const current = versions[versions.length - 1];
    const similarity = calculateSimilarity(content, current.content);
    if (similarity >= threshold) {
      duplicates.push(id);
    }
  }

  return duplicates;
}

function calculateSimilarity(str1: string, str2: string): number {
  // Simple word-based similarity (replace with proper algorithm in production)
  const words1 = new Set(str1.toLowerCase().split(/\s+/));
  const words2 = new Set(str2.toLowerCase().split(/\s+/));

  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);

  return intersection.size / union.size;
}

function detectConflicts(entry: KnowledgeEntry): Array<{ id: string; reason: string }> {
  const conflicts: Array<{ id: string; reason: string }> = [];

  // Check for conflicting facts in same category
  if (entry.metadata.category) {
    const categoryIds = knowledgeBase.index.get(entry.metadata.category);
    if (categoryIds) {
      for (const id of categoryIds) {
        if (id === entry.id) continue;

        const other = getCurrentVersion(id);
        if (other && other.type === entry.type) {
          // Simple conflict detection (enhance in production)
          if (other.content.includes(entry.content.split(' ')[0])) {
            conflicts.push({
              id,
              reason: `Potentially conflicting information about same topic`
            });
          }
        }
      }
    }
  }

  return conflicts;
}

// Define tools
const tools: Tool[] = [
  {
    name: "create_knowledge_entry",
    description: "Create a new knowledge base entry. Supports document-based (RAG) and entity-based (graph) knowledge.",
    inputSchema: {
      type: "object",
      properties: {
        type: {
          type: "string",
          enum: ["document", "entity", "relationship"],
          description: "Type of knowledge entry"
        },
        content: {
          type: "string",
          description: "The actual knowledge content or entity description"
        },
        source: {
          type: "string",
          description: "Source of this knowledge (URL, document name, etc.)"
        },
        author: {
          type: "string",
          description: "Author or contributor of this knowledge (optional)"
        },
        category: {
          type: "string",
          description: "Category for organization (optional)"
        },
        tags: {
          type: "array",
          items: { type: "string" },
          description: "Tags for better searchability (optional)"
        },
        confidence: {
          type: "number",
          description: "Confidence score 0-1 (optional)"
        },
        relationships: {
          type: "array",
          items: {
            type: "object",
            properties: {
              type: { type: "string" },
              target_id: { type: "string" },
              properties: { type: "object" }
            }
          },
          description: "Relationships to other entities (for entity type)"
        }
      },
      required: ["type", "content", "source"]
    }
  },
  {
    name: "update_knowledge_entry",
    description: "Update an existing knowledge entry. Creates a new version while preserving history.",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "ID of the knowledge entry to update"
        },
        content: {
          type: "string",
          description: "Updated content (optional)"
        },
        metadata: {
          type: "object",
          description: "Updated metadata fields (optional)"
        },
        changelog: {
          type: "string",
          description: "Description of what changed"
        }
      },
      required: ["id", "changelog"]
    }
  },
  {
    name: "delete_knowledge_entry",
    description: "Delete a knowledge entry. Can be soft delete (mark as deleted) or hard delete (remove completely).",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "ID of the knowledge entry to delete"
        },
        hard_delete: {
          type: "boolean",
          description: "If true, permanently deletes. If false, marks as deleted but preserves history."
        }
      },
      required: ["id"]
    }
  },
  {
    name: "query_knowledge",
    description: "Query the knowledge base. Supports filtering by type, category, tags, and text search.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Text to search for in content (optional)"
        },
        type: {
          type: "string",
          enum: ["document", "entity", "relationship"],
          description: "Filter by knowledge type (optional)"
        },
        category: {
          type: "string",
          description: "Filter by category (optional)"
        },
        tags: {
          type: "array",
          items: { type: "string" },
          description: "Filter by tags (optional)"
        },
        limit: {
          type: "number",
          description: "Maximum results to return (default: 10)"
        }
      }
    }
  },
  {
    name: "validate_knowledge",
    description: "Validate knowledge for duplicates, conflicts, and quality issues. Returns validation report.",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "ID of entry to validate (optional, validates all if not provided)"
        },
        checks: {
          type: "array",
          items: {
            type: "string",
            enum: ["duplicates", "conflicts", "staleness", "completeness"]
          },
          description: "Which validation checks to run (default: all)"
        },
        duplicate_threshold: {
          type: "number",
          description: "Similarity threshold for duplicate detection (0-1, default: 0.9)"
        }
      }
    }
  },
  {
    name: "version_knowledge",
    description: "Get version history for a knowledge entry or revert to a previous version.",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "ID of the knowledge entry"
        },
        action: {
          type: "string",
          enum: ["list", "get", "revert"],
          description: "Action to perform"
        },
        version: {
          type: "number",
          description: "Version number (required for 'get' and 'revert' actions)"
        }
      },
      required: ["id", "action"]
    }
  },
  {
    name: "import_knowledge",
    description: "Bulk import knowledge entries from JSON. Useful for migrating or seeding knowledge base.",
    inputSchema: {
      type: "object",
      properties: {
        entries: {
          type: "array",
          items: {
            type: "object",
            properties: {
              type: { type: "string" },
              content: { type: "string" },
              source: { type: "string" },
              metadata: { type: "object" }
            }
          },
          description: "Array of knowledge entries to import"
        },
        options: {
          type: "object",
          properties: {
            skip_duplicates: { type: "boolean" },
            validate_before_import: { type: "boolean" }
          }
        }
      },
      required: ["entries"]
    }
  },
  {
    name: "export_knowledge",
    description: "Export knowledge base or subset to JSON. Useful for backups or sharing.",
    inputSchema: {
      type: "object",
      properties: {
        filters: {
          type: "object",
          properties: {
            type: { type: "string" },
            category: { type: "string" },
            tags: { type: "array", items: { type: "string" } },
            since_date: { type: "string" }
          },
          description: "Filters for which entries to export (optional)"
        },
        include_versions: {
          type: "boolean",
          description: "Include version history (default: false)"
        },
        format: {
          type: "string",
          enum: ["json", "csv"],
          description: "Export format (default: json)"
        }
      }
    }
  }
];

// Tool handlers
async function handleCreateKnowledgeEntry(args: any): Promise<any> {
  const id = generateId();
  const now = new Date().toISOString();

  const entry: KnowledgeEntry = {
    id,
    type: args.type,
    content: args.content,
    metadata: {
      source: args.source,
      created_at: now,
      updated_at: now,
      author: args.author,
      category: args.category,
      tags: args.tags,
      confidence: args.confidence
    },
    version: 1,
    relationships: args.relationships
  };

  knowledgeBase.entries.set(id, [entry]);
  addToIndex(entry);

  return {
    success: true,
    id,
    message: "Knowledge entry created successfully",
    entry
  };
}

async function handleUpdateKnowledgeEntry(args: any): Promise<any> {
  const versions = knowledgeBase.entries.get(args.id);
  if (!versions || versions.length === 0) {
    return {
      success: false,
      error: `Knowledge entry ${args.id} not found`
    };
  }

  const current = versions[versions.length - 1];
  const now = new Date().toISOString();

  const updated: KnowledgeEntry = {
    ...current,
    content: args.content || current.content,
    metadata: {
      ...current.metadata,
      ...args.metadata,
      updated_at: now
    },
    version: current.version + 1
  };

  removeFromIndex(current);
  versions.push(updated);
  addToIndex(updated);

  return {
    success: true,
    message: "Knowledge entry updated successfully",
    changelog: args.changelog,
    entry: updated
  };
}

async function handleDeleteKnowledgeEntry(args: any): Promise<any> {
  const versions = knowledgeBase.entries.get(args.id);
  if (!versions || versions.length === 0) {
    return {
      success: false,
      error: `Knowledge entry ${args.id} not found`
    };
  }

  const current = versions[versions.length - 1];
  removeFromIndex(current);

  if (args.hard_delete) {
    knowledgeBase.entries.delete(args.id);
    return {
      success: true,
      message: "Knowledge entry permanently deleted",
      hard_delete: true
    };
  } else {
    const deleted: KnowledgeEntry = {
      ...current,
      metadata: {
        ...current.metadata,
        updated_at: new Date().toISOString(),
        tags: [...(current.metadata.tags || []), '_deleted']
      },
      version: current.version + 1
    };
    versions.push(deleted);

    return {
      success: true,
      message: "Knowledge entry soft deleted (marked as deleted, history preserved)",
      hard_delete: false
    };
  }
}

async function handleQueryKnowledge(args: any): Promise<any> {
  const results: KnowledgeEntry[] = [];
  const limit = args.limit || 10;

  for (const [id, versions] of knowledgeBase.entries) {
    const current = versions[versions.length - 1];

    // Skip deleted entries
    if (current.metadata.tags?.includes('_deleted')) continue;

    // Apply filters
    if (args.type && current.type !== args.type) continue;
    if (args.category && current.metadata.category !== args.category) continue;
    if (args.tags && !args.tags.some((tag: string) => current.metadata.tags?.includes(tag))) continue;
    if (args.query && !current.content.toLowerCase().includes(args.query.toLowerCase())) continue;

    results.push(current);
    if (results.length >= limit) break;
  }

  return {
    success: true,
    count: results.length,
    results
  };
}

async function handleValidateKnowledge(args: any): Promise<any> {
  const checks = args.checks || ["duplicates", "conflicts", "staleness", "completeness"];
  const report: any = {
    timestamp: new Date().toISOString(),
    checks_run: checks,
    issues: []
  };

  const entriesToCheck = args.id
    ? [getCurrentVersion(args.id)].filter(Boolean)
    : Array.from(knowledgeBase.entries.values()).map(versions => versions[versions.length - 1]);

  for (const entry of entriesToCheck) {
    if (!entry) continue;

    if (checks.includes("duplicates")) {
      const duplicates = findDuplicates(entry.content, args.duplicate_threshold || 0.9);
      if (duplicates.length > 1) {
        report.issues.push({
          type: "duplicate",
          entry_id: entry.id,
          duplicates: duplicates.filter(id => id !== entry.id),
          severity: "warning"
        });
      }
    }

    if (checks.includes("conflicts")) {
      const conflicts = detectConflicts(entry);
      if (conflicts.length > 0) {
        report.issues.push({
          type: "conflict",
          entry_id: entry.id,
          conflicts,
          severity: "warning"
        });
      }
    }

    if (checks.includes("staleness")) {
      const daysSinceUpdate = (Date.now() - new Date(entry.metadata.updated_at).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceUpdate > 90) {
        report.issues.push({
          type: "staleness",
          entry_id: entry.id,
          days_old: Math.floor(daysSinceUpdate),
          severity: daysSinceUpdate > 180 ? "error" : "warning"
        });
      }
    }

    if (checks.includes("completeness")) {
      const missing = [];
      if (!entry.metadata.category) missing.push("category");
      if (!entry.metadata.tags || entry.metadata.tags.length === 0) missing.push("tags");
      if (!entry.metadata.author) missing.push("author");

      if (missing.length > 0) {
        report.issues.push({
          type: "incomplete",
          entry_id: entry.id,
          missing_fields: missing,
          severity: "info"
        });
      }
    }
  }

  report.summary = {
    total_checked: entriesToCheck.length,
    issues_found: report.issues.length,
    by_severity: {
      error: report.issues.filter((i: any) => i.severity === "error").length,
      warning: report.issues.filter((i: any) => i.severity === "warning").length,
      info: report.issues.filter((i: any) => i.severity === "info").length
    }
  };

  return report;
}

async function handleVersionKnowledge(args: any): Promise<any> {
  const versions = knowledgeBase.entries.get(args.id);
  if (!versions || versions.length === 0) {
    return {
      success: false,
      error: `Knowledge entry ${args.id} not found`
    };
  }

  switch (args.action) {
    case "list":
      return {
        success: true,
        id: args.id,
        versions: versions.map(v => ({
          version: v.version,
          updated_at: v.metadata.updated_at,
          author: v.metadata.author
        }))
      };

    case "get":
      const version = versions.find(v => v.version === args.version);
      if (!version) {
        return {
          success: false,
          error: `Version ${args.version} not found`
        };
      }
      return {
        success: true,
        version
      };

    case "revert":
      const revertTo = versions.find(v => v.version === args.version);
      if (!revertTo) {
        return {
          success: false,
          error: `Version ${args.version} not found`
        };
      }

      const current = versions[versions.length - 1];
      removeFromIndex(current);

      const reverted: KnowledgeEntry = {
        ...revertTo,
        version: current.version + 1,
        metadata: {
          ...revertTo.metadata,
          updated_at: new Date().toISOString()
        }
      };

      versions.push(reverted);
      addToIndex(reverted);

      return {
        success: true,
        message: `Reverted to version ${args.version}`,
        entry: reverted
      };

    default:
      return {
        success: false,
        error: `Unknown action: ${args.action}`
      };
  }
}

async function handleImportKnowledge(args: any): Promise<any> {
  const results = {
    imported: 0,
    skipped: 0,
    errors: [] as string[]
  };

  const skipDuplicates = args.options?.skip_duplicates || false;
  const validateBeforeImport = args.options?.validate_before_import || false;

  for (const entryData of args.entries) {
    try {
      if (skipDuplicates) {
        const duplicates = findDuplicates(entryData.content);
        if (duplicates.length > 0) {
          results.skipped++;
          continue;
        }
      }

      if (validateBeforeImport) {
        // Basic validation
        if (!entryData.type || !entryData.content || !entryData.source) {
          results.errors.push(`Invalid entry: missing required fields`);
          continue;
        }
      }

      await handleCreateKnowledgeEntry(entryData);
      results.imported++;
    } catch (error) {
      results.errors.push(`Error importing entry: ${(error as Error).message}`);
    }
  }

  return {
    success: true,
    ...results,
    message: `Imported ${results.imported} entries, skipped ${results.skipped}`
  };
}

async function handleExportKnowledge(args: any): Promise<any> {
  const entries: KnowledgeEntry[] = [];
  const includeVersions = args.include_versions || false;

  for (const [id, versions] of knowledgeBase.entries) {
    const entriesToExport = includeVersions ? versions : [versions[versions.length - 1]];

    for (const entry of entriesToExport) {
      // Apply filters
      if (args.filters) {
        if (args.filters.type && entry.type !== args.filters.type) continue;
        if (args.filters.category && entry.metadata.category !== args.filters.category) continue;
        if (args.filters.tags && !args.filters.tags.some((tag: string) => entry.metadata.tags?.includes(tag))) continue;
        if (args.filters.since_date && entry.metadata.updated_at < args.filters.since_date) continue;
      }

      entries.push(entry);
    }
  }

  const format = args.format || "json";

  if (format === "json") {
    return {
      success: true,
      format: "json",
      count: entries.length,
      data: entries
    };
  } else if (format === "csv") {
    // Simple CSV conversion
    const csv = [
      "id,type,content,source,created_at,updated_at,version",
      ...entries.map(e =>
        `${e.id},${e.type},"${e.content.replace(/"/g, '""')}",${e.metadata.source},${e.metadata.created_at},${e.metadata.updated_at},${e.version}`
      )
    ].join("\n");

    return {
      success: true,
      format: "csv",
      count: entries.length,
      data: csv
    };
  }

  return {
    success: false,
    error: `Unknown format: ${format}`
  };
}

// Create server instance
const server = new Server(
  {
    name: "knowledge-base-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Register tool handlers
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const { name, arguments: args } = request.params;

    switch (name) {
      case "create_knowledge_entry":
        return { content: [{ type: "text", text: JSON.stringify(await handleCreateKnowledgeEntry(args), null, 2) }] };
      case "update_knowledge_entry":
        return { content: [{ type: "text", text: JSON.stringify(await handleUpdateKnowledgeEntry(args), null, 2) }] };
      case "delete_knowledge_entry":
        return { content: [{ type: "text", text: JSON.stringify(await handleDeleteKnowledgeEntry(args), null, 2) }] };
      case "query_knowledge":
        return { content: [{ type: "text", text: JSON.stringify(await handleQueryKnowledge(args), null, 2) }] };
      case "validate_knowledge":
        return { content: [{ type: "text", text: JSON.stringify(await handleValidateKnowledge(args), null, 2) }] };
      case "version_knowledge":
        return { content: [{ type: "text", text: JSON.stringify(await handleVersionKnowledge(args), null, 2) }] };
      case "import_knowledge":
        return { content: [{ type: "text", text: JSON.stringify(await handleImportKnowledge(args), null, 2) }] };
      case "export_knowledge":
        return { content: [{ type: "text", text: JSON.stringify(await handleExportKnowledge(args), null, 2) }] };
      default:
        return {
          content: [{ type: "text", text: JSON.stringify({ error: `Unknown tool: ${name}` }) }],
          isError: true
        };
    }
  } catch (error) {
    return {
      content: [{ type: "text", text: JSON.stringify({ error: (error as Error).message }) }],
      isError: true
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Knowledge Base MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
