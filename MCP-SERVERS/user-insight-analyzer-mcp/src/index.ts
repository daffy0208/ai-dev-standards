#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import OpenAI from 'openai';

/**
 * User Insight Analyzer MCP Server
 *
 * Provides tools for analyzing user feedback:
 * - Extract pain points from interviews
 * - Identify patterns across multiple users
 * - Generate insights and themes
 * - Create problem severity matrix
 * - Build user personas
 *
 * Enables: product-strategist, user-researcher skills
 */

interface AnalysisConfig {
  openaiApiKey: string;
  model?: string;
}

interface UserFeedback {
  id: string;
  source: string;
  text: string;
  metadata?: Record<string, any>;
}

interface PainPoint {
  theme: string;
  description: string;
  frequency: number;
  severity: 'critical' | 'high' | 'medium' | 'low';
  affectedUsers: string[];
  quotes: string[];
}

interface Pattern {
  pattern: string;
  occurrences: number;
  examples: string[];
  insight: string;
}

class UserInsightAnalyzerServer {
  private server: Server;
  private config: AnalysisConfig | null = null;
  private openai: OpenAI | null = null;
  private feedbackStore: Map<string, UserFeedback> = new Map();

  constructor() {
    this.server = new Server(
      {
        name: 'user-insight-analyzer-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
  }

  private setupHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: this.getTools(),
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'configure':
            return await this.handleConfigure(args as any);
          case 'add_feedback':
            return await this.handleAddFeedback(args as any);
          case 'extract_pain_points':
            return await this.handleExtractPainPoints(args as any);
          case 'find_patterns':
            return await this.handleFindPatterns(args as any);
          case 'create_severity_matrix':
            return await this.handleCreateSeverityMatrix(args as any);
          case 'generate_personas':
            return await this.handleGeneratePersonas(args as any);
          case 'synthesize_insights':
            return await this.handleSynthesizeInsights(args as any);
          case 'list_feedback':
            return await this.handleListFeedback();
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          content: [{ type: 'text', text: `Error: ${errorMessage}` }],
          isError: true,
        };
      }
    });
  }

  private getTools(): Tool[] {
    return [
      {
        name: 'configure',
        description: 'Configure OpenAI API for analysis',
        inputSchema: {
          type: 'object',
          properties: {
            openaiApiKey: {
              type: 'string',
              description: 'OpenAI API key',
            },
            model: {
              type: 'string',
              description: 'Model to use (default: gpt-4)',
            },
          },
          required: ['openaiApiKey'],
        },
      },
      {
        name: 'add_feedback',
        description: 'Add user feedback for analysis',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Unique feedback ID',
            },
            source: {
              type: 'string',
              description: 'Source (e.g., "interview", "survey", "support ticket")',
            },
            text: {
              type: 'string',
              description: 'Feedback text',
            },
            metadata: {
              type: 'object',
              description: 'Additional metadata (user segment, date, etc.)',
            },
          },
          required: ['id', 'source', 'text'],
        },
      },
      {
        name: 'extract_pain_points',
        description: 'Extract and categorize pain points from feedback',
        inputSchema: {
          type: 'object',
          properties: {
            feedbackIds: {
              type: 'array',
              description: 'Feedback IDs to analyze (omit for all)',
              items: { type: 'string' },
            },
            minFrequency: {
              type: 'number',
              description: 'Minimum times pain point must appear (default: 1)',
            },
          },
        },
      },
      {
        name: 'find_patterns',
        description: 'Find behavioral patterns across feedback',
        inputSchema: {
          type: 'object',
          properties: {
            feedbackIds: {
              type: 'array',
              description: 'Feedback IDs to analyze',
              items: { type: 'string' },
            },
            patternType: {
              type: 'string',
              enum: ['behaviors', 'workarounds', 'desires', 'all'],
              description: 'Type of patterns to find',
            },
          },
        },
      },
      {
        name: 'create_severity_matrix',
        description: 'Create problem severity matrix (frequency × impact)',
        inputSchema: {
          type: 'object',
          properties: {
            painPoints: {
              type: 'array',
              description: 'Pain points to plot (from extract_pain_points)',
              items: { type: 'object' },
            },
          },
        },
      },
      {
        name: 'generate_personas',
        description: 'Generate user personas from feedback patterns',
        inputSchema: {
          type: 'object',
          properties: {
            feedbackIds: {
              type: 'array',
              description: 'Feedback IDs to analyze',
              items: { type: 'string' },
            },
            numberOfPersonas: {
              type: 'number',
              description: 'Number of personas to generate (default: 3)',
            },
          },
        },
      },
      {
        name: 'synthesize_insights',
        description: 'Synthesize key insights from all feedback',
        inputSchema: {
          type: 'object',
          properties: {
            feedbackIds: {
              type: 'array',
              description: 'Feedback IDs to synthesize',
              items: { type: 'string' },
            },
            focus: {
              type: 'string',
              enum: ['opportunities', 'risks', 'recommendations', 'all'],
              description: 'What to focus on',
            },
          },
        },
      },
      {
        name: 'list_feedback',
        description: 'List all stored feedback',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
    ];
  }

  private async handleConfigure(args: AnalysisConfig) {
    this.config = args;
    this.openai = new OpenAI({ apiKey: args.openaiApiKey });

    return {
      content: [
        {
          type: 'text',
          text: `✅ Configured analysis with model: ${args.model || 'gpt-4'}`,
        },
      ],
    };
  }

  private async handleAddFeedback(args: UserFeedback) {
    this.feedbackStore.set(args.id, args);

    return {
      content: [
        {
          type: 'text',
          text: `✅ Added feedback: ${args.id}\nSource: ${args.source}\nTotal feedback: ${this.feedbackStore.size}`,
        },
      ],
    };
  }

  private async handleExtractPainPoints(args: { feedbackIds?: string[]; minFrequency?: number }) {
    if (!this.openai) {
      throw new Error('Not configured. Call configure() first.');
    }

    const feedbackIds = args.feedbackIds || Array.from(this.feedbackStore.keys());
    const feedbackTexts = feedbackIds
      .map((id) => {
        const feedback = this.feedbackStore.get(id);
        return feedback ? `[${id}] ${feedback.text}` : null;
      })
      .filter((t): t is string => t !== null);

    if (feedbackTexts.length === 0) {
      throw new Error('No feedback found');
    }

    const prompt = `Analyze the following user feedback and extract pain points. 
Group similar pain points together and provide:
- Theme name
- Description
- Estimated frequency (how many users mentioned it)
- Severity (critical/high/medium/low)
- Affected user IDs
- Representative quotes

Return as JSON array of pain points.

Feedback:
${feedbackTexts.join('\n\n')}`;

    const completion = await this.openai.chat.completions.create({
      model: this.config?.model || 'gpt-4',
      messages: [
        {
          role: 'system',
          content:
            'You are a user research analyst. Extract pain points in JSON format: [{ "theme": "", "description": "", "frequency": 0, "severity": "", "affectedUsers": [], "quotes": [] }]',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.2,
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(completion.choices[0].message.content || '{"painPoints":[]}');
    const painPoints: PainPoint[] = result.painPoints || [];

    // Filter by minimum frequency
    const minFreq = args.minFrequency || 1;
    const filtered = painPoints.filter((p) => p.frequency >= minFreq);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              painPoints: filtered,
              total: filtered.length,
              analyzed: feedbackTexts.length,
            },
            null,
            2
          ),
        },
      ],
    };
  }

  private async handleFindPatterns(args: {
    feedbackIds?: string[];
    patternType?: 'behaviors' | 'workarounds' | 'desires' | 'all';
  }) {
    if (!this.openai) {
      throw new Error('Not configured. Call configure() first.');
    }

    const feedbackIds = args.feedbackIds || Array.from(this.feedbackStore.keys());
    const feedbackTexts = feedbackIds
      .map((id) => {
        const feedback = this.feedbackStore.get(id);
        return feedback ? feedback.text : null;
      })
      .filter((t): t is string => t !== null);

    if (feedbackTexts.length === 0) {
      throw new Error('No feedback found');
    }

    const patternType = args.patternType || 'all';
    const focusMap = {
      behaviors: 'current behaviors and actions users take',
      workarounds: 'workarounds and hacks users have created',
      desires: 'what users wish they could do',
      all: 'behaviors, workarounds, and desires',
    };

    const prompt = `Analyze the following user feedback and identify patterns in ${focusMap[patternType]}.

For each pattern:
- Pattern name
- Number of occurrences
- Examples from feedback
- Insight (what this tells us)

Return as JSON.

Feedback:
${feedbackTexts.join('\n\n')}`;

    const completion = await this.openai.chat.completions.create({
      model: this.config?.model || 'gpt-4',
      messages: [
        {
          role: 'system',
          content:
            'You are a user research analyst. Return JSON: { "patterns": [{ "pattern": "", "occurrences": 0, "examples": [], "insight": "" }] }',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(completion.choices[0].message.content || '{"patterns":[]}');

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              patterns: result.patterns || [],
              patternType,
              analyzed: feedbackTexts.length,
            },
            null,
            2
          ),
        },
      ],
    };
  }

  private async handleCreateSeverityMatrix(args: { painPoints?: any[] }) {
    if (!args.painPoints || args.painPoints.length === 0) {
      throw new Error('No pain points provided. Run extract_pain_points first.');
    }

    // Create 2x2 matrix: frequency (low/high) × severity (low/high)
    const matrix = {
      critical: {
        highFrequency: [] as any[],
        lowFrequency: [] as any[],
      },
      important: {
        highFrequency: [] as any[],
        lowFrequency: [] as any[],
      },
    };

    const medianFrequency =
      args.painPoints.map((p) => p.frequency).sort((a, b) => a - b)[
        Math.floor(args.painPoints.length / 2)
      ] || 1;

    for (const painPoint of args.painPoints) {
      const isCritical = ['critical', 'high'].includes(painPoint.severity);
      const isHighFreq = painPoint.frequency >= medianFrequency;

      if (isCritical) {
        if (isHighFreq) {
          matrix.critical.highFrequency.push(painPoint);
        } else {
          matrix.critical.lowFrequency.push(painPoint);
        }
      } else {
        if (isHighFreq) {
          matrix.important.highFrequency.push(painPoint);
        } else {
          matrix.important.lowFrequency.push(painPoint);
        }
      }
    }

    const priorities = {
      P0: matrix.critical.highFrequency,
      P1: [
        ...matrix.critical.lowFrequency,
        ...matrix.important.highFrequency,
      ],
      P2: matrix.important.lowFrequency,
    };

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              matrix,
              priorities,
              recommendation: `Focus on P0 (${priorities.P0.length} issues): High severity + High frequency`,
            },
            null,
            2
          ),
        },
      ],
    };
  }

  private async handleGeneratePersonas(args: {
    feedbackIds?: string[];
    numberOfPersonas?: number;
  }) {
    if (!this.openai) {
      throw new Error('Not configured. Call configure() first.');
    }

    const feedbackIds = args.feedbackIds || Array.from(this.feedbackStore.keys());
    const feedbackTexts = feedbackIds
      .map((id) => {
        const feedback = this.feedbackStore.get(id);
        return feedback ? feedback.text : null;
      })
      .filter((t): t is string => t !== null);

    if (feedbackTexts.length === 0) {
      throw new Error('No feedback found');
    }

    const numberOfPersonas = args.numberOfPersonas || 3;

    const prompt = `Based on the following user feedback, generate ${numberOfPersonas} distinct user personas.

For each persona include:
- Name and role
- Demographics
- Goals and motivations
- Pain points
- Current behavior
- Tech savviness
- Quote that represents them

Feedback:
${feedbackTexts.join('\n\n')}`;

    const completion = await this.openai.chat.completions.create({
      model: this.config?.model || 'gpt-4',
      messages: [
        {
          role: 'system',
          content:
            'You are a user research analyst. Return JSON: { "personas": [{ "name": "", "role": "", "demographics": "", "goals": [], "painPoints": [], "behavior": "", "techSavviness": "", "quote": "" }] }',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.5,
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(completion.choices[0].message.content || '{"personas":[]}');

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              personas: result.personas || [],
              analyzed: feedbackTexts.length,
            },
            null,
            2
          ),
        },
      ],
    };
  }

  private async handleSynthesizeInsights(args: {
    feedbackIds?: string[];
    focus?: 'opportunities' | 'risks' | 'recommendations' | 'all';
  }) {
    if (!this.openai) {
      throw new Error('Not configured. Call configure() first.');
    }

    const feedbackIds = args.feedbackIds || Array.from(this.feedbackStore.keys());
    const feedbackTexts = feedbackIds
      .map((id) => {
        const feedback = this.feedbackStore.get(id);
        return feedback ? feedback.text : null;
      })
      .filter((t): t is string => t !== null);

    if (feedbackTexts.length === 0) {
      throw new Error('No feedback found');
    }

    const focus = args.focus || 'all';
    const focusMap = {
      opportunities: 'market opportunities and unmet needs',
      risks: 'risks and concerns',
      recommendations: 'actionable recommendations',
      all: 'opportunities, risks, and recommendations',
    };

    const prompt = `Synthesize key insights from this user feedback focusing on ${focusMap[focus]}.

Provide:
- Top 3-5 insights
- Supporting evidence
- Confidence level (high/medium/low)
- Impact if acted upon

Feedback:
${feedbackTexts.join('\n\n')}`;

    const completion = await this.openai.chat.completions.create({
      model: this.config?.model || 'gpt-4',
      messages: [
        {
          role: 'system',
          content:
            'You are a product strategist. Return JSON: { "insights": [{ "insight": "", "evidence": [], "confidence": "", "impact": "" }] }',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(completion.choices[0].message.content || '{"insights":[]}');

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              insights: result.insights || [],
              focus,
              analyzed: feedbackTexts.length,
            },
            null,
            2
          ),
        },
      ],
    };
  }

  private async handleListFeedback() {
    const list = Array.from(this.feedbackStore.entries()).map(([id, feedback]) => ({
      id,
      source: feedback.source,
      preview: feedback.text.substring(0, 100) + '...',
      metadata: feedback.metadata,
    }));

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ total: list.length, feedback: list }, null, 2),
        },
      ],
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('User Insight Analyzer MCP server running on stdio');
  }
}

const server = new UserInsightAnalyzerServer();
server.run().catch(console.error);
