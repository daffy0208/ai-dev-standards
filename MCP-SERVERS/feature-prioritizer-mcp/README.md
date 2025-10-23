# Feature Prioritizer MCP Server

MCP server for feature prioritization using P0/P1/P2 framework and RICE scoring.

## Installation

```bash
npm install
npm run build
```

## Usage

### Add Features

```typescript
{
  "id": "feat-1",
  "name": "User Authentication",
  "description": "Add login system",
  "impact": 9,      // 1-10 scale
  "effort": 3,      // 1-10 scale (1=easy, 10=hard)
  "reach": 1000,    // Users affected (for RICE)
  "confidence": 90  // 0-100% (for RICE)
}
```

### Prioritize Features

```typescript
// Impact-Effort Matrix (default)
{
  "methodology": "impact-effort"
}

// RICE Scoring
{
  "methodology": "rice"
}
```

## Tools

| Tool | Description |
|------|-------------|
| `add_feature` | Add feature to backlog |
| `prioritize_features` | Classify features as P0/P1/P2/P3 |
| `calculate_rice_score` | Calculate RICE score for feature |
| `get_mvp_features` | Get MVP feature list (P0 + top 3 P1) |
| `list_features` | List all features |
| `clear_features` | Clear backlog |

## Priority Levels

**P0 (Critical):** High Impact (8-10), Low Effort (1-3)
- Ship ASAP
- Quick wins with major impact

**P1 (Important):** High Impact (6-10), Medium Effort (4-6)
- Next sprint
- Strategic features

**P2 (Nice to Have):** Medium Impact (4-7), Medium Effort (4-7)
- Future consideration
- Balanced value/cost

**P3 (Low Priority):** Low Impact (<4) or High Effort (>7)
- Backlog
- Reevaluate need

## RICE Scoring

**Formula:** (Reach × Impact × Confidence) / Effort

**Thresholds:**
- RICE ≥ 100 → P0
- RICE ≥ 50 → P1
- RICE ≥ 10 → P2
- RICE < 10 → P3

## Running

```bash
npm start
```

## Testing

```bash
npm test
```
