# MCP Code Execution: Filesystem Structure Specification
## How to Organize MCP Tools as Code

**Last Updated:** November 14, 2025  
**Status:** Production Ready  
**Based on:** Anthropic's "Code Execution with MCP" (November 2025)

---

## 🎯 Overview

In the code execution pattern, MCP tools are **not** loaded into the agent's context as JSON schemas. Instead, they're represented as **TypeScript files on disk** that the agent can discover and import dynamically.

This document specifies the exact filesystem structure, file formats, and conventions.

---

## 📁 Directory Structure

### Root Layout

```
/servers/                           # Root directory for all MCP servers
  /google-drive/                    # One directory per MCP server
    getDocument.ts                  # One file per tool
    writeDocument.ts
    listFiles.ts
    searchFiles.ts
    shareDocument.ts
    README.md                       # Optional: Server documentation
  /salesforce/
    createAccount.ts
    updateRecord.ts
    queryRecords.ts
    deleteRecord.ts
    README.md
  /slack/
    sendMessage.ts
    readChannel.ts
    listChannels.ts
    uploadFile.ts
    README.md
  /github/
    createIssue.ts
    updateIssue.ts
    createPR.ts
    mergePR.ts
    README.md
  /database/
    query.ts
    insert.ts
    update.ts
    delete.ts
    README.md
```

### Conventions

1. **One directory per MCP server**
   - Directory name = server name (lowercase, hyphenated)
   - Example: `google-drive`, `salesforce`, `slack`

2. **One TypeScript file per tool**
   - Filename = tool name (camelCase) + `.ts`
   - Example: `getDocument.ts`, `createAccount.ts`

3. **Optional README per server**
   - Overview of server capabilities
   - Authentication requirements
   - Usage examples

---

## 📄 Tool File Format

### Standard Template

Every tool file follows this structure:

```typescript
// ./servers/{server-name}/{toolName}.ts

/**
 * Brief description of what this tool does
 * 
 * @example
 * const result = await toolName({ param1: 'value' });
 */

// 1. Input interface (parameters)
interface ToolNameInput {
  param1: string;
  param2?: number;  // Optional parameters marked with ?
  param3: {         // Nested objects allowed
    subfield: string;
  };
}

// 2. Output interface (response)
interface ToolNameResponse {
  data: string;
  status: 'success' | 'error';
  metadata?: {
    timestamp: string;
  };
}

// 3. Exported async function
export async function toolName(
  input: ToolNameInput
): Promise<ToolNameResponse> {
  // This calls the actual MCP tool under the hood
  return callMCPTool<ToolNameResponse>(
    'server_name__tool_name',  // MCP tool identifier
    input
  );
}
```

### Key Elements

1. **JSDoc Comment** - Describes the tool and provides example
2. **Input Interface** - Typed parameters (TypeScript interfaces)
3. **Output Interface** - Typed response structure
4. **Exported Function** - Async function that calls underlying MCP tool
5. **Type Safety** - Full TypeScript type definitions

---

## 📝 Real-World Examples

### Example 1: Google Drive - Get Document

```typescript
// ./servers/google-drive/getDocument.ts

/**
 * Reads a document from Google Drive
 * 
 * Returns the full content of the document along with metadata.
 * Supports Google Docs, Sheets, and Slides.
 * 
 * @example
 * const doc = await getDocument({ 
 *   documentId: '1abc...xyz' 
 * });
 * console.log(doc.content);
 */

interface GetDocumentInput {
  documentId: string;
  format?: 'text' | 'html' | 'markdown';  // Default: text
}

interface GetDocumentResponse {
  content: string;
  metadata: {
    title: string;
    author: string;
    lastModified: string;
    wordCount: number;
  };
}

export async function getDocument(
  input: GetDocumentInput
): Promise<GetDocumentResponse> {
  return callMCPTool<GetDocumentResponse>(
    'google_drive__get_document',
    input
  );
}
```

### Example 2: Salesforce - Update Record

```typescript
// ./servers/salesforce/updateRecord.ts

/**
 * Updates an existing Salesforce record
 * 
 * Can update any standard or custom object.
 * Performs partial updates - only specified fields are changed.
 * 
 * @example
 * await updateRecord({
 *   objectType: 'Account',
 *   recordId: '001...',
 *   data: { Name: 'Updated Name', Phone: '555-1234' }
 * });
 */

interface UpdateRecordInput {
  objectType: string;      // e.g., 'Account', 'Contact', 'Opportunity'
  recordId: string;        // Salesforce record ID
  data: Record<string, any>;  // Key-value pairs of fields to update
}

interface UpdateRecordResponse {
  success: boolean;
  recordId: string;
  updatedFields: string[];
  errors?: string[];
}

export async function updateRecord(
  input: UpdateRecordInput
): Promise<UpdateRecordResponse> {
  return callMCPTool<UpdateRecordResponse>(
    'salesforce__update_record',
    input
  );
}
```

