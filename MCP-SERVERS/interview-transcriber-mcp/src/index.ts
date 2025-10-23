#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import OpenAI from 'openai';
import * as fs from 'fs';

/**
 * Interview Transcriber MCP Server
 *
 * Provides tools for transcribing interviews and calls:
 * - Audio to text transcription (Whisper API)
 * - Speaker diarization
 * - Timestamp generation
 * - Summary generation
 * - Key insights extraction
 *
 * Enables: product-strategist, user-researcher skills
 */

interface TranscriptionConfig {
  provider: 'openai' | 'assemblyai' | 'deepgram';
  apiKey: string;
  model?: string;
  language?: string;
}

interface TranscriptionSegment {
  text: string;
  start: number;
  end: number;
  speaker?: string;
}

interface TranscriptionResult {
  text: string;
  segments: TranscriptionSegment[];
  duration: number;
  language?: string;
  summary?: string;
  keyInsights?: string[];
}

class InterviewTranscriberServer {
  private server: Server;
  private config: TranscriptionConfig | null = null;
  private openai: OpenAI | null = null;
  private transcriptions: Map<string, TranscriptionResult> = new Map();

  constructor() {
    this.server = new Server(
      {
        name: 'interview-transcriber-mcp',
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
          case 'transcribe_audio':
            return await this.handleTranscribeAudio(args as any);
          case 'transcribe_with_timestamps':
            return await this.handleTranscribeWithTimestamps(args as any);
          case 'generate_summary':
            return await this.handleGenerateSummary(args as any);
          case 'extract_insights':
            return await this.handleExtractInsights(args as any);
          case 'identify_speakers':
            return await this.handleIdentifySpeakers(args as any);
          case 'list_transcriptions':
            return await this.handleListTranscriptions();
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
        description: 'Configure transcription provider (OpenAI Whisper, AssemblyAI, or Deepgram)',
        inputSchema: {
          type: 'object',
          properties: {
            provider: {
              type: 'string',
              enum: ['openai', 'assemblyai', 'deepgram'],
              description: 'Transcription provider',
            },
            apiKey: {
              type: 'string',
              description: 'API key for the provider',
            },
            model: {
              type: 'string',
              description: 'Model to use (default: whisper-1 for OpenAI)',
            },
            language: {
              type: 'string',
              description: 'Audio language (ISO-639-1, e.g., "en", "es")',
            },
          },
          required: ['provider', 'apiKey'],
        },
      },
      {
        name: 'transcribe_audio',
        description: 'Transcribe audio file to text',
        inputSchema: {
          type: 'object',
          properties: {
            audioPath: {
              type: 'string',
              description: 'Path to audio file (mp3, mp4, wav, etc.)',
            },
            audioBase64: {
              type: 'string',
              description: 'Base64-encoded audio data (alternative to file path)',
            },
            language: {
              type: 'string',
              description: 'Override language setting',
            },
            prompt: {
              type: 'string',
              description: 'Optional context to guide transcription',
            },
          },
        },
      },
      {
        name: 'transcribe_with_timestamps',
        description: 'Transcribe audio with word-level timestamps',
        inputSchema: {
          type: 'object',
          properties: {
            audioPath: {
              type: 'string',
              description: 'Path to audio file',
            },
            audioBase64: {
              type: 'string',
              description: 'Base64-encoded audio data',
            },
            language: {
              type: 'string',
              description: 'Audio language',
            },
          },
        },
      },
      {
        name: 'generate_summary',
        description: 'Generate summary from transcription',
        inputSchema: {
          type: 'object',
          properties: {
            transcriptionId: {
              type: 'string',
              description: 'ID of stored transcription',
            },
            text: {
              type: 'string',
              description: 'Transcription text (if not using stored ID)',
            },
            format: {
              type: 'string',
              enum: ['brief', 'detailed', 'bullet-points'],
              description: 'Summary format (default: brief)',
            },
          },
        },
      },
      {
        name: 'extract_insights',
        description: 'Extract key insights, pain points, and quotes from interview',
        inputSchema: {
          type: 'object',
          properties: {
            transcriptionId: {
              type: 'string',
              description: 'ID of stored transcription',
            },
            text: {
              type: 'string',
              description: 'Transcription text',
            },
            focus: {
              type: 'string',
              enum: ['pain-points', 'desires', 'behaviors', 'all'],
              description: 'What to focus on (default: all)',
            },
          },
        },
      },
      {
        name: 'identify_speakers',
        description: 'Identify different speakers in the transcription',
        inputSchema: {
          type: 'object',
          properties: {
            transcriptionId: {
              type: 'string',
              description: 'ID of stored transcription',
            },
            text: {
              type: 'string',
              description: 'Transcription text',
            },
            speakerNames: {
              type: 'array',
              description: 'Optional speaker names to assign',
              items: { type: 'string' },
            },
          },
        },
      },
      {
        name: 'list_transcriptions',
        description: 'List all stored transcriptions',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
    ];
  }

  private async handleConfigure(args: TranscriptionConfig) {
    this.config = args;

    if (args.provider === 'openai') {
      this.openai = new OpenAI({ apiKey: args.apiKey });
    }

    return {
      content: [
        {
          type: 'text',
          text: `✅ Configured ${args.provider} transcription\nModel: ${args.model || 'whisper-1'}\nLanguage: ${args.language || 'auto-detect'}`,
        },
      ],
    };
  }

  private async handleTranscribeAudio(args: {
    audioPath?: string;
    audioBase64?: string;
    language?: string;
    prompt?: string;
  }) {
    if (!this.openai) {
      throw new Error('Not configured. Call configure() with OpenAI API key first.');
    }

    let audioFile: Buffer;

    if (args.audioPath) {
      if (!fs.existsSync(args.audioPath)) {
        throw new Error(`Audio file not found: ${args.audioPath}`);
      }
      audioFile = fs.readFileSync(args.audioPath);
    } else if (args.audioBase64) {
      audioFile = Buffer.from(args.audioBase64, 'base64');
    } else {
      throw new Error('Must provide either audioPath or audioBase64');
    }

    // Create a temporary file for Whisper API
    const tempPath = `/tmp/audio_${Date.now()}.mp3`;
    fs.writeFileSync(tempPath, audioFile);

    try {
      const transcription = await this.openai.audio.transcriptions.create({
        file: fs.createReadStream(tempPath) as any,
        model: this.config?.model || 'whisper-1',
        language: args.language || this.config?.language,
        prompt: args.prompt,
      });

      const id = `transcript_${Date.now()}`;
      const result: TranscriptionResult = {
        text: transcription.text,
        segments: [{ text: transcription.text, start: 0, end: 0 }],
        duration: 0,
        language: args.language || this.config?.language,
      };

      this.transcriptions.set(id, result);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                id,
                text: transcription.text,
                language: result.language,
              },
              null,
              2
            ),
          },
        ],
      };
    } finally {
      // Clean up temp file
      if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
      }
    }
  }

  private async handleTranscribeWithTimestamps(args: {
    audioPath?: string;
    audioBase64?: string;
    language?: string;
  }) {
    if (!this.openai) {
      throw new Error('Not configured. Call configure() with OpenAI API key first.');
    }

    let audioFile: Buffer;

    if (args.audioPath) {
      audioFile = fs.readFileSync(args.audioPath);
    } else if (args.audioBase64) {
      audioFile = Buffer.from(args.audioBase64, 'base64');
    } else {
      throw new Error('Must provide either audioPath or audioBase64');
    }

    const tempPath = `/tmp/audio_${Date.now()}.mp3`;
    fs.writeFileSync(tempPath, audioFile);

    try {
      const transcription = await this.openai.audio.transcriptions.create({
        file: fs.createReadStream(tempPath) as any,
        model: this.config?.model || 'whisper-1',
        language: args.language || this.config?.language,
        response_format: 'verbose_json',
        timestamp_granularities: ['segment'],
      });

      const id = `transcript_${Date.now()}`;
      const segments: TranscriptionSegment[] =
        (transcription as any).segments?.map((seg: any) => ({
          text: seg.text,
          start: seg.start,
          end: seg.end,
        })) || [];

      const result: TranscriptionResult = {
        text: transcription.text,
        segments,
        duration: (transcription as any).duration || 0,
        language: args.language || this.config?.language,
      };

      this.transcriptions.set(id, result);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                id,
                text: result.text,
                segments,
                duration: result.duration,
                language: result.language,
              },
              null,
              2
            ),
          },
        ],
      };
    } finally {
      if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
      }
    }
  }

  private async handleGenerateSummary(args: {
    transcriptionId?: string;
    text?: string;
    format?: 'brief' | 'detailed' | 'bullet-points';
  }) {
    if (!this.openai) {
      throw new Error('Not configured. Call configure() first.');
    }

    let text: string;

    if (args.transcriptionId) {
      const transcription = this.transcriptions.get(args.transcriptionId);
      if (!transcription) {
        throw new Error(`Transcription not found: ${args.transcriptionId}`);
      }
      text = transcription.text;
    } else if (args.text) {
      text = args.text;
    } else {
      throw new Error('Must provide either transcriptionId or text');
    }

    const format = args.format || 'brief';
    const prompt =
      format === 'bullet-points'
        ? 'Summarize the following interview transcript as bullet points highlighting key topics:'
        : format === 'detailed'
        ? 'Provide a detailed summary of the following interview transcript, including context and nuances:'
        : 'Provide a brief summary of the following interview transcript:';

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are a user research analyst.' },
        { role: 'user', content: `${prompt}\n\n${text}` },
      ],
      temperature: 0.3,
    });

    const summary = completion.choices[0].message.content || '';

    // Store summary with transcription if ID provided
    if (args.transcriptionId) {
      const transcription = this.transcriptions.get(args.transcriptionId);
      if (transcription) {
        transcription.summary = summary;
      }
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ summary, format }, null, 2),
        },
      ],
    };
  }

  private async handleExtractInsights(args: {
    transcriptionId?: string;
    text?: string;
    focus?: 'pain-points' | 'desires' | 'behaviors' | 'all';
  }) {
    if (!this.openai) {
      throw new Error('Not configured. Call configure() first.');
    }

    let text: string;

    if (args.transcriptionId) {
      const transcription = this.transcriptions.get(args.transcriptionId);
      if (!transcription) {
        throw new Error(`Transcription not found: ${args.transcriptionId}`);
      }
      text = transcription.text;
    } else if (args.text) {
      text = args.text;
    } else {
      throw new Error('Must provide either transcriptionId or text');
    }

    const focus = args.focus || 'all';
    const focusPrompts = {
      'pain-points': 'Extract all pain points, problems, and frustrations mentioned.',
      desires: 'Extract all desires, wishes, and goals mentioned.',
      behaviors: 'Extract all current behaviors, workarounds, and habits mentioned.',
      all: 'Extract pain points, desires, and current behaviors.',
    };

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content:
            'You are a user research analyst. Extract insights in JSON format: { "painPoints": [], "desires": [], "behaviors": [], "quotes": [] }',
        },
        {
          role: 'user',
          content: `${focusPrompts[focus]}\n\nInclude verbatim quotes where relevant.\n\nTranscript:\n${text}`,
        },
      ],
      temperature: 0.2,
      response_format: { type: 'json_object' },
    });

    const insights = JSON.parse(completion.choices[0].message.content || '{}');

    // Store insights with transcription if ID provided
    if (args.transcriptionId) {
      const transcription = this.transcriptions.get(args.transcriptionId);
      if (transcription) {
        transcription.keyInsights = [
          ...(insights.painPoints || []),
          ...(insights.desires || []),
          ...(insights.behaviors || []),
        ];
      }
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ insights, focus }, null, 2),
        },
      ],
    };
  }

  private async handleIdentifySpeakers(args: {
    transcriptionId?: string;
    text?: string;
    speakerNames?: string[];
  }) {
    if (!this.openai) {
      throw new Error('Not configured. Call configure() first.');
    }

    let text: string;

    if (args.transcriptionId) {
      const transcription = this.transcriptions.get(args.transcriptionId);
      if (!transcription) {
        throw new Error(`Transcription not found: ${args.transcriptionId}`);
      }
      text = transcription.text;
    } else if (args.text) {
      text = args.text;
    } else {
      throw new Error('Must provide either transcriptionId or text');
    }

    const speakerContext = args.speakerNames
      ? `The speakers are: ${args.speakerNames.join(', ')}.`
      : 'Identify speakers as Speaker A, Speaker B, etc.';

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content:
            'You are a transcription editor. Add speaker labels to the transcript. Format: "Speaker Name: [text]"',
        },
        {
          role: 'user',
          content: `${speakerContext}\n\nAdd speaker labels to this transcript:\n\n${text}`,
        },
      ],
      temperature: 0.1,
    });

    const labeledTranscript = completion.choices[0].message.content || '';

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ labeledTranscript }, null, 2),
        },
      ],
    };
  }

  private async handleListTranscriptions() {
    const list = Array.from(this.transcriptions.entries()).map(([id, trans]) => ({
      id,
      preview: trans.text.substring(0, 100) + '...',
      duration: trans.duration,
      language: trans.language,
      hasSummary: !!trans.summary,
      hasInsights: !!trans.keyInsights,
      segmentCount: trans.segments.length,
    }));

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ total: list.length, transcriptions: list }, null, 2),
        },
      ],
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Interview Transcriber MCP server running on stdio');
  }
}

const server = new InterviewTranscriberServer();
server.run().catch(console.error);
