# Technical Writer - Quick Start

**Version:** 1.0.0
**Category:** Documentation
**Difficulty:** Beginner

## What This Skill Does

Helps you create clear, comprehensive technical documentation including API docs, user guides, tutorials, and reference documentation.

## When to Use

Use this skill when you need to:
- Document APIs (REST, GraphQL)
- Write user guides and tutorials
- Create getting started guides
- Document components and libraries
- Set up documentation sites
- Write technical blog posts
- Create architecture documentation

## Quick Start

**Fastest path to good docs:**

1. **Choose doc type:**
   - API: Use OpenAPI/Swagger
   - User guide: Step-by-step with screenshots
   - Tutorial: Learning by doing
   - Reference: Quick lookup tables

2. **Use a template:**
   - API: OpenAPI spec
   - Guide: Getting Started template
   - Tutorial: Build X in Y minutes

3. **Include examples:**
   - Code samples
   - Request/response examples
   - Screenshots
   - Common errors

4. **Set up doc site:**
   - Docusaurus (recommended)
   - GitBook, MkDocs, or Mintlify

**Time to create:** 2-4 hours for basic API docs

## Success Criteria

You've successfully used this skill when:
- ✅ New users can get started without support
- ✅ API endpoints are fully documented with examples
- ✅ Common questions answered in docs
- ✅ Error messages explained with solutions
- ✅ Code examples are tested and work
- ✅ Docs are searchable and well-organized
- ✅ Support tickets decrease

## Key Concepts

**Documentation Types:**
1. **API Docs** - For developers integrating your API
2. **User Guides** - For end users accomplishing tasks
3. **Tutorials** - For learners building understanding
4. **Reference** - For quick parameter/method lookup
5. **Architecture** - For engineers understanding system design

**Good Documentation:**
- Answers questions before they're asked
- Gets users to success quickly
- Uses active voice and clear language
- Includes working code examples
- Shows errors and solutions
- Is kept up to date

## Quick Reference

### API Documentation Structure
```markdown
# API Name

## Authentication
(How to authenticate)

## Base URL
https://api.example.com/v1

## Endpoints

### GET /users
(Description, parameters, examples)

### POST /users
(Description, request body, examples)

## Errors
(Error codes and meanings)

## Rate Limits
(Rate limit info)

## SDKs
(Client libraries)
```

### User Guide Structure
```markdown
# Getting Started

## What You'll Learn
(Set expectations)

## Prerequisites
(What they need)

## Step 1: Setup
(First step with screenshot)

## Step 2: Configure
(Second step)

## Next Steps
(Where to go next)

## Troubleshooting
(Common issues)
```

### Tutorial Structure
```markdown
# Build X with Y

## What You'll Build
(Show final result)

## Prerequisites
(Required knowledge)

## Step 1: Setup
(Code + explanation)

## Step 2: Feature A
(Code + what it does)

## What You Learned
(Recap)

## Next Steps
(Advanced topics)
```

## Tools

**Documentation Sites:**
- Docusaurus (React-based, recommended)
- GitBook (Beautiful, easy)
- MkDocs (Python, simple)
- Mintlify (AI-powered)

**API Documentation:**
- Swagger/OpenAPI
- Postman
- ReadMe.io
- Stoplight

**Diagrams:**
- Mermaid (text-based)
- Excalidraw (hand-drawn style)
- Lucidchart

## Common Commands

```bash
# Create Docusaurus site
npx create-docusaurus@latest my-docs classic

# Start dev server
npm start

# Build for production
npm run build

# Generate OpenAPI docs
npx swagger-jsdoc -d swaggerDef.js routes/*.js -o openapi.json
```

## Version History

- **1.0.0** (2025-10-22): Initial release

## License

Part of ai-dev-standards repository.