### Example 3: Slack - Send Message

```typescript
// ./servers/slack/sendMessage.ts

/**
 * Sends a message to a Slack channel
 * 
 * Supports markdown formatting, @mentions, and emoji.
 * Can be used for both channels and direct messages.
 * 
 * @example
 * await sendMessage({
 *   channel: '#engineering',
 *   text: 'Deploy complete! :rocket:'
 * });
 */

interface SendMessageInput {
  channel: string;         // Channel name (#general) or user (@username)
  text: string;           // Message content (supports markdown)
  threadId?: string;      // Optional: Reply in thread
  attachments?: Array<{   // Optional: Rich attachments
    title: string;
    text: string;
    color?: string;
  }>;
}

interface SendMessageResponse {
  success: boolean;
  messageId: string;
  timestamp: string;
  permalink: string;
}

export async function sendMessage(
  input: SendMessageInput
): Promise<SendMessageResponse> {
  return callMCPTool<SendMessageResponse>(
    'slack__send_message',
    input
  );
}
```

### Example 4: GitHub - Create Issue

```typescript
// ./servers/github/createIssue.ts

/**
 * Creates a new issue in a GitHub repository
 * 
 * Supports labels, assignees, and milestone assignment.
 * Returns the issue URL for reference.
 * 
 * @example
 * const issue = await createIssue({
 *   owner: 'myorg',
 *   repo: 'myrepo',
 *   title: 'Bug: Login fails',
 *   body: 'Steps to reproduce...',
 *   labels: ['bug', 'high-priority']
 * });
 */

interface CreateIssueInput {
  owner: string;           // Repository owner
  repo: string;            // Repository name
  title: string;           // Issue title
  body?: string;           // Issue description (markdown)
  labels?: string[];       // Label names
  assignees?: string[];    // GitHub usernames
  milestone?: number;      // Milestone number
}

interface CreateIssueResponse {
  success: boolean;
  issueNumber: number;
  issueUrl: string;
  createdAt: string;
}

export async function createIssue(
  input: CreateIssueInput
): Promise<CreateIssueResponse> {
  return callMCPTool<CreateIssueResponse>(
    'github__create_issue',
    input
  );
}
```

---

## 🔍 Discovery Patterns

### Method 1: Filesystem Navigation

The agent can explore the directory structure to discover tools:

```typescript
// Agent code to discover tools

// 1. List all available servers
const servers = await fs.readdir('./servers');
// Returns: ['google-drive', 'salesforce', 'slack', 'github']

// 2. Explore a specific server
const gdriveTools = await fs.readdir('./servers/google-drive');
// Returns: ['getDocument.ts', 'writeDocument.ts', 'listFiles.ts', ...]

// 3. Read tool definition when needed
const toolDef = await fs.readFile('./servers/google-drive/getDocument.ts');
// Now agent understands the tool interface

// 4. Import and use the tool
import { getDocument } from './servers/google-drive/getDocument';
const doc = await getDocument({ documentId: 'abc123' });
```

### Method 2: Search Function (Optional)

Alternatively, provide a search tool for semantic discovery:

```typescript
// ./servers/search_tools.ts

/**
 * Searches available MCP tools by keyword or description
 * 
 * Performs semantic search across tool names and descriptions.
 * Returns relevant tools ranked by relevance.
 * 
 * @example
 * const tools = await search_tools({
 *   query: 'salesforce update',
 *   limit: 5
 * });
 */

interface SearchToolsInput {
  query: string;
  limit?: number;  // Default: 10
  server?: string; // Optional: Filter by server
}

interface SearchToolsResponse {
  results: Array<{
    server: string;
    tool: string;
    path: string;
    description: string;
    relevance: number;  // 0.0 to 1.0
  }>;
}

export async function search_tools(
  input: SearchToolsInput
): Promise<SearchToolsResponse> {
  // Implementation: Semantic search across tool definitions
  return callMCPTool<SearchToolsResponse>(
    'mcp_search__search_tools',
    input
  );
}
```

---

## 🛠️ Implementation Guide

### Step 1: Generate Tool Files from MCP Servers

