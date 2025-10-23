#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';

/**
 * Feature Prioritizer MCP Server
 *
 * Provides P0/P1/P2 prioritization framework tools:
 * - Prioritize features based on impact and effort
 * - Calculate priority scores
 * - Generate MVP feature lists
 * - RICE scoring (Reach, Impact, Confidence, Effort)
 */

export interface Feature {
  id: string;
  name: string;
  description?: string;
  impact?: number;      // 1-10 scale
  effort?: number;      // 1-10 scale (1=easy, 10=hard)
  reach?: number;       // Number of users affected
  confidence?: number;  // 0-100% confidence in estimates
  priority?: 'P0' | 'P1' | 'P2' | 'P3';
  score?: number;
}

export interface PrioritizationResult {
  features: Feature[];
  methodology: string;
  summary: {
    P0: number;
    P1: number;
    P2: number;
    P3: number;
  };
}

class FeaturePrioritizerServer {
  private server: Server;
  private features: Map<string, Feature> = new Map();

  constructor() {
    this.server = new Server(
      {
        name: 'feature-prioritizer-mcp',
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
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: this.getTools(),
    }));

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'add_feature':
            return await this.handleAddFeature(args as any);
          case 'prioritize_features':
            return await this.handlePrioritizeFeatures(args as any);
          case 'calculate_rice_score':
            return await this.handleCalculateRiceScore(args as any);
          case 'get_mvp_features':
            return await this.handleGetMvpFeatures();
          case 'list_features':
            return await this.handleListFeatures();
          case 'clear_features':
            return await this.handleClearFeatures();
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
        name: 'add_feature',
        description: 'Add a feature to the prioritization backlog',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Unique feature ID',
            },
            name: {
              type: 'string',
              description: 'Feature name',
            },
            description: {
              type: 'string',
              description: 'Feature description (optional)',
            },
            impact: {
              type: 'number',
              description: 'Business impact (1-10, where 10 is highest)',
            },
            effort: {
              type: 'number',
              description: 'Development effort (1-10, where 1 is easiest)',
            },
            reach: {
              type: 'number',
              description: 'Number of users affected (for RICE scoring)',
            },
            confidence: {
              type: 'number',
              description: 'Confidence in estimates (0-100%)',
            },
          },
          required: ['id', 'name', 'impact', 'effort'],
        },
      },
      {
        name: 'prioritize_features',
        description: 'Prioritize all features using impact/effort matrix (P0/P1/P2/P3)',
        inputSchema: {
          type: 'object',
          properties: {
            methodology: {
              type: 'string',
              enum: ['impact-effort', 'rice'],
              description: 'Prioritization methodology (default: impact-effort)',
            },
          },
        },
      },
      {
        name: 'calculate_rice_score',
        description: 'Calculate RICE score for a feature (Reach × Impact × Confidence / Effort)',
        inputSchema: {
          type: 'object',
          properties: {
            featureId: {
              type: 'string',
              description: 'Feature ID to calculate RICE score for',
            },
          },
          required: ['featureId'],
        },
      },
      {
        name: 'get_mvp_features',
        description: 'Get prioritized MVP feature list (P0 + high-value P1)',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'list_features',
        description: 'List all features in backlog',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'clear_features',
        description: 'Clear all features from backlog',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
    ];
  }

  private async handleAddFeature(args: Feature) {
    this.features.set(args.id, args);

    return {
      content: [
        {
          type: 'text',
          text: `✅ Added feature: ${args.name} (Impact: ${args.impact}/10, Effort: ${args.effort}/10)`,
        },
      ],
    };
  }

  private async handlePrioritizeFeatures(args: { methodology?: string }) {
    const methodology = args.methodology || 'impact-effort';

    const prioritized: Feature[] = [];

    for (const feature of this.features.values()) {
      const prioritizedFeature = { ...feature };

      if (methodology === 'rice') {
        // RICE: (Reach × Impact × Confidence) / Effort
        if (!feature.reach || !feature.confidence) {
          prioritizedFeature.priority = 'P3';
          prioritizedFeature.score = 0;
        } else {
          const riceScore =
            (feature.reach * (feature.impact || 0) * (feature.confidence || 0 / 100)) /
            (feature.effort || 1);
          prioritizedFeature.score = riceScore;

          // Classify by RICE score
          if (riceScore >= 100) prioritizedFeature.priority = 'P0';
          else if (riceScore >= 50) prioritizedFeature.priority = 'P1';
          else if (riceScore >= 10) prioritizedFeature.priority = 'P2';
          else prioritizedFeature.priority = 'P3';
        }
      } else {
        // Impact-Effort Matrix
        const impact = feature.impact || 0;
        const effort = feature.effort || 10;

        // P0: High Impact (8-10), Low Effort (1-3)
        // P1: High Impact (6-10), Medium Effort (4-6) OR Medium Impact (5-7), Low Effort (1-3)
        // P2: Medium Impact (4-7), Medium Effort (4-7)
        // P3: Low Impact (<4) OR High Effort (>7)

        if (impact >= 8 && effort <= 3) {
          prioritizedFeature.priority = 'P0';
          prioritizedFeature.score = impact / effort;
        } else if ((impact >= 6 && effort <= 6) || (impact >= 5 && effort <= 3)) {
          prioritizedFeature.priority = 'P1';
          prioritizedFeature.score = impact / effort;
        } else if (impact >= 4 && impact <= 7 && effort >= 4 && effort <= 7) {
          prioritizedFeature.priority = 'P2';
          prioritizedFeature.score = impact / effort;
        } else {
          prioritizedFeature.priority = 'P3';
          prioritizedFeature.score = impact / effort;
        }
      }

      prioritized.push(prioritizedFeature);
    }

    // Sort by priority (P0 first) and then by score (highest first)
    prioritized.sort((a, b) => {
      if (a.priority !== b.priority) {
        const priorityOrder = { P0: 0, P1: 1, P2: 2, P3: 3 };
        return priorityOrder[a.priority!] - priorityOrder[b.priority!];
      }
      return (b.score || 0) - (a.score || 0);
    });

    // Calculate summary
    const summary = {
      P0: prioritized.filter((f) => f.priority === 'P0').length,
      P1: prioritized.filter((f) => f.priority === 'P1').length,
      P2: prioritized.filter((f) => f.priority === 'P2').length,
      P3: prioritized.filter((f) => f.priority === 'P3').length,
    };

    // Update stored features with priorities
    prioritized.forEach((f) => this.features.set(f.id, f));

    const result: PrioritizationResult = {
      features: prioritized,
      methodology,
      summary,
    };

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  }

  private async handleCalculateRiceScore(args: { featureId: string }) {
    const feature = this.features.get(args.featureId);

    if (!feature) {
      throw new Error(`Feature not found: ${args.featureId}`);
    }

    if (!feature.reach || !feature.confidence || !feature.impact || !feature.effort) {
      throw new Error(
        'Feature must have reach, impact, confidence, and effort for RICE calculation'
      );
    }

    const riceScore =
      (feature.reach * feature.impact * (feature.confidence / 100)) / feature.effort;

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              featureId: feature.id,
              name: feature.name,
              riceScore: riceScore.toFixed(2),
              breakdown: {
                reach: feature.reach,
                impact: feature.impact,
                confidence: feature.confidence,
                effort: feature.effort,
              },
            },
            null,
            2
          ),
        },
      ],
    };
  }

  private async handleGetMvpFeatures() {
    // Get all P0 features + top 3 P1 features
    const allFeatures = Array.from(this.features.values());

    const P0Features = allFeatures.filter((f) => f.priority === 'P0');
    const P1Features = allFeatures
      .filter((f) => f.priority === 'P1')
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, 3);

    const mvpFeatures = [...P0Features, ...P1Features];

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              mvpFeatures,
              totalFeatures: mvpFeatures.length,
              breakdown: {
                P0: P0Features.length,
                P1: P1Features.length,
              },
            },
            null,
            2
          ),
        },
      ],
    };
  }

  private async handleListFeatures() {
    const allFeatures = Array.from(this.features.values());

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              features: allFeatures,
              total: allFeatures.length,
            },
            null,
            2
          ),
        },
      ],
    };
  }

  private async handleClearFeatures() {
    const count = this.features.size;
    this.features.clear();

    return {
      content: [
        {
          type: 'text',
          text: `✅ Cleared ${count} features from backlog`,
        },
      ],
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Feature Prioritizer MCP server running on stdio');
  }
}

const server = new FeaturePrioritizerServer();
server.run().catch(console.error);
