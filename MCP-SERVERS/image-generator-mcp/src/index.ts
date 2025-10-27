#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

interface ImageGenerationResult {
  imageUrl: string;
  prompt: string;
  style: string;
  size: string;
  provider: string;
  timestamp: string;
}

interface ImageHistory {
  images: ImageGenerationResult[];
  totalGenerated: number;
}

const imageHistory: ImageHistory = {
  images: [],
  totalGenerated: 0,
};

const server = new Server(
  { name: 'image-generator-mcp', version: '1.0.0' },
  { capabilities: { tools: {}, resources: {} } }
);

// Tools Handler
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'generateImage',
      description: 'Generate an image from a text prompt using AI image generation services (OpenAI DALL-E, Midjourney, Stable Diffusion)',
      inputSchema: {
        type: 'object',
        properties: {
          prompt: {
            type: 'string',
            description: 'Text description of the image to generate',
          },
          style: {
            type: 'string',
            description: 'Visual style (realistic, artistic, cartoon, abstract, photographic)',
            enum: ['realistic', 'artistic', 'cartoon', 'abstract', 'photographic'],
          },
          size: {
            type: 'string',
            description: 'Image dimensions',
            enum: ['256x256', '512x512', '1024x1024', '1024x1792', '1792x1024'],
          },
          provider: {
            type: 'string',
            description: 'AI image generation provider',
            enum: ['dalle', 'midjourney', 'stable-diffusion'],
          },
        },
        required: ['prompt'],
      },
    },
    {
      name: 'editImage',
      description: 'Edit an existing image using AI with a text prompt and optional mask',
      inputSchema: {
        type: 'object',
        properties: {
          imageUrl: {
            type: 'string',
            description: 'URL or path to the image to edit',
          },
          prompt: {
            type: 'string',
            description: 'Description of the edits to make',
          },
          mask: {
            type: 'string',
            description: 'Optional mask URL indicating area to edit',
          },
          provider: {
            type: 'string',
            description: 'AI image generation provider',
            enum: ['dalle', 'stable-diffusion'],
          },
        },
        required: ['imageUrl', 'prompt'],
      },
    },
    {
      name: 'upscaleImage',
      description: 'Upscale an image to higher resolution using AI enhancement',
      inputSchema: {
        type: 'object',
        properties: {
          imageUrl: {
            type: 'string',
            description: 'URL or path to the image to upscale',
          },
          scale: {
            type: 'number',
            description: 'Upscaling factor (2x, 4x, 8x)',
            enum: [2, 4, 8],
          },
          enhanceDetails: {
            type: 'boolean',
            description: 'Apply AI detail enhancement',
          },
        },
        required: ['imageUrl', 'scale'],
      },
    },
    {
      name: 'generateVariations',
      description: 'Generate multiple variations of an existing image',
      inputSchema: {
        type: 'object',
        properties: {
          imageUrl: {
            type: 'string',
            description: 'URL or path to the source image',
          },
          count: {
            type: 'number',
            description: 'Number of variations to generate (1-10)',
            minimum: 1,
            maximum: 10,
          },
          variationType: {
            type: 'string',
            description: 'Type of variations',
            enum: ['style', 'color', 'composition', 'similar'],
          },
        },
        required: ['imageUrl', 'count'],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const { name, arguments: args } = request.params;

    switch (name) {
      case 'generateImage': {
        const {
          prompt,
          style = 'realistic',
          size = '1024x1024',
          provider = 'dalle',
        } = args as any;

        if (!prompt) {
          throw new Error('Missing required argument: prompt');
        }

        // Simulate image generation (in production, call actual API)
        const result: ImageGenerationResult = {
          imageUrl: `https://placeholder.example.com/images/${Date.now()}.png`,
          prompt,
          style,
          size,
          provider,
          timestamp: new Date().toISOString(),
        };

        imageHistory.images.push(result);
        imageHistory.totalGenerated++;

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  success: true,
                  message: `Image generated successfully with ${provider}`,
                  data: result,
                  note: 'This is a placeholder. Configure API keys for: OPENAI_API_KEY, MIDJOURNEY_API_KEY, or STABLE_DIFFUSION_API_KEY',
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case 'editImage': {
        const { imageUrl, prompt, mask, provider = 'dalle' } = args as any;

        if (!imageUrl || !prompt) {
          throw new Error('Missing required arguments: imageUrl, prompt');
        }

        const result = {
          success: true,
          message: 'Image edited successfully',
          data: {
            originalUrl: imageUrl,
            editedUrl: `https://placeholder.example.com/images/edited-${Date.now()}.png`,
            prompt,
            mask: mask || null,
            provider,
            timestamp: new Date().toISOString(),
          },
          note: 'This is a placeholder. Configure API keys for image editing services.',
        };

        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      }

      case 'upscaleImage': {
        const { imageUrl, scale, enhanceDetails = true } = args as any;

        if (!imageUrl || !scale) {
          throw new Error('Missing required arguments: imageUrl, scale');
        }

        const result = {
          success: true,
          message: `Image upscaled ${scale}x successfully`,
          data: {
            originalUrl: imageUrl,
            upscaledUrl: `https://placeholder.example.com/images/upscaled-${scale}x-${Date.now()}.png`,
            scale,
            enhanceDetails,
            originalSize: '512x512',
            newSize: `${512 * scale}x${512 * scale}`,
            timestamp: new Date().toISOString(),
          },
          note: 'This is a placeholder. Configure upscaling service API key.',
        };

        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      }

      case 'generateVariations': {
        const { imageUrl, count, variationType = 'similar' } = args as any;

        if (!imageUrl || !count) {
          throw new Error('Missing required arguments: imageUrl, count');
        }

        const variations = Array.from({ length: count }, (_, i) => ({
          url: `https://placeholder.example.com/images/variation-${i + 1}-${Date.now()}.png`,
          variationType,
          index: i + 1,
        }));

        const result = {
          success: true,
          message: `Generated ${count} variations`,
          data: {
            originalUrl: imageUrl,
            variations,
            variationType,
            timestamp: new Date().toISOString(),
          },
          note: 'This is a placeholder. Configure API keys for variation generation.',
        };

        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
});

// Resources Handler
server.setRequestHandler(ListResourcesRequestSchema, async () => ({
  resources: [
    {
      uri: 'image-generator://history',
      name: 'Image Generation History',
      description: 'List of all generated images',
      mimeType: 'application/json',
    },
    {
      uri: 'image-generator://config',
      name: 'Configuration Guide',
      description: 'Setup instructions for image generation providers',
      mimeType: 'text/plain',
    },
  ],
}));

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;

  if (uri === 'image-generator://history') {
    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify(imageHistory, null, 2),
        },
      ],
    };
  }

  if (uri === 'image-generator://config') {
    const config = `Image Generator MCP Configuration Guide
==========================================

Required Environment Variables:
- OPENAI_API_KEY: For DALL-E image generation
- MIDJOURNEY_API_KEY: For Midjourney (requires Discord bot setup)
- STABLE_DIFFUSION_API_KEY: For Stable Diffusion API

Supported Providers:
1. OpenAI DALL-E 3 (dalle)
   - Best for: Photorealistic images, detailed prompts
   - Max size: 1792x1024
   - API: https://platform.openai.com/docs/guides/images

2. Midjourney (midjourney)
   - Best for: Artistic, creative images
   - Requires Discord bot integration
   - API: Unofficial API wrappers available

3. Stable Diffusion (stable-diffusion)
   - Best for: Custom models, local deployment
   - API: Various providers (Replicate, HuggingFace)

Setup Instructions:
1. Obtain API keys from providers
2. Set environment variables
3. Configure provider preferences
4. Test with simple prompts

Example Usage:
  generateImage({
    prompt: "A serene mountain landscape at sunset",
    style: "photographic",
    size: "1024x1024",
    provider: "dalle"
  })
`;
    return {
      contents: [
        {
          uri,
          mimeType: 'text/plain',
          text: config,
        },
      ],
    };
  }

  throw new Error(`Unknown resource: ${uri}`);
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('image-generator-mcp v1.0.0 running on stdio');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
