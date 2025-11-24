# How to Complete Archon MCP Sync

**Status**: ✅ Archon MCP Connected at `http://localhost:8051/mcp`
**Date**: 2025-10-25
**Ready to sync**: All documents prepared in `ARCHON-SYNC-MANIFEST.md`

---

## Option 1: Use Claude Desktop (Recommended)

Since Archon MCP is now configured, you can use **Claude Desktop** to complete the sync:

### Steps:

1. **Open Claude Desktop** (not Claude Code CLI)

2. **Start a new conversation** in the ai-dev-standards project folder

3. **Verify Archon is connected:**

   ```
   "Can you check if Archon MCP tools are available?"
   ```

   You should see tools like:
   - `archon:add_documents`
   - `archon:perform_rag_query`
   - `archon:manage_task`
   - `archon:search_code_examples`

4. **Sync the registries (Priority 1):**

   ```
   "Use Archon MCP to add these documents to the ai-dev-standards project:
   - META/skill-registry.json
   - META/mcp-registry.json
   - META/relationship-mapping.json
   - META/tool-registry.json
   - META/component-registry.json
   - META/integration-registry.json

   Read each file and use archon:add_documents to sync them."
   ```

5. **Sync strategic documents (Priority 2):**

   ```
   "Now sync these strategic documents to Archon:
   - META/REPOSITORY-BRAIN.md
   - META/PROJECT-CONTEXT.md
   - DOCS/ARCHON-INTEGRATION.md
   - ARCHON-PROJECT.json
   - META/SESSION-2025-10-25-SI-SYSTEMS-BRAIN-RESEARCH.md"
   ```

6. **Verify the sync worked:**
   ```
   "Use archon:perform_rag_query to test:
   Query: 'How many skills and MCPs are in ai-dev-standards?'
   Expected: '39 skills, 36 MCPs, 107 total resources'"
   ```

---

## Option 2: Use Archon Web Interface

If Archon has a web UI:

1. Open browser to: `http://localhost:8051` (or your Archon URL)
2. Navigate to project: `ai-dev-standards`
3. Find "Knowledge Base" or "Documents" section
4. Upload files listed in `META/ARCHON-SYNC-MANIFEST.md` Priority 1-2
5. Verify with RAG queries

---

## Option 3: Use Cursor with Archon MCP

If you're using Cursor IDE:

1. Open Cursor in the ai-dev-standards directory
2. Archon MCP should be auto-detected
3. Use Cursor's AI chat to sync documents
4. Cursor has direct access to MCP tools

---

## Verification Tests

After syncing, run these queries in **Claude Desktop or Cursor** (not CLI):

### Test 1: Resource Counts

```
"Using Archon, query: How many skills, MCPs, and total resources?"
Expected: 39 skills, 36 MCPs, 107 resources
```

### Test 2: Brain Architecture

```
"Using Archon, query: What are the four layers of the Repository Brain?"
Expected: Knowledge, Enforcement, Decision, Management
```

### Test 3: Relationships

```
"Using Archon, query: Which MCPs support the rag-implementer skill?"
Expected: vector-database-mcp, embedding-generator-mcp, semantic-search-mcp
```

### Test 4: Integration Pattern

```
"Using Archon, query: How do Archon and Skills work together?"
Expected: Archon (WHAT/WHEN) + Skills (HOW) two-layer architecture
```

### Test 5: Latest Context

```
"Using Archon, query: What is the plan for analyzing si-systems-v5?"
Expected: Details from SESSION-2025-10-25-SI-SYSTEMS-BRAIN-RESEARCH.md
```

---

## Why Claude Code CLI Can't Sync Directly

**Claude Code (CLI)** runs in a terminal environment and doesn't have direct access to MCP protocol tools. However:

- ✅ MCP configuration is complete
- ✅ All documents are prepared
- ✅ Sync manifest is ready
- ✅ You can use Claude Desktop, Cursor, or Archon Web UI to complete sync

---

## What Gets Synced

See `META/ARCHON-SYNC-MANIFEST.md` for complete list. Summary:

**Priority 1 (Essential):**

- 6 registry JSON files (single source of truth)

**Priority 2 (Strategic):**

- Repository Brain architecture
- Project context and roadmap
- Archon integration guide
- Latest session context

**Priority 3 (High Value):**

- All 39 SKILLS/\*/SKILL.md files
- Key skill documentation

**Priority 4 (Reference):**

- Architecture patterns
- Best practices
- Standards

**Priority 5 (Optional):**

- Code examples
- Components
- Integrations

---

## After Sync is Complete

Once verified, Archon will be able to:

1. **Answer Questions**: "What skills handle API design?"
2. **Suggest Resources**: "Which MCPs do I need for RAG?"
3. **Track Progress**: "What's the status of Phase 2?"
4. **Find Examples**: "Show me Supabase integration code"
5. **Strategic Planning**: "What should I work on next?"

---

## Next Steps

1. Open **Claude Desktop** (recommended)
2. Follow Option 1 steps above
3. Run verification tests
4. Come back to Claude Code CLI for development work

---

**Note**: The MCP connection is configured and ready. You just need to use a client that supports MCP tool invocation (Claude Desktop, Cursor, or Archon Web UI).
