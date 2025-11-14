# Code Execution Pattern: Advanced Implementation

## Overview

The **Code Execution** pattern is an advanced MCP implementation where agents discover and load tools on-demand as code files, execute them in sandboxes, and create reusable skills that persist across sessions.

**Key Innovation**: Instead of loading all tools into context, tools exist as code files that agents can discover, read selectively, and execute - achieving 60-95% token reduction.

## Core Concepts

### 1. Tools as Code Files

Instead of:
```yaml
# Direct MCP: Tool in context
Tool: get_document
Description: Retrieves Google Drive document...
Parameters: {...}
Returns: {...}
(500 tokens in context)
```

We have:
```typescript
// Code Execution: Tool as file
// /servers/google-drive/getDocument.ts

/**
 * Retrieves content of a Google Drive document
 * @param documentId - ID of the document
 * @returns Document content as text
 */
async function getDocument(documentId: string): Promise<string> {
    const client = await getMcpClient('google-drive');
    const result = await client.call_tool('get_document', {
        document_id: documentId
    });
    return result.content;
}

export { getDocument };
```

**Agent Only Loads This File If Needed** (200 tokens when read)

### 2. Progressive Discovery

Agent discovers tools through:

**Method A: Filesystem Navigation**
```typescript
// Agent explores filesystem
const servers = await fs.readdir('/servers');
// Returns: ['google-drive', 'notion', 'salesforce', ...]

const driveTools = await fs.readdir('/servers/google-drive');
// Returns: ['getDocument.ts', 'createDocument.ts', ...]

// Agent reads only what it needs
const toolCode = await fs.readFile('/servers/google-drive/getDocument.ts');
```

**Method B: Semantic Search**
```typescript
// Agent searches by intent
const tools = await search_tools("read a Google Drive document");
// Returns: [
//   {path: '/servers/google-drive/getDocument.ts', relevance: 0.95},
//   {path: '/servers/google-drive/readFile.ts', relevance: 0.87}
// ]
```

### 3. Sandbox Execution

All code runs in isolated sandboxes:

```
┌────────────────────────────────────┐
│ Sandbox (Docker/gVisor/E2B)        │
│ ┌────────────────────────────────┐ │
│ │ Agent's Code Execution:        │ │
│ │                                 │ │
│ │ import { getDocument }         │ │
│ │ from './servers/google-drive';│ │
│ │                                 │ │
│ │ const doc = await getDocument( │ │
│ │   '1abc123'                     │ │
│ │ );                              │ │
│ │                                 │ │
│ │ // Process document...         │ │
│ └────────────────────────────────┘ │
│                                    │
│ Isolated from host system          │
│ Resource limited                   │
│ Network restricted                 │
└────────────────────────────────────┘
```

### 4. Self-Improving Skills

After completing a task, agent can create a reusable skill:

```typescript
// /mnt/skills/copy-drive-to-notion.ts
/**
 * Copies Google Drive document to Notion database
 * Created: 2025-11-14
 * Used: 47 times
 */
import { getDocument } from '../servers/google-drive/getDocument';
import { createPage } from '../servers/notion/createPage';

export async function copyDriveToNotion(
    driveDocId: string,
    notionDbId: string,
    title: string
): Promise<{id: string, url: string}> {
    const content = await getDocument(driveDocId);
    const page = await createPage(notionDbId, {Title: title}, content);
    return page;
}
```

**Next time**: Agent finds this skill, uses it directly (massive token savings!)

## Architecture

### Filesystem Structure

```
/servers/                           # All available tools
  /google-drive/
    README.md                       # Server description
    getDocument.ts                  # Individual tool files
    createDocument.ts
    listFiles.ts
    deleteFile.ts
  /notion/
    README.md
    createPage.ts
    updatePage.ts
    queryDatabase.ts
  /salesforce/
    README.md
    queryRecords.ts
    updateRecord.ts
  ... (50 servers)

/mnt/skills/                        # Reusable skills (persistent)
  copy-drive-to-notion.ts          # Agent-created skills
  analyze-sales-data.ts
  generate-weekly-report.ts
  ... (grows over time)
```