When your agent starts, generate the filesystem structure from connected MCP servers:

```typescript
// generate-filesystem.ts

import { MCPClient } from '@modelcontextprotocol/sdk';
import * as fs from 'fs/promises';

async function generateFilesystem(mcpServers: MCPServer[]) {
  // Create root directory
  await fs.mkdir('./servers', { recursive: true });
  
  for (const server of mcpServers) {
    // Create server directory
    const serverPath = `./servers/${server.name}`;
    await fs.mkdir(serverPath, { recursive: true });
    
    // Generate file for each tool
    for (const tool of server.tools) {
      const filePath = `${serverPath}/${tool.name}.ts`;
      const fileContent = generateToolFile(server, tool);
      await fs.writeFile(filePath, fileContent);
    }
    
    // Generate README
    const readmePath = `${serverPath}/README.md`;
    const readmeContent = generateReadme(server);
    await fs.writeFile(readmePath, readmeContent);
  }
}

function generateToolFile(server: MCPServer, tool: Tool): string {
  return `
/**
 * ${tool.description}
 */

interface ${tool.name}Input ${generateInterface(tool.inputSchema)}

interface ${tool.name}Response ${generateInterface(tool.outputSchema)}

export async function ${tool.name}(
  input: ${tool.name}Input
): Promise<${tool.name}Response> {
  return callMCPTool<${tool.name}Response>(
    '${server.name}__${tool.name}',
    input
  );
}
`.trim();
}
```

### Step 2: Mount Filesystem in Agent Environment

```typescript
// agent-setup.ts

const agent = new Agent({
  model: 'claude-sonnet-4-20250514',
  tools: [
    'code_execution',    // Enable code execution
    'file_system'        // Enable filesystem access
  ],
  filesystem: {
    mount: './servers',  // Mount point for MCP tools
    readonly: true       // Tools are readonly
  },
  systemPrompt: `
    You have access to MCP tools as TypeScript files.
    Tools are located in ./servers/{server-name}/{tool-name}.ts
    
    To use a tool:
    1. Explore ./servers/ to find relevant tools
    2. Read the tool file to understand its interface
    3. Import and call the tool in your code
    
    Example:
    import { getDocument } from './servers/google-drive/getDocument';
    const doc = await getDocument({ documentId: 'abc123' });
  `
});
```

### Step 3: Agent Workflow

The agent follows this pattern:

```typescript
// Example agent execution

// User: "Read the Q4 planning doc and update Salesforce"

// Agent thinks: "I need Google Drive and Salesforce tools"

// Step 1: Discover tools
const servers = await fs.readdir('./servers');
// ['google-drive', 'salesforce', 'slack', ...]

// Step 2: Find relevant tools
const gdriveTools = await fs.readdir('./servers/google-drive');
// ['getDocument.ts', 'writeDocument.ts', ...]

const salesforceTools = await fs.readdir('./servers/salesforce');
// ['updateRecord.ts', 'createAccount.ts', ...]

// Step 3: Read tool definitions
const getDocDef = await fs.readFile('./servers/google-drive/getDocument.ts');
const updateRecordDef = await fs.readFile('./servers/salesforce/updateRecord.ts');

// Step 4: Write code using tools
import { getDocument } from './servers/google-drive/getDocument';
import { updateRecord } from './servers/salesforce/updateRecord';

// Read document (stays in sandbox)
const doc = await getDocument({ documentId: 'q4-planning-doc-id' });

// Extract key information (in sandbox)
const summary = extractKeyPoints(doc.content);

// Update Salesforce (in sandbox)
await updateRecord({
  objectType: 'Account',
  recordId: 'account-id',
  data: { Q4_Planning: summary }
});

// Return result (only this goes to model context)
return {
  success: true,
  documentProcessed: doc.metadata.title,
  salesforceUpdated: true
};
```

---

## 📋 Server README Template

Each server should have a README explaining its capabilities:

```markdown
# Google Drive MCP Server

Integration with Google Drive for document operations.

## Authentication

Requires OAuth 2.0 with scopes:
- `https://www.googleapis.com/auth/drive.readonly`
- `https://www.googleapis.com/auth/drive.file`

## Available Tools

### Read Operations
- `getDocument.ts` - Read document content
- `listFiles.ts` - List files in a folder
- `searchFiles.ts` - Search for files by query

### Write Operations
- `writeDocument.ts` - Create or update document
- `shareDocument.ts` - Share document with users

## Usage Examples

