# Image Generator MCP Server

AI-powered image generation MCP server supporting multiple providers (OpenAI DALL-E, Midjourney, Stable Diffusion).

## Features

### Tools

#### `generateImage`

Generate images from text prompts with customizable styles and sizes.

**Parameters:**

- `prompt` (string, required): Text description of the image
- `style` (string): Visual style - realistic, artistic, cartoon, abstract, photographic
- `size` (string): Image dimensions - 256x256, 512x512, 1024x1024, 1024x1792, 1792x1024
- `provider` (string): AI provider - dalle, midjourney, stable-diffusion

**Example:**

```typescript
{
  prompt: "A futuristic cityscape at night with neon lights",
  style: "realistic",
  size: "1024x1024",
  provider: "dalle"
}
```

#### `editImage`

Edit existing images using AI with text prompts and optional masking.

**Parameters:**

- `imageUrl` (string, required): URL or path to the image
- `prompt` (string, required): Description of edits to make
- `mask` (string, optional): Mask URL indicating edit area
- `provider` (string): AI provider - dalle, stable-diffusion

**Example:**

```typescript
{
  imageUrl: "https://example.com/image.png",
  prompt: "Add a sunset sky in the background",
  mask: "https://example.com/mask.png",
  provider: "dalle"
}
```

#### `upscaleImage`

Upscale images to higher resolution with AI enhancement.

**Parameters:**

- `imageUrl` (string, required): URL or path to the image
- `scale` (number, required): Upscaling factor - 2, 4, or 8
- `enhanceDetails` (boolean): Apply AI detail enhancement

**Example:**

```typescript
{
  imageUrl: "https://example.com/image.png",
  scale: 4,
  enhanceDetails: true
}
```

#### `generateVariations`

Generate multiple variations of an existing image.

**Parameters:**

- `imageUrl` (string, required): URL or path to source image
- `count` (number, required): Number of variations (1-10)
- `variationType` (string): Type - style, color, composition, similar

**Example:**

```typescript
{
  imageUrl: "https://example.com/image.png",
  count: 5,
  variationType: "style"
}
```

### Resources

#### `image-generator://history`

JSON list of all generated images with metadata.

#### `image-generator://config`

Configuration guide for setting up image generation providers.

## Setup

### Environment Variables

```bash
# OpenAI DALL-E (recommended)
export OPENAI_API_KEY="sk-..."

# Midjourney (requires Discord bot)
export MIDJOURNEY_API_KEY="..."

# Stable Diffusion
export STABLE_DIFFUSION_API_KEY="..."
```

### Installation

```bash
cd mcp-servers/image-generator-mcp
npm install
npm run build
```

### Configuration

Add to your MCP settings:

```json
{
  "mcpServers": {
    "image-generator": {
      "command": "node",
      "args": ["path/to/image-generator-mcp/dist/index.js"],
      "env": {
        "OPENAI_API_KEY": "sk-...",
        "MIDJOURNEY_API_KEY": "...",
        "STABLE_DIFFUSION_API_KEY": "..."
      }
    }
  }
}
```

## Provider Comparison

| Provider         | Best For                   | Max Size  | Cost   | Speed  |
| ---------------- | -------------------------- | --------- | ------ | ------ |
| DALL-E 3         | Photorealism, accuracy     | 1792x1024 | $$     | Fast   |
| Midjourney       | Artistic, creative         | 2048x2048 | $      | Medium |
| Stable Diffusion | Custom models, flexibility | Unlimited | Free/$ | Varies |

## Supported Skills

- **visual-designer**: Generate design assets, mockups, and visual content
- **brand-designer**: Create brand imagery, logos, and marketing visuals
- **ux-designer**: Generate UI concepts, illustrations, and prototypes

## Use Cases

1. **Design Mockups**: Generate placeholder images for designs
2. **Marketing Assets**: Create social media graphics and ads
3. **Concept Art**: Visualize ideas and concepts quickly
4. **Product Photography**: Generate product images for e-commerce
5. **Icon Generation**: Create custom icons and graphics
6. **Background Images**: Generate hero images and backgrounds

## Best Practices

### Prompt Engineering

**Good prompts:**

- Be specific: "A modern minimalist office with natural lighting"
- Include style: "in the style of architectural photography"
- Specify details: "with wooden furniture and green plants"

**Avoid:**

- Vague prompts: "nice office"
- Contradictions: "dark bright room"
- Too complex: combining 10+ concepts

### Style Guidelines

- **Realistic**: Use for product photos, architectural renders
- **Artistic**: Use for creative, stylized imagery
- **Cartoon**: Use for playful, simplified designs
- **Abstract**: Use for backgrounds, patterns
- **Photographic**: Use for professional, editorial-style images

### Size Selection

- **256x256**: Icons, thumbnails, profile pictures
- **512x512**: Social media posts, small graphics
- **1024x1024**: General purpose, balanced quality/size
- **1024x1792**: Mobile screens, vertical content
- **1792x1024**: Desktop screens, horizontal content

## Error Handling

The server handles common errors:

- Missing API keys
- Invalid parameters
- Rate limiting
- Provider downtime
- Invalid image URLs

All errors return structured responses with helpful messages.

## Limitations

- API rate limits vary by provider
- Image quality depends on prompt quality
- Some providers require additional setup
- Costs can accumulate with heavy usage
- Generation times vary (5s - 60s)

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Development mode
npm run dev
```

## License

MIT

## Support

For issues and questions:

- Check provider documentation
- Review configuration guide
- Test with simple prompts first
- Verify API keys are valid
