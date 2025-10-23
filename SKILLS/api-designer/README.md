# API Designer - Quick Start

**Version:** 1.0.0
**Category:** Technical Development
**Difficulty:** Intermediate

## What This Skill Does

Guides design of RESTful and GraphQL APIs with best practices for naming, versioning, authentication, error handling, and documentation.

## When to Use

Use this skill when you need to:
- Design a new backend API
- Define API contracts and specifications
- Choose between REST and GraphQL
- Implement authentication and authorization
- Version an existing API
- Document API endpoints

## Quick Start

**Fastest path to a well-designed API:**

1. **Choose API style** (REST vs GraphQL)
   - REST: Simple CRUD, public API, caching critical
   - GraphQL: Flexible queries, complex nested data, rapid frontend iteration

2. **Design resources (REST)** or **schema (GraphQL)**
   - REST: Nouns, plural, hierarchical (`/users/123/posts`)
   - GraphQL: Types, queries, mutations with input/payload pattern

3. **Define authentication**
   - JWT Bearer: SPAs and mobile apps
   - API Keys: Service-to-service
   - OAuth 2.0: Third-party integrations

4. **Implement core patterns**
   - Pagination: Cursor-based for scale
   - Filtering: Query parameters
   - Error handling: Structured error responses
   - Versioning: URL versioning (`/v1/users`)

5. **Document with OpenAPI/Swagger** (REST) or **GraphQL schema**
   - Include examples, error codes, auth guide
   - Provide interactive playground

6. **Add security & rate limiting**
   - HTTPS only
   - Input validation
   - Rate limits (1000 req/hour typical)

**Time to first endpoint:** 1-2 days for simple API, 1 week for comprehensive

## File Structure

```
api-designer/
├── SKILL.md           # Main skill instructions (start here)
└── README.md          # This file
```

## Prerequisites

**Knowledge:**
- HTTP protocol basics (methods, status codes, headers)
- JSON and data structures
- Basic security concepts (auth, tokens)

**Tools:**
- API development framework (Express, FastAPI, Next.js API routes)
- API documentation tool (Swagger UI, GraphQL Playground)
- API testing tool (Postman, Insomnia, curl)

**Related Skills:**
- None required, but `frontend-builder` helps for API consumption context

## Success Criteria

You've successfully used this skill when:
- ✅ API follows REST conventions or GraphQL best practices
- ✅ All endpoints use proper HTTP methods and status codes
- ✅ Authentication and authorization implemented
- ✅ Pagination and filtering available for lists
- ✅ Error responses include helpful messages and field details
- ✅ API versioning strategy defined
- ✅ Rate limiting configured
- ✅ Complete API documentation published (OpenAPI or GraphQL schema)
- ✅ Security checklist completed

## Common Workflows

### Workflow 1: New REST API
1. Use api-designer to design resource structure
2. Define HTTP methods and status codes
3. Implement pagination and filtering
4. Add authentication (JWT Bearer)
5. Document with OpenAPI/Swagger
6. Use `deployment-advisor` for hosting

### Workflow 2: New GraphQL API
1. Use api-designer to design schema (types, queries, mutations)
2. Implement Relay connection pattern for pagination
3. Use input/payload pattern for mutations
4. Add authentication resolver
5. Publish GraphQL Playground
6. Use `deployment-advisor` for hosting

### Workflow 3: API Versioning
1. Use api-designer versioning strategy (URL-based)
2. Identify breaking changes
3. Create `/v2` endpoints
4. Support v1 and v2 simultaneously
5. Announce v1 deprecation (6-12 months ahead)
6. Provide migration guide

## Key Concepts

**REST Principles:**
- **Resources**: Nouns (users, posts), not verbs
- **HTTP Methods**: GET, POST, PUT, PATCH, DELETE
- **Status Codes**: 2xx success, 4xx client error, 5xx server error
- **Idempotency**: PUT, PATCH, DELETE should be idempotent

**GraphQL Patterns:**
- **Schema-first**: Define types, queries, mutations
- **Relay Connections**: Cursor-based pagination standard
- **Input Types**: For mutations (encapsulate arguments)
- **Payload Types**: Include data and errors

**Authentication:**
- **JWT**: Stateless, includes claims, works across domains
- **API Keys**: Simple, per-service, easy to rotate
- **OAuth 2.0**: Delegated auth, scoped permissions

**Pagination:**
- **Cursor-based**: Efficient, consistent, scales well (recommended)
- **Offset-based**: Simple, can jump to page, inefficient at scale

**Versioning:**
- **URL**: `/v1/users`, `/v2/users` (recommended)
- **Header**: `API-Version: 2` or `Accept: vnd.myapp.v2+json`

## Troubleshooting

**Skill not activating?**
- Try explicitly requesting: "Use the api-designer skill to..."
- Mention keywords: "API", "REST", "GraphQL", "endpoints", "authentication"

**Choosing between REST and GraphQL?**
- REST: Simple CRUD, public APIs, caching important, team familiarity
- GraphQL: Flexible queries, complex relationships, reducing over-fetching
- Can use both: REST for simple endpoints, GraphQL for complex queries

**Status code confusion?**
- 200: Success for GET, PUT, PATCH, DELETE
- 201: Success for POST (resource created)
- 204: Success with no response body (often DELETE)
- 400: Client error (validation, malformed request)
- 401: Authentication required or failed
- 403: Authenticated but no permission
- 404: Resource not found
- 422: Validation error (semantic)
- 429: Rate limit exceeded
- 500: Server error

**Pagination strategy?**
- Use cursor-based for large datasets, real-time data, performance
- Use offset-based for small datasets, admin interfaces, simplicity
- Cursor-based is generally recommended for production APIs

**Authentication method?**
- JWT Bearer: Web/mobile apps (SPAs, React Native)
- API Keys: Server-to-server, internal services
- OAuth 2.0: Third-party integrations, delegated access
- Never use Basic Auth except for internal admin tools with HTTPS

**Versioning too complex?**
- Start with `/v1/` from day one
- Only increment for breaking changes (not additions)
- Support N and N-1 versions (two versions)
- Announce deprecation 6-12 months ahead
- Provide clear migration guides

**Error messages unclear?**
- Include error code for programmatic handling
- Provide human-readable message
- List field-level errors for validation
- Include `request_id` for debugging
- Link to documentation for error codes

## Version History

- **1.0.0** (2025-10-21): Initial release, enhanced from api-designer skill with GraphQL and comprehensive REST guidance

## License

Part of ai-dev-standards repository.
