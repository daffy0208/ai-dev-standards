# User Insight Analyzer MCP Server

Analyze user feedback to extract patterns, pain points, and actionable insights.

## What This MCP Does

- 🔍 **Pain Point Extraction** - Identify and categorize user problems
- 📊 **Pattern Detection** - Find behavioral patterns across users
- 📈 **Severity Matrix** - Prioritize problems by frequency and impact
- 👤 **Persona Generation** - Create data-driven user personas
- 💡 **Insight Synthesis** - Generate actionable recommendations
- 📝 **Multi-Source Analysis** - Combine interviews, surveys, support tickets

## Installation

```bash
cd MCP-SERVERS/user-insight-analyzer-mcp
npm install
npm run build
```

## Setup

Add to your Claude MCP settings:

```json
{
  "mcpServers": {
    "user-insight-analyzer": {
      "command": "node",
      "args": ["/path/to/user-insight-analyzer-mcp/dist/index.js"],
      "env": {
        "OPENAI_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

## Tools

### 1. configure
Set up OpenAI API for analysis.

```typescript
{
  openaiApiKey: string;
  model?: string; // default: 'gpt-4'
}
```

### 2. add_feedback
Add user feedback for analysis.

```typescript
{
  id: string;
  source: string; // 'interview', 'survey', 'support ticket'
  text: string;
  metadata?: Record<string, any>;
}
```

### 3. extract_pain_points
Extract and categorize pain points.

```typescript
{
  feedbackIds?: string[]; // specific feedback, or all if omitted
  minFrequency?: number; // default: 1
}
```

Returns:
```json
{
  "painPoints": [{
    "theme": "Slow performance",
    "description": "App takes too long to load",
    "frequency": 15,
    "severity": "critical",
    "affectedUsers": ["user1", "user2"],
    "quotes": ["It takes forever to load"]
  }]
}
```

### 4. find_patterns
Find behavioral patterns across feedback.

```typescript
{
  feedbackIds?: string[];
  patternType?: 'behaviors' | 'workarounds' | 'desires' | 'all';
}
```

### 5. create_severity_matrix
Create priority matrix (frequency × severity).

```typescript
{
  painPoints: Array<PainPoint>; // from extract_pain_points
}
```

Returns P0/P1/P2 priorities:
- **P0:** High severity + High frequency (fix immediately)
- **P1:** High severity OR High frequency (fix soon)
- **P2:** Low severity + Low frequency (fix later)

### 6. generate_personas
Generate user personas from feedback.

```typescript
{
  feedbackIds?: string[];
  numberOfPersonas?: number; // default: 3
}
```

### 7. synthesize_insights
Synthesize key insights.

```typescript
{
  feedbackIds?: string[];
  focus?: 'opportunities' | 'risks' | 'recommendations' | 'all';
}
```

### 8. list_feedback
List all stored feedback.

## Usage Example

```javascript
// 1. Configure
await analyzer.configure({
  openaiApiKey: process.env.OPENAI_API_KEY,
  model: 'gpt-4',
});

// 2. Add feedback from multiple sources
await analyzer.add_feedback({
  id: 'interview-001',
  source: 'interview',
  text: 'The app is too slow. It takes forever to load my dashboard.',
  metadata: { user: 'sarah', date: '2024-01-15' },
});

await analyzer.add_feedback({
  id: 'survey-042',
  source: 'survey',
  text: 'I love the features but the performance is terrible.',
  metadata: { segment: 'enterprise', nps: 6 },
});

// 3. Extract pain points
const painPoints = await analyzer.extract_pain_points({
  minFrequency: 2,
});

// 4. Create priority matrix
const matrix = await analyzer.create_severity_matrix({
  painPoints: painPoints.painPoints,
});

// 5. Find patterns
const patterns = await analyzer.find_patterns({
  patternType: 'workarounds',
});

// 6. Generate personas
const personas = await analyzer.generate_personas({
  numberOfPersonas: 3,
});

// 7. Synthesize insights
const insights = await analyzer.synthesize_insights({
  focus: 'recommendations',
});
```

## Integration with Product Strategy

This MCP is designed for the product-strategist workflow:

```
1. interview-transcriber-mcp → Transcribe interviews
2. user-insight-analyzer-mcp → Extract pain points
3. user-insight-analyzer-mcp → Find patterns
4. user-insight-analyzer-mcp → Create severity matrix
5. feature-prioritizer-mcp → Prioritize solutions
```

## Analysis Techniques

### Pain Point Extraction
- Groups similar issues by theme
- Estimates frequency from mentions
- Assigns severity based on impact language
- Extracts supporting quotes

### Pattern Detection
- Identifies recurring behaviors
- Finds common workarounds
- Surfaces unmet desires
- Connects dots across users

### Severity Matrix
Uses 2x2 matrix:
- **X-axis:** Frequency (how many users)
- **Y-axis:** Severity (how painful)
- **Quadrants:** P0, P1, P2 priorities

### Persona Generation
- Clusters users by behavior and needs
- Creates archetypal representations
- Includes goals, pain points, behaviors
- Adds representative quotes

## Best Practices

### Data Collection
- **Mix sources:** Interviews + surveys + support tickets
- **Verbatim quotes:** Keep exact wording for authenticity
- **Metadata:** Track user segment, date, context
- **Volume:** 10+ pieces of feedback for patterns

### Analysis Quality
- **Minimum frequency:** Set to 2-3 to filter noise
- **Review results:** AI analysis is a starting point
- **Validate insights:** Check with actual users
- **Update regularly:** Re-analyze as feedback grows

### Cost Optimization
- Use GPT-3.5-turbo for initial analysis
- Switch to GPT-4 for persona generation
- Batch multiple feedback items
- Cache analysis results

## Output Formats

All tools return structured JSON for easy integration with:
- Product roadmap tools
- User story generation
- Documentation systems
- Presentation decks

## Limitations

- **English focus:** Works best with English feedback
- **Minimum data:** Needs 5+ feedback items for meaningful patterns
- **AI interpretation:** Review results, don't blindly trust
- **No quantitative:** Doesn't handle numerical survey data (use separate analytics)

## Roadmap

- [ ] Multi-language support
- [ ] Quantitative survey analysis
- [ ] Trend detection over time
- [ ] Competitive insight extraction
- [ ] Export to Figma/Miro
- [ ] Integration with analytics platforms

## Testing

```bash
npm test
```

## Related

- **Enables:** product-strategist, user-researcher skills
- **Depends on:** interview-transcriber-mcp (for transcripts)
- **Feeds into:** feature-prioritizer-mcp (for solution prioritization)
- **Use case:** Product discovery, user research, feature planning

