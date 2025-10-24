# Documentation Generator MCP Server

Generate documentation from code, create diagrams, and build changelogs automatically.

## What This MCP Does

- 📝 **API Documentation** - Generate docs from JSDoc/TypeDoc comments
- 📊 **Diagram Generation** - Create Mermaid diagrams from code structure
- 📜 **Changelog Generation** - Build changelogs from git commits
- 🔍 **Code Analysis** - Extract documentation from source code
- 📚 **Multi-Format Export** - Markdown, HTML, JSON outputs
- 🎯 **Smart Templates** - Pre-built templates for common doc types

## Installation

```bash
cd MCP-SERVERS/doc-generator-mcp
npm install && npm run build
```

## Tools

### 1. configure
```typescript
{
  projectPath: string;
  docFormat?: 'markdown' | 'html' | 'json';
  includePrivate?: boolean;
}
```

### 2. generate_api_docs
Generate API documentation from code comments.
```typescript
{
  paths: string[];  // files or directories
  outputPath?: string;
  format?: 'jsdoc' | 'typedoc';
}
```

### 3. generate_diagram
Create diagrams from code structure.
```typescript
{
  type: 'architecture' | 'class' | 'sequence' | 'erd';
  sourcePath: string;
  outputPath?: string;
}
```

### 4. generate_changelog
Build changelog from git commits.
```typescript
{
  fromTag?: string;
  toTag?: string;
  format?: 'keepachangelog' | 'conventional';
  outputPath?: string;
}
```

### 5. extract_readme_sections
Extract sections from README for reuse.
```typescript
{
  readmePath: string;
  sections: string[];  // e.g., ['Installation', 'Usage']
}
```

### 6. validate_docs
Check documentation completeness.
```typescript
{
  paths: string[];
  rules?: string[];  // e.g., ['require-descriptions', 'require-examples']
}
```

## Usage Example

```javascript
await docGen.configure({ projectPath: './my-app' });

// Generate API docs
await docGen.generate_api_docs({
  paths: ['src/api'],
  outputPath: './docs/api.md'
});

// Create architecture diagram
await docGen.generate_diagram({
  type: 'architecture',
  sourcePath: 'src',
  outputPath: './docs/architecture.md'
});

// Build changelog
await docGen.generate_changelog({
  fromTag: 'v1.0.0',
  format: 'keepachangelog'
});
```

## Diagram Types

- **Architecture** - High-level system overview
- **Class** - Class relationships and hierarchies
- **Sequence** - Function call flows
- **ERD** - Database schema relationships

## Changelog Formats

- **Keep a Changelog** - Human-readable format
- **Conventional Commits** - Semantic versioning compatible

## Related

- **Enables:** technical-writer skill
- **Use case:** Documentation automation, API docs, architecture diagrams
