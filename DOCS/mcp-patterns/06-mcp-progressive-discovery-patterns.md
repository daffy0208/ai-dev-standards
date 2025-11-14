# Progressive Discovery Patterns for MCP Code Execution

## Executive Summary

Progressive Discovery is a core pattern in MCP Code Execution that enables agents to work efficiently with hundreds or thousands of tools **without loading them all into context**. Instead of the traditional "load everything upfront" approach, agents discover and load tools on-demand as needed.

**Key Benefit**: Scale to 1000+ tools while maintaining low token consumption

**Implementation Methods**: Filesystem navigation (simple) OR Semantic search (advanced)

---

## Table of Contents

1. [The Progressive Discovery Paradigm](#progressive-discovery-paradigm)
2. [Method A: Filesystem Navigation](#method-a-filesystem-navigation)
3. [Method B: Semantic Search](#method-b-semantic-search)
4. [Hybrid Approach](#hybrid-approach)
5. [Implementation Guide](#implementation-guide)
6. [Performance Optimization](#performance-optimization)

---

## The Progressive Discovery Paradigm

### Traditional Approach (Direct MCP)

```
Agent Startup:
├─ Load Tool 1 description (500 tokens)
├─ Load Tool 2 description (500 tokens)
├─ Load Tool 3 description (500 tokens)
├─ ... 
└─ Load Tool 100 description (500 tokens)

Total Context: 50,000 tokens BEFORE agent even starts!
```

**Problems:**
- Context window quickly filled
- Most tools never used
- Slow agent initialization
- Can't scale beyond ~200 tools

### Progressive Discovery (Code Execution)

```
Agent Startup:
└─ Tools available: 1000+ (but not loaded)

Agent Execution:
├─ Task: "Copy document from Drive to Notion"
├─ Discover: Search for "google drive" tools
├─ Find: getDocument.ts (1 file)
├─ Load: Only this file (200 tokens)
├─ Discover: Search for "notion" tools
├─ Find: createPage.ts (1 file)
├─ Load: Only this file (200 tokens)
└─ Execute: Use both tools

Total Context: 400 tokens for tools (vs 50,000)
```

**Benefits:**
- Context window stays small
- Only load what's needed
- Fast initialization
- Scales to 1000s of tools

---

## Method A: Filesystem Navigation

### Concept

Tools are organized in a discoverable filesystem structure that agents can navigate using standard file operations.

### Filesystem Structure

```
/servers/
├─ google-drive/
│  ├─ README.md                    # Server description
│  ├─ getDocument.ts              # Tool implementation
│  ├─ createDocument.ts
│  ├─ listFiles.ts
│  └─ deleteFile.ts
├─ notion/
│  ├─ README.md
│  ├─ createPage.ts
│  ├─ updatePage.ts
│  ├─ queryDatabase.ts
│  └─ getPage.ts
├─ salesforce/
│  ├─ README.md
│  ├─ updateRecord.ts
│  ├─ queryRecords.ts
│  └─ createLead.ts
└─ slack/
   ├─ README.md
   ├─ sendMessage.ts
   ├─ listChannels.ts
   └─ uploadFile.ts
```

### Discovery Workflow

```typescript
// Agent discovers tools through filesystem operations

// Step 1: List available servers
const servers = await fs.readdir('/servers');
// Returns: ['google-drive', 'notion', 'salesforce', 'slack']

// Step 2: Pick relevant server(s) based on task
// Task: "Copy Google Drive doc to Notion"
// Agent reasoning: Need google-drive and notion servers

// Step 3: List tools in google-drive server
const driveTools = await fs.readdir('/servers/google-drive');
// Returns: ['README.md', 'getDocument.ts', 'createDocument.ts', ...]

// Step 4: Read README to understand server
const driveReadme = await fs.readFile('/servers/google-drive/README.md');
// Contains: "Google Drive MCP Server provides access to Google Drive files..."

// Step 5: Based on task ("copy doc"), select getDocument tool
const getDocTool = await fs.readFile('/servers/google-drive/getDocument.ts');
// Only now is this tool loaded into context

// Step 6: Repeat for Notion
const notionTools = await fs.readdir('/servers/notion');
const notionReadme = await fs.readFile('/servers/notion/README.md');
const createPageTool = await fs.readFile('/servers/notion/createPage.ts');

// Step 7: Execute using discovered tools
import { getDocument } from './servers/google-drive/getDocument';
import { createPage } from './servers/notion/createPage';

const content = await getDocument(documentId);
await createPage(databaseId, content);
```

### README.md Format

Each server should have a README describing its purpose and available tools:

```markdown
# Google Drive MCP Server

Provides programmatic access to Google Drive files and folders.

## Available Tools

- **getDocument** - Retrieve content of a Google Doc by ID
- **createDocument** - Create a new Google Doc
- **listFiles** - List files in a folder
- **deleteFile** - Delete a file by ID
- **shareFile** - Share a file with users

## Authentication

Requires OAuth 2.0 authentication with Google Drive API.
Credentials must be configured before use.

## Common Use Cases

- Reading meeting transcripts stored in Drive
- Creating reports and documents programmatically
- Automating file management workflows
- Integrating Drive with other systems (CRM, project management)
```

### Agent Prompting for Filesystem Discovery

```yaml
system_prompt: |
  You are an agent with access to 1000+ tools organized in /servers/.
  
  ## PROGRESSIVE DISCOVERY WORKFLOW
  
  1. UNDERSTAND THE TASK
     - Parse the user's request
     - Identify which systems/servers are likely needed
     - Examples:
       * "Copy Drive doc to Notion" → google-drive, notion
       * "Send Slack message about Salesforce lead" → slack, salesforce
       * "Analyze data from Sheets and update CRM" → google-sheets, salesforce
  
  2. EXPLORE AVAILABLE SERVERS
     ```typescript
     const servers = await fs.readdir('/servers');
     console.log('Available servers:', servers);
     ```
  
  3. READ SERVER READMEs (IMPORTANT)
     For each relevant server, read README.md first:
     ```typescript
     const readme = await fs.readFile('/servers/google-drive/README.md', 'utf-8');
     ```
     This tells you what tools are available and when to use them.
  
  4. SELECT SPECIFIC TOOLS
     Based on README and task, choose specific tools:
     ```typescript
     const tools = await fs.readdir('/servers/google-drive');
     // Filter to just what you need
     const relevantTools = tools.filter(t => 
       t.includes('get') || t.includes('read') || t.includes('fetch')
     );
     ```
  
  5. LOAD ONLY NEEDED TOOLS
     ```typescript
     // Load just 1-3 tools, not all tools
     const getDocTool = await fs.readFile(
       '/servers/google-drive/getDocument.ts', 'utf-8'
     );
     ```
  
  6. IMPORT AND USE
     ```typescript
     import { getDocument } from './servers/google-drive/getDocument';
     const content = await getDocument(docId);
     ```
  
  ## EFFICIENCY RULES
  
  ❌ DON'T do this (loads everything):
  ```typescript
  const allServers = await fs.readdir('/servers');
  for (const server of allServers) {
    const tools = await fs.readdir(`/servers/${server}`);
    for (const tool of tools) {
      await fs.readFile(`/servers/${server}/${tool}`); // WASTEFUL!
    }
  }
  ```
  
  ✅ DO this (loads only what's needed):
  ```typescript
  // Task needs google-drive + notion
  const driveReadme = await fs.readFile('/servers/google-drive/README.md');
  const notionReadme = await fs.readFile('/servers/notion/README.md');
  
  // Based on README, need getDocument and createPage
  const getDoc = await fs.readFile('/servers/google-drive/getDocument.ts');
  const createPage = await fs.readFile('/servers/notion/createPage.ts');
  
  // Use them
  import { getDocument } from './servers/google-drive/getDocument';
  import { createPage as notionCreatePage } from './servers/notion/createPage';
  ```
  
  ## DECISION TREE
  
  When deciding which tools to load, ask:
  1. What ACTION does the task require? (read, write, create, update, delete)
  2. What SYSTEMS are involved? (google-drive, notion, salesforce, etc.)
  3. What SPECIFIC tools match action + system? (get*, create*, update*)
  
  Only load tools that answer YES to all three questions.
```

### Testing Filesystem Discovery

```python
def test_filesystem_discovery():
    # Test 1: Agent discovers servers correctly
    task = "Copy document from Google Drive to Notion"
    
    agent_output = agent.execute(task)
    
    # Verify agent explored filesystem
    assert 'fs.readdir' in agent_output.tool_calls
    assert '/servers' in agent_output.filesystem_reads
    
    # Verify agent read only relevant READMEs
    assert '/servers/google-drive/README.md' in agent_output.files_read
    assert '/servers/notion/README.md' in agent_output.files_read
    assert '/servers/salesforce/README.md' not in agent_output.files_read  # Irrelevant
    
    # Verify agent loaded only needed tools
    assert len(agent_output.tools_loaded) <= 3  # Should be ~2 tools
    assert 'getDocument.ts' in agent_output.tools_loaded
    assert 'createPage.ts' in agent_output.tools_loaded
    
    # Verify did NOT load all tools
    assert len(agent_output.tools_loaded) < 10  # Would be 100+ if loaded all
```

---

## Method B: Semantic Search

### Concept

Tools are indexed with embeddings, allowing agents to search semantically for relevant tools using natural language queries.

### Architecture

```
┌─────────────────────────────────────┐
│  Agent                               │
│  "I need to read a Google Doc"      │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  search_tools(query)                │
│  - Converts query to embedding       │
│  - Searches vector database          │
│  - Returns top-k relevant tools      │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Vector Database (Chroma/Pinecone)  │
│  ┌─────────────────────────────────┐│
│  │ Tool: google-drive.getDocument  ││
│  │ Embedding: [0.23, -0.45, ...]   ││
│  │ Description: "Reads Google Doc" ││
│  └─────────────────────────────────┘│
│  ┌─────────────────────────────────┐│
│  │ Tool: notion.createPage         ││
│  │ Embedding: [0.15, 0.67, ...]    ││
│  │ Description: "Creates Notion..."││
│  └─────────────────────────────────┘│
└─────────────────────────────────────┘
```

### Implementation

#### Step 1: Index Tools

```python
from sentence_transformers import SentenceTransformer
import chromadb

class ToolIndexer:
    def __init__(self):
        self.model = SentenceTransformer('all-MiniLM-L6-v2')
        self.client = chromadb.PersistentClient(path="./tool-index")
        self.collection = self.client.get_or_create_collection("tools")
    
    def index_tool(self, tool_path: str, description: str):
        """Add tool to search index"""
        # Generate embedding
        embedding = self.model.encode(description).tolist()
        
        # Store in vector database
        self.collection.add(
            ids=[tool_path],
            embeddings=[embedding],
            metadatas=[{"path": tool_path}],
            documents=[description]
        )
    
    def index_all_tools(self, servers_dir: str = "/servers"):
        """Index all tools in /servers"""
        for server in os.listdir(servers_dir):
            server_path = f"{servers_dir}/{server}"
            
            for tool_file in os.listdir(server_path):
                if tool_file.endswith('.ts'):
                    tool_path = f"{server_path}/{tool_file}"
                    
                    # Extract description from JSDoc
                    description = self._extract_description(tool_path)
                    
                    # Index
                    self.index_tool(tool_path, description)
    
    def _extract_description(self, tool_path: str) -> str:
        """Extract JSDoc description from tool file"""
        with open(tool_path, 'r') as f:
            content = f.read()
        
        # Parse JSDoc comment
        match = re.search(r'/\*\*\s*(.*?)\s*\*/', content, re.DOTALL)
        if match:
            return match.group(1).strip()
        
        return f"Tool at {tool_path}"
```

#### Step 2: Search Function

```python
class ToolSearcher:
    def __init__(self, model, collection):
        self.model = model
        self.collection = collection
    
    def search_tools(self, query: str, top_k: int = 5) -> list:
        """Search for tools matching query"""
        # Convert query to embedding
        query_embedding = self.model.encode(query).tolist()
        
        # Search vector database
        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=top_k
        )
        
        # Return tool paths
        return [
            {
                "path": meta["path"],
                "description": doc,
                "relevance": 1 - dist  # Convert distance to relevance
            }
            for meta, doc, dist in zip(
                results["metadatas"][0],
                results["documents"][0],
                results["distances"][0]
            )
        ]
```

#### Step 3: Agent Integration

```typescript
// Add search_tools function to agent capabilities

/**
 * Search for relevant tools based on natural language query
 * 
 * @param {string} query - Natural language description of what you need
 * @param {number} topK - Number of results to return (default: 5)
 * @returns {Array} List of relevant tools with paths and descriptions
 * 
 * @example
 * const tools = await search_tools("read a Google Drive document");
 * // Returns: [
 * //   { path: "/servers/google-drive/getDocument.ts", description: "...", relevance: 0.95 },
 * //   { path: "/servers/google-drive/readFile.ts", description: "...", relevance: 0.87 }
 * // ]
 */
async function search_tools(query: string, topK: number = 5): Promise<Array<any>> {
    // Implemented by platform, calls Python ToolSearcher
}
```

### Agent Prompting for Semantic Search

```yaml
system_prompt: |
  You have access to 1000+ tools across many systems.
  Use the `search_tools` function to find relevant tools.
  
  ## WORKFLOW
  
  1. UNDERSTAND THE TASK
     Example: "Copy a Google Drive document to Notion"
  
  2. SEARCH FOR TOOLS
     Break down into sub-actions and search:
     
     ```typescript
     // Sub-action 1: Read from Google Drive
     const readTools = await search_tools("read Google Drive document", 3);
     console.log('Read tools:', readTools);
     // Returns: [
     //   { path: "/servers/google-drive/getDocument.ts", relevance: 0.94 },
     //   { path: "/servers/google-drive/readFile.ts", relevance: 0.89 }
     // ]
     
     // Sub-action 2: Write to Notion
     const writeTools = await search_tools("create Notion page", 3);
     console.log('Write tools:', writeTools);
     // Returns: [
     //   { path: "/servers/notion/createPage.ts", relevance: 0.96 },
     //   { path: "/servers/notion/addBlock.ts", relevance: 0.82 }
     // ]
     ```
  
  3. SELECT BEST TOOLS
     Pick the highest relevance tool for each action:
     ```typescript
     const readTool = readTools[0].path;  // /servers/google-drive/getDocument.ts
     const writeTool = writeTools[0].path; // /servers/notion/createPage.ts
     ```
  
  4. LOAD SELECTED TOOLS
     ```typescript
     const readToolCode = await fs.readFile(readTool, 'utf-8');
     const writeToolCode = await fs.readFile(writeTool, 'utf-8');
     ```
  
  5. IMPORT AND USE
     ```typescript
     import { getDocument } from './servers/google-drive/getDocument';
     import { createPage } from './servers/notion/createPage';
     
     const content = await getDocument(docId);
     await createPage(dbId, content);
     ```
  
  ## SEARCH QUERY TIPS
  
  ✅ Good queries (specific, action-oriented):
  - "read a Salesforce contact record"
  - "send a message to Slack channel"
  - "create a new Notion page"
  - "update a Google Sheet cell"
  
  ❌ Bad queries (too vague):
  - "salesforce"  // What action?
  - "work with documents"  // Which system?
  - "data"  // Too broad
  
  ## WHEN TO USE
  
  Use semantic search when:
  - You have 100+ tools
  - Tool names aren't obvious
  - Multiple systems provide similar functionality
  - Natural language queries are easier than filesystem navigation
  
  Use filesystem navigation when:
  - You have <50 tools
  - Folder structure is clear and logical
  - Tool names are self-explanatory
```

### Testing Semantic Search

```python
def test_semantic_search():
    # Index tools first
    indexer = ToolIndexer()
    indexer.index_all_tools()
    
    # Test search
    searcher = ToolSearcher(indexer.model, indexer.collection)
    
    # Query 1: Find Google Drive read tools
    results = searcher.search_tools("read a Google Doc", top_k=3)
    assert len(results) > 0
    assert "google-drive" in results[0]["path"]
    assert "get" in results[0]["path"].lower() or "read" in results[0]["path"].lower()
    
    # Query 2: Find Notion write tools
    results = searcher.search_tools("create a page in Notion", top_k=3)
    assert len(results) > 0
    assert "notion" in results[0]["path"]
    assert "create" in results[0]["path"].lower() or "add" in results[0]["path"].lower()
    
    # Query 3: Verify relevance ranking
    results = searcher.search_tools("delete a file", top_k=5)
    # Most relevant result should be delete-related
    assert "delete" in results[0]["path"].lower() or "remove" in results[0]["path"].lower()
```

---

## Hybrid Approach

For best results, combine both methods:

```typescript
/**
 * Hybrid tool discovery combining filesystem and semantic search
 */

async function discoverTools(task: string): Promise<string[]> {
    // Step 1: High-level semantic search for relevant SERVERS
    const serverQuery = extractServerNames(task);
    // "Copy Drive doc to Notion" → ["google-drive", "notion"]
    
    // Step 2: For each server, use filesystem navigation
    const toolPaths = [];
    
    for (const server of serverQuery) {
        // Read server README
        const readme = await fs.readFile(`/servers/${server}/README.md`);
        
        // List available tools
        const tools = await fs.readdir(`/servers/${server}`);
        
        // Step 3: Semantic search within server for specific tool
        const action = extractAction(task);  // "copy" → "read" + "write"
        const relevantTools = await search_tools(
            `${action} using ${server}`,
            3
        );
        
        // Pick best match
        toolPaths.push(relevantTools[0].path);
    }
    
    return toolPaths;
}
```

### When to Use Each Method

| Scenario | Method | Reason |
|----------|--------|--------|
| < 50 tools | Filesystem | Simple, no indexing needed |
| 50-200 tools | Filesystem or Semantic | Either works |
| 200+ tools | **Semantic** | Faster, scales better |
| Clear folder structure | Filesystem | Intuitive navigation |
| Complex, nested tools | **Semantic** | Search cuts through complexity |
| Known tool names | Filesystem | Direct access |
| Unknown tool landscape | **Semantic** | Discovery through search |
| Real-time indexing needed | Filesystem | No pre-processing |
| Static tool catalog | Semantic | One-time indexing |

---

## Implementation Guide

### Getting Started: Filesystem Method

**Week 1: Set Up Structure**

```bash
# Create server directories
mkdir -p /servers/google-drive
mkdir -p /servers/notion
mkdir -p /servers/salesforce

# Add READMEs
echo "# Google Drive MCP Server\n\nProvides access to Google Drive..." > /servers/google-drive/README.md

# Add tools
# (convert MCP servers to .ts files as per filesystem structure guide)
```

**Week 2: Update Agent Prompts**

Add filesystem discovery instructions to agent system prompt (see examples above).

**Week 3: Test and Iterate**

Run test cases, monitor token consumption, refine prompts based on agent behavior.

### Getting Started: Semantic Search Method

**Week 1: Set Up Infrastructure**

```bash
# Install dependencies
pip install sentence-transformers chromadb

# Create indexer
python create_tool_index.py
```

**Week 2: Index All Tools**

```python
# index_tools.py
from tool_indexer import ToolIndexer

indexer = ToolIndexer()
indexer.index_all_tools('/servers')

print(f"Indexed {indexer.collection.count()} tools")
```

**Week 3: Integrate with Agent**

Expose `search_tools` function to agent and update prompts.

**Week 4: Test and Optimize**

Monitor search quality, adjust embeddings model if needed, fine-tune top-k parameter.

---

## Performance Optimization

### Caching

```python
class CachedToolSearcher:
    def __init__(self, searcher: ToolSearcher):
        self.searcher = searcher
        self.cache = {}
    
    def search_tools(self, query: str, top_k: int = 5) -> list:
        cache_key = f"{query}:{top_k}"
        
        if cache_key in self.cache:
            return self.cache[cache_key]
        
        results = self.searcher.search_tools(query, top_k)
        self.cache[cache_key] = results
        
        return results
```

### Lazy Loading

```typescript
// Don't read all tool files at once
// ❌ Bad
const tools = await search_tools("google drive");
for (const tool of tools) {
    await fs.readFile(tool.path);  // Loads all at once
}

// ✅ Good  
const tools = await search_tools("google drive");
const bestTool = tools[0];  // Pick best match first
await fs.readFile(bestTool.path);  // Load only this one
```

### Incremental Discovery

```typescript
// Discover tools progressively as needed
async function progressiveDiscovery(task: string) {
    // Start with high-level search
    const initialTools = await search_tools(task, 3);
    
    // Try first tool
    const tool1 = await loadAndUse(initialTools[0]);
    if (tool1.success) return tool1.result;
    
    // If failed, try second
    const tool2 = await loadAndUse(initialTools[1]);
    if (tool2.success) return tool2.result;
    
    // If still failed, expand search
    const moreTools = await search_tools(task, 10);
    // ...
}
```

---

## Metrics to Track

Monitor these to ensure progressive discovery is working:

```python
progressive_discovery_metrics = {
    "tools_searched": "count of search_tools calls",
    "tools_loaded": "count of files actually read",
    "search_hit_rate": "relevant tool in top 3 results",
    "discovery_time": "time to find right tool",
    "token_efficiency": "tokens used for discovery vs loading all"
}

# Good targets:
# - tools_loaded << tools_available (load <5% of tools)
# - search_hit_rate > 80% (find right tool 80% of time)
# - discovery_time < 5 seconds
# - token_efficiency > 90% (90% savings vs loading all)
```

---

## Troubleshooting

### Problem: Agent loads too many tools

**Symptom**: Token consumption higher than expected, agent reads many files.

**Solution**:
```yaml
# Add to prompts:
"RULE: Load maximum 3 tools per task.
If you need more than 3 tools, you're over-thinking it.
Most tasks need 1-2 tools only."
```

### Problem: Agent can't find right tools

**Symptom**: Search returns irrelevant results, agent gives up.

**Solution**:
- Improve tool descriptions (more keywords)
- Use better embedding model (e.g., `all-mpnet-base-v2`)
- Increase top-k parameter (try 10 instead of 5)

### Problem: Discovery is slow

**Symptom**: Progressive discovery takes >10 seconds.

**Solution**:
- Cache search results
- Pre-filter by server name (filesystem method)
- Use faster vector database (Pinecone instead of Chroma)

---

## Conclusion

Progressive Discovery is essential for scaling MCP Code Execution to hundreds or thousands of tools. Two methods are available:

1. **Filesystem Navigation** - Simple, intuitive, works well for <200 tools
2. **Semantic Search** - Advanced, scales to 1000+ tools, requires indexing

**Recommendation**: Start with filesystem navigation. When you exceed 200 tools or have complex tool landscape, migrate to semantic search.

**Key Principle**: Only load what you need, when you need it. This is what enables 98% token reduction at scale.

🔍 **Happy discovering!**