### Complete Flow

```
1. User Request
   "Copy document from Google Drive to Notion"

2. Agent Checks Skills
   ├─ Reads /mnt/skills/ directory
   ├─ Finds: copy-drive-to-notion.ts
   └─ If found: USE IT (fastest path!)

3. If No Skill Exists
   ├─ Agent discovers tools:
   │  - Method A: Browse /servers/
   │  - Method B: Search "google drive" and "notion"
   │
   ├─ Agent selects relevant tools:
   │  - /servers/google-drive/getDocument.ts
   │  - /servers/notion/createPage.ts
   │
   ├─ Agent reads ONLY those files (400 tokens)
   │
   └─ Agent writes code:
       import { getDocument } from './servers/google-drive/getDocument';
       import { createPage } from './servers/notion/createPage';

       const doc = await getDocument('1abc');
       await createPage('db456', {Title: 'My Doc'}, doc);

4. Agent Executes in Sandbox
   ├─ Code runs in isolated environment
   ├─ Tools are called
   ├─ Results returned
   └─ Success!

5. Agent Suggests Skill Creation
   "This workflow might be reused. Create skill?"
   ├─ If yes: Save to /mnt/skills/copy-drive-to-notion.ts
   └─ Next time: Use skill directly (step 2)
```

## Token Comparison

### Example Task: "Copy Drive doc to Notion"

**Direct MCP**:
```
Context loaded:
├─ All 50 MCP servers
├─ All ~200 tools
├─ Full descriptions for each
└─ TOTAL: ~100,000 tokens

Execution:
├─ User message: 100 tokens
├─ Tool calls: 2,000 tokens
├─ Results: 3,000 tokens
└─ Response: 1,000 tokens

GRAND TOTAL: 106,100 tokens
COST: ~$0.32
```

**Code Execution (First Run)**:
```
Context loaded:
└─ Available servers list: 200 tokens

Discovery & Loading:
├─ Read google-drive README: 150 tokens
├─ Read getDocument.ts: 200 tokens
├─ Read notion README: 150 tokens
├─ Read createPage.ts: 200 tokens
└─ Subtotal: 900 tokens

Execution:
├─ User message: 100 tokens
├─ Code execution: 1,500 tokens
├─ Results: 2,000 tokens
└─ Response: 500 tokens

GRAND TOTAL: 5,000 tokens
SAVINGS: 95.3% ✅
COST: ~$0.015
```

**Code Execution (With Skill)**:
```
Context loaded:
└─ Available skills list: 150 tokens

Skill Usage:
├─ Read copy-drive-to-notion.ts: 300 tokens
├─ Execute skill: 1,000 tokens
├─ Results: 1,500 tokens
└─ Response: 500 tokens

GRAND TOTAL: 3,450 tokens
SAVINGS: 96.7% ✅
COST: ~$0.010
```

## Benefits

### 1. Massive Token Reduction

**First Run**: 40-60% savings
**With Skills**: 85-95% savings

```yaml
Scenario: 5-tool workflow
Direct MCP: 110,000 tokens
Code Execution: 12,000 tokens (first), 4,000 (with skill)
Savings: 89% → 96%
```

### 2. Scalability

```yaml
Direct MCP Limit: ~200 tools (context fills up)
Code Execution: 1000+ tools (load on demand)
```

### 3. Self-Improvement

```
Week 1: 0 skills, discovering tools each time
Week 4: 10 skills, 30% reuse rate
Week 12: 40 skills, 70% reuse rate
Week 24: 60 skills, 85% reuse rate
```

### 4. Better Latency (Complex Tasks)

```yaml
Task: 5 sequential tool calls with conditional logic

Direct MCP:
├─ Round 1: Agent → Tool → Agent (2s)
├─ Round 2: Agent → Tool → Agent (2s)
├─ Round 3: Agent → Tool → Agent (2s)
├─ Round 4: Agent → Tool → Agent (2s)
├─ Round 5: Agent → Tool → Agent (2s)
└─ TOTAL: 10 seconds

Code Execution:
├─ Code execution with logic in sandbox (3s)
└─ TOTAL: 3 seconds
Improvement: 3.3x faster ✅
```

