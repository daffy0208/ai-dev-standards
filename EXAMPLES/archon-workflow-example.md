# Archon Workflow Example: Adding User Authentication

This example shows the complete Archon + Skills workflow for a real task.

## Task from Archon

```json
{
  "id": "P0-3",
  "title": "Implement User Authentication",
  "priority": "P0",
  "status": "todo",
  "skills_to_use": ["security-engineer", "frontend-builder", "api-designer"]
}
```

## Phase 1: Strategic Planning (Archon) - 10 min

### Step 1: Get Task Details
```
archon:manage_task({ action: "get", task_id: "P0-3" })
```

**Result:**
- Task: Implement JWT-based authentication
- Requirements: Login, signup, password reset
- Integration: Existing Next.js app

### Step 2: Research Domain
```
archon:perform_rag_query({
  query: "JWT authentication Next.js best practices",
  match_count: 5
})
```

**Key Insights:**
- Use httpOnly cookies for tokens
- Implement refresh token rotation
- Add CSRF protection

### Step 3: Find Code Examples
```
archon:search_code_examples({
  query: "auth middleware Next.js TypeScript",
  match_count: 3
})
```

**Found:** Existing auth patterns in codebase

### Step 4: Mark as Doing
```
archon:manage_task({
  action: "update",
  task_id: "P0-3",
  update_fields: { status: "doing" }
})
```

---

## Phase 2: Tactical Execution (Skills) - 4 hours

### Skills Invoked:
1. **security-engineer** - Authentication security patterns
2. **api-designer** - API endpoint design
3. **frontend-builder** - Auth UI components

### Implementation Guidance Combined:

**From security-engineer:**
- JWT with short expiration (15 min)
- Refresh tokens (7 days)
- httpOnly + secure + sameSite cookies
- Password hashing with bcrypt (12 rounds)
- Rate limiting on auth endpoints

**From api-designer:**
- POST /api/auth/signup
- POST /api/auth/login
- POST /api/auth/refresh
- POST /api/auth/logout
- GET /api/auth/me

**From frontend-builder:**
- Use React Context for auth state
- Protected route component
- Login/signup forms with validation
- Error handling and loading states

### Implementation:
Built auth system following all three skill guidelines + Archon code examples.

---

## Phase 3: Quality Validation - 30 min

### Quality Checks:

**testing-strategist:**
- Unit tests for auth functions
- Integration tests for API endpoints
- E2E tests for login flow

**security-engineer (review):**
- No secrets in code ✅
- HTTPS only ✅
- Input validation ✅
- SQL injection prevention ✅
- XSS protection ✅

**All checks passed!**

---

## Phase 4: Review & Complete - 5 min

### Mark for Review
```
archon:manage_task({
  action: "update",
  task_id: "P0-3",
  update_fields: { status: "review" }
})
```

### User Tests & Approves

### Mark Done
```
archon:manage_task({
  action: "update",
  task_id: "P0-3",
  update_fields: { status: "done" }
})
```

### Get Next Task
```
archon:manage_task({
  action: "list",
  filter_by: "status",
  filter_value: "todo"
})
```

---

## Summary

**Total Time:** 4 hours 45 minutes
- Planning: 10 min
- Implementation: 4 hours
- Quality: 30 min
- Review: 5 min

**Quality:** High
- Combined Archon context + 3 Skills expertise
- All security checks passed
- Complete test coverage

**Tracking:** Complete
- All status updates in Archon
- Full audit trail of decisions

**Key Takeaway:** Archon provided project context and existing patterns. Skills provided security expertise, API design patterns, and frontend guidance. Together = secure, well-designed implementation.
