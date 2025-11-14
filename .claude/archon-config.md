# Archon MCP Project Configuration

## ⚠️ CRITICAL: Project Scope

**THIS REPOSITORY USES ONLY ONE ARCHON PROJECT:**

- **Project Name:** AI-Dev-Standards
- **Project ID:** `81cd7f96-b5c8-4be9-9107-9e2736984636`
- **Repository:** ai-dev-standards
- **GitHub:** https://github.com/daffy0208/ai-dev-standards

## 🚨 IMPORTANT RULES

1. **ALWAYS** use the specific `project_id` in Archon queries
2. **NEVER** use broad queries without `project_id`
3. **NEVER** query for other projects (SI Systems, ReactionX, etc.)
4. **ONLY** work with ai-dev-standards project data

## ✅ Correct Query Patterns

### Get AI-Dev-Standards Project
```typescript
mcp__archon__find_projects({
  project_id: "81cd7f96-b5c8-4be9-9107-9e2736984636"
})
```

### Get AI-Dev-Standards Tasks
```typescript
mcp__archon__find_tasks({
  project_id: "81cd7f96-b5c8-4be9-9107-9e2736984636",
  per_page: 10
})
```

### Create Task in AI-Dev-Standards
```typescript
mcp__archon__manage_task({
  action: "create",
  project_id: "81cd7f96-b5c8-4be9-9107-9e2736984636",
  title: "...",
  description: "..."
})
```

### Update AI-Dev-Standards Project
```typescript
mcp__archon__manage_project({
  action: "update",
  project_id: "81cd7f96-b5c8-4be9-9107-9e2736986636",
  description: "..."
})
```

## ❌ INCORRECT Patterns (NEVER USE)

### ❌ Broad Project Queries
```typescript
// WRONG - Returns ALL projects including SI Systems, ReactionX, etc.
mcp__archon__find_projects({ query: "ai-dev-standards" })
mcp__archon__find_projects({ per_page: 50 })
```

### ❌ Queries Without project_id
```typescript
// WRONG - Could query any project
mcp__archon__find_tasks({ query: "something" })
```

### ❌ Querying Other Projects
```typescript
// WRONG - This is SI Systems, not ai-dev-standards
mcp__archon__find_projects({ project_id: "d1376a0f-5584-4570-ac1b-0f981ecd3629" })
```

## Project ID Reference

**AI-Dev-Standards ONLY:**
- ID: `81cd7f96-b5c8-4be9-9107-9e2736984636`
- Status: Active
- Phase: 4 (Repository Audit & Remediation - In Progress)
- Current Version: 1.7.0
- Resources: 64 skills, 50 MCPs, 238 core resources (360 total)

**Other Projects (DO NOT QUERY):**
- SI Systems: `d1376a0f-5584-4570-ac1b-0f981ecd3629` ❌ IGNORE
- Young Angler's Companion: `7927a3f5-9ced-49bc-8ea3-75324822bea1` ❌ IGNORE
- ReactionX: `8118f6d6-535c-4475-98d2-d1704b869519` ❌ IGNORE
- Empire Performance: `48214912-263d-4fa2-848c-77332ba678e5` ❌ IGNORE
- NaaS Calculator: `243b16d2-7dba-483e-9faa-4eab2764e9bd` ❌ IGNORE

## Response Size Optimization

**Always use these limits:**
- `per_page: 10` (default, maximum)
- `per_page: 5` (preferred for lists)
- Filter by `status` when possible
- Use specific `task_id` when known

**Expected Response Sizes:**
- Get project: ~1-2k tokens ✅
- List tasks (per_page=10): ~2-3k tokens ✅
- Get specific task: ~0.5k tokens ✅

**Avoid:**
- `per_page: 50` ❌ (causes 16.8k token responses)
- Queries without `project_id` ❌ (returns all 8 projects)
- Broad searches ❌ (returns unrelated data)

## Why This Matters

Archon MCP is a **centralized system** tracking ALL projects across all repositories. Without explicit `project_id` filtering:
- ✗ Returns data from 8+ different projects
- ✗ Includes SI Systems (13 large documents = 13k tokens)
- ✗ Causes 16.8k token responses
- ✗ Fills context with irrelevant information
- ✗ Creates confusion about project scope

## Validation

Before any Archon query, verify:
1. ✅ Using `project_id: "81cd7f96-b5c8-4be9-9107-9e2736984636"`
2. ✅ `per_page` ≤ 10
3. ✅ No queries to other project IDs
4. ✅ Response size < 5k tokens

## Emergency Fix

If you accidentally query other projects:
1. Stop immediately
2. Use correct project_id
3. Clear context of irrelevant data
4. Re-run query with proper filters