### 5. Enhanced Security

4-layer security model:
1. Sandbox isolation
2. PII tokenization
3. Access control (RBAC)
4. Monitoring & audit

See [Security Guide](./07-mcp-security-privacy-best-practices.md)

## Challenges

### 1. Infrastructure Requirements

❌ **Complex setup needed**:
- Sandbox environment (Docker/gVisor/E2B)
- Persistent storage (/mnt/skills)
- IPython or Node interpreter
- Resource limits & monitoring

**Estimated Setup**: 2-4 weeks engineering time

### 2. Prompt Engineering

❌ **Requires careful prompting**:
- Agent must understand progressive discovery
- Must create appropriate skills
- Must reuse skills effectively

**LLMs not explicitly trained for this yet** (as of Nov 2025)

### 3. Security Complexity

❌ **4-layer security essential**:
- Sandbox could be compromised
- PII could leak in logs
- Access controls must be enforced
- Monitoring required

### 4. Operational Overhead

❌ **Ongoing maintenance**:
- Sandbox management
- Skill library curation
- Performance monitoring
- Cost tracking

**Estimated**: 0.5 FTE ongoing

## When to Use Code Execution

### Perfect Candidates (from our 50 MCPs)

**High Priority**:
1. **market-analyzer-mcp** - Large data analysis
2. **user-insight-analyzer-mcp** - Customer data (PII)
3. **semantic-search-mcp** - Large corpus operations
4. **deployment-orchestrator-mcp** - Multi-step workflows
5. **agent-orchestrator-mcp** - Complex coordination

**Characteristics**:
- ✅ 5+ tools
- ✅ > 10KB data
- ✅ High frequency usage
- ✅ Complex workflows
- ✅ PII handling

### Keep Direct MCP

