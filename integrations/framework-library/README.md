# Framework Library Integrations

The framework library provides two MCP servers that expose the curated AI framework catalog to assistants and automation tools:

- `framework-content` – read-only access to the raw markdown frameworks
- `framework-orchestrator` – higher level analysis, selection, and project bootstrapping helpers

Both packages target Node.js 18+ and the shared `@modelcontextprotocol/sdk@^1.20.2` used across the repository.

## framework-content MCP

| Capability     | Description                                                                        |
| -------------- | ---------------------------------------------------------------------------------- |
| List resources | Enumerates every framework as a virtual `framework:///category/id` resource.       |
| Read resources | Returns the markdown contents for a selected framework or the complete JSON index. |
| Tools          | `search_frameworks`, `get_framework_metadata` for keyword discovery.               |

Configuration:

- `FRAMEWORK_ROOT` (optional) – path to the root directory that contains `00 - AI Operational Security Frameworks/` and `01 - AI Agent, APP & Workflow Frameworks/`. Defaults to the repository root.

## framework-orchestrator MCP

| Capability                   | Description                                                            |
| ---------------------------- | ---------------------------------------------------------------------- |
| `analyze_project`            | Classifies a project into patterns A/B/C using requirement heuristics. |
| `select_frameworks`          | Suggests an ordered framework sequence for a pattern.                  |
| `generate_manifest`          | Builds a JSON manifest describing the chosen frameworks and stack.     |
| `generate_project_structure` | Outputs a suggested folder layout for bootstrapping.                   |
| `get_decision_matrix`        | Produces a weighted technology matrix based on constraints.            |

This MCP does not require additional configuration—behaviour is fully driven by request payloads.

## Development

```bash
cd integrations/framework-library/framework-content
npm install
npm run build

cd ../framework-orchestrator
npm install
npm run build
```

Both packages ship compiled JavaScript in `build/` for CLI environments. Update the TypeScript sources in `src/` and rebuild to refresh the distributables.