### Read a document
\`\`\`typescript
import { getDocument } from './google-drive/getDocument';
const doc = await getDocument({ documentId: 'abc123' });
\`\`\`

### Search for files
\`\`\`typescript
import { searchFiles } from './google-drive/searchFiles';
const results = await searchFiles({ 
  query: 'Q4 Planning',
  mimeType: 'application/vnd.google-apps.document'
});
\`\`\`

## Rate Limits

- 1000 requests per 100 seconds per user
- Exponential backoff on rate limit errors

## Error Handling

All tools return errors in the response object:
\`\`\`typescript
{
  success: false,
  error: {
    code: 'NOT_FOUND',
    message: 'Document not found'
  }
}
\`\`\`
```

---

## 🔒 Security Considerations

### File Permissions

```yaml
./servers/
  permissions: read-only
  owner: mcp-client
  reason: "Agent should not modify tool definitions"

./skills/
  permissions: read-write
  owner: agent
  reason: "Agent creates and modifies skills"
```

### Sensitive Data

```typescript
// DO NOT include credentials in tool files
// ❌ BAD:
const API_KEY = 'sk-1234...';  // Never do this!

// ✅ GOOD:
// Credentials handled by callMCPTool internally
// Agent never sees credentials
```

---

## 📊 Performance Considerations

### Token Usage

**Traditional (All tools in context):**
```
50 tools × 5,000 tokens = 250,000 tokens
Every conversation starts with 250K tokens!
```

**Code Execution (On-demand loading):**
```
Agent lists ./servers/: 200 tokens
Agent reads 3 tool files: 600 tokens
Total: 800 tokens

Savings: 99.7%! 🎉
```

### Latency

**Filesystem operations are fast:**
- List directory: ~1ms
- Read tool file: ~5ms
- Import tool: ~10ms

**Total discovery overhead: ~50ms** (negligible compared to model latency)

---

## 🎯 Best Practices

### 1. Consistent Naming

```typescript
// ✅ GOOD: Clear, descriptive names
getDocument.ts
createAccount.ts
sendMessage.ts

// ❌ BAD: Vague or abbreviated
get.ts
doc.ts
msg.ts
```

### 2. Comprehensive Interfaces

```typescript
// ✅ GOOD: All fields typed
interface Input {
  requiredField: string;
  optionalField?: number;
  nestedField: {
    subfield: string;
  };
}

// ❌ BAD: Any types
interface Input {
  data: any;  // Lost type safety!
}
```

### 3. Helpful Comments

```typescript
// ✅ GOOD: Explains usage
/**
 * Sends a Slack message with markdown support
 * @example await sendMessage({ channel: '#general', text: 'Hi!' })
 */

// ❌ BAD: No explanation
// Send message
```

### 4. Error Handling

```typescript
// ✅ GOOD: Errors in response
interface Response {
  success: boolean;
  data?: string;
  error?: {
    code: string;
    message: string;
  };
}

// ❌ BAD: Throws exceptions (hard for agent to handle)
```

---

## 🔄 Migration from Traditional MCP

### Before (Traditional)

```typescript
// All tools loaded in context
const tools = [
  {
    name: 'google_drive__get_document',
    description: 'Reads a document...',
    parameters: { /* 5000 tokens of schema */ }
  },
  // ... 49 more tools
];

// Total: 250,000 tokens in every context!
```

### After (Code Execution)

```typescript
// Tools on filesystem (0 tokens in context)
./servers/google-drive/getDocument.ts  // Only loaded when needed

// Agent discovers and uses dynamically
import { getDocument } from './servers/google-drive/getDocument';
const doc = await getDocument({ documentId: 'abc123' });

// Only ~1000 tokens used!
```

---

## 📚 Related Documentation

- [MCP Decision Framework](./mcp-decision-framework.md) - When to use this pattern
- [Progressive Discovery](./mcp-progressive-discovery.md) - How agents find tools
- [Security Architecture](./mcp-security-architecture.md) - Sandboxing and isolation
- [Performance Benchmarks](./mcp-performance-benchmarks.md) - Real-world numbers

---

## ✅ Checklist for Implementation

- [ ] Choose directory structure (recommend: /servers/)
- [ ] Generate tool files from MCP servers
- [ ] Implement callMCPTool() bridge function
- [ ] Add filesystem to agent environment
- [ ] Update agent system prompt
- [ ] Test tool discovery
- [ ] Verify imports work
- [ ] Measure token reduction
- [ ] Document for team

---

**Last Updated:** November 14, 2025  
**Specification Version:** 1.0  
**Based on:** Anthropic's November 2025 guidance