**Low Priority (don't migrate)**:
- Simple generators (1-3 tools)
- One-off operations
- Real-time chat interactions
- Debugging/development tools

## Implementation Requirements

### Infrastructure Checklist

- [ ] **Sandbox Environment**
  - Docker OR gVisor OR E2B
  - Resource limits (CPU, memory)
  - Network isolation
  - Timeout configuration

- [ ] **Storage**
  - Persistent volume for /mnt/skills
  - Minimum 1GB available
  - Backup strategy

- [ ] **Interpreter**
  - IPython (Python) OR Node.js
  - Required packages installed
  - Safe execution mode

- [ ] **Security** (See Layer 1-4 in security guide)
  - Sandbox isolation tested
  - PII tokenization system
  - Access control (RBAC)
  - Audit logging

- [ ] **Monitoring**
  - Token usage tracking
  - Skill usage metrics
  - Error rate monitoring
  - Cost analysis dashboard

### Tool Conversion Process

For each MCP to migrate:

1. **Create /servers/ structure**
   ```bash
   mkdir -p /servers/google-drive
   ```

2. **Create README.md**
   ```markdown
   # Google Drive MCP Server
   Provides access to Google Drive files

   ## Tools
   - getDocument - Retrieve document content
   - createDocument - Create new document
   ...
   ```

3. **Convert each tool to .ts file**
   ```typescript
   // /servers/google-drive/getDocument.ts
   async function getDocument(id: string): Promise<string> {
       const client = await getMcpClient('google-drive');
       return await client.call_tool('get_document', {id});
   }
   export { getDocument };
   ```

4. **Update registry**
   ```json
   {
     "id": "google-drive-mcp",
     "pattern": "code-execution",
     "servers_path": "/servers/google-drive",
     "tools": ["getDocument", "createDocument", ...]
   }
   ```

See [Migration Guide](./04-mcp-migration-guide.md) for complete process.

## Expected Outcomes for ai-dev-standards

### If We Migrate 10 High-Complexity MCPs

**Assumptions**:
- 10 MCPs with 5+ tools each
- Used 500 times/month combined
- Currently using Direct MCP

**Current State (Direct MCP)**:
```yaml
Per Run: 110,000 tokens
Monthly: 500 × 110K = 55M tokens
Cost: $165/month
```

**After Migration (Code Execution)**:
```yaml
Month 1 (building skills):
  - Per run: 12,000 tokens average
  - Monthly: 500 × 12K = 6M tokens
  - Cost: $18/month + $100 infrastructure = $118/month
  - Savings: $47/month

Month 3 (skills established):
  - Per run: 4,000 tokens average (70% use skills)
  - Monthly: 500 × 4K = 2M tokens
  - Cost: $6/month + $100 infrastructure = $106/month
  - Savings: $59/month ($708/year)

Month 6+ (mature):
  - Per run: 3,000 tokens average (85% use skills)
  - Monthly: 500 × 3K = 1.5M tokens
  - Cost: $4.50/month + $100 infrastructure = $104.50/month
  - Savings: $60.50/month ($726/year)
```

**Break-even**: ~3-4 months (assuming $2K setup cost)

### Skill Library Growth

```yaml
Month 1: 5-10 skills created
Month 3: 20-30 skills (60% reuse)
Month 6: 40-50 skills (75% reuse)
Month 12: 60-80 skills (85% reuse)
```

## Getting Started

### Pilot Migration

Recommend starting with **ONE MCP**:

**Best First Candidate**: `semantic-search-mcp`

**Why**:
- ✅ Complex (multiple search operations)
- ✅ Large data (corpus searches)
- ✅ Repeated patterns
- ✅ Not mission-critical (safe to experiment)
- ✅ Clear success metrics

**Pilot Steps**:
1. Week 1: Set up sandbox + storage
2. Week 2: Convert semantic-search-mcp
3. Week 3: Test and measure
4. Week 4: Evaluate results

**Success Criteria**:
- Token reduction >40%
- Error rate ≤ baseline
- Latency ≤ baseline
- Skill creation working

If successful → Migrate more MCPs
If not → Investigate and iterate

## Monitoring & Optimization

### Key Metrics

```yaml
Per MCP:
  - tools_available: 8
  - tools_used_avg: 3.2
  - token_savings: 87%
  - skill_reuse_rate: 72%
  - error_rate: 0.5%

System-Wide:
  - total_tools: 200+
  - skills_created: 45
  - skill_usage_rate: 68%
  - avg_token_per_run: 4,200
  - monthly_cost: $126
  - vs_direct_mcp: $612 (79% savings)
```

### Optimization Opportunities

1. **Improve Skill Discovery**
   - Better naming conventions
   - Enhanced search
   - Skill recommendations

2. **Refine Tool Organization**
   - Group related tools
   - Better README files
   - Clearer descriptions

3. **Expand Skill Library**
   - Identify common patterns
   - Create generic skills
   - Document best practices

## Integration with Brain Orchestrator

Our `brain-mcp` can automatically choose pattern:

```typescript
// brain-mcp enhancement
const decision = await selectMCPPattern({
    task_description: "Analyze market trends",
    estimated_complexity: 7,
    data_size_kb: 50,
    frequency: "daily"
});

if (decision.pattern === 'code-execution') {
    // Use Code Execution approach
    executeWithCodeExecution(task);
} else {
    // Use Direct MCP
    executeWithDirectMCP(task);
}
```

See [Brain Integration Guide](./09-brain-orchestrator-mcp-integration.md)

## Conclusion

Code Execution is a powerful pattern for complex, high-frequency workflows with large data. It's not a replacement for Direct MCP, but a complementary approach for specific use cases.

**For ai-dev-standards**:
- Keep most of our 50 MCPs on Direct MCP
- Migrate 5-10 high-complexity MCPs to Code Execution
- Use brain orchestrator to choose automatically
- Monitor and optimize over time

---

**Related Documentation:**
- [Migration Guide](./04-mcp-migration-guide.md) - How to convert
- [Filesystem Structure](./05-mcp-filesystem-structure.md) - Tool organization
- [Progressive Discovery](./06-mcp-progressive-discovery-patterns.md) - Scaling to 1000+ tools
- [Security Guide](./07-mcp-security-privacy-best-practices.md) - 4-layer model
- [Benchmarking](./08-mcp-performance-benchmarking-guide.md) - Validation

**Last Updated**: 2025-11-14
