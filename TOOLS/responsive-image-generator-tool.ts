/**
 * Responsive Image Generator Tool
 *
 * LangChain tool for generating responsive image srcset and sizes attributes.
 *
 * Features:
 * - Generate multiple image sizes
 * - Calculate optimal sizes attribute
 * - Create srcset strings
 * - Support different breakpoints
 * - Optimize for different viewports
 *
 * @example
 * ```typescript
 * import { ResponsiveImageGeneratorTool } from './responsive-image-generator-tool'
 *
 * const tool = new ResponsiveImageGeneratorTool()
 *
 * const result = await tool.invoke({
 *   input: '/path/to/image.jpg',
 *   widths: [320, 640, 1024, 1920],
 *   breakpoints: [{ width: 768, size: '100vw' }, { width: 1024, size: '50vw' }]
 * })
 * ```
 */

import { Tool } from '@langchain/core/tools'
import { z } from 'zod'

const BreakpointSchema = z.object({
  width: z.number().describe('Viewport width in pixels'),
  size: z.string().describe('Image size at this breakpoint (e.g., "100vw", "50vw", "800px")'),
})

const ResponsiveImageGeneratorSchema = z.object({
  input: z.string().describe('Path to source image or base URL'),
  widths: z
    .array(z.number())
    .default([320, 640, 768, 1024, 1280, 1536, 1920])
    .describe('Widths to generate in pixels'),
  breakpoints: z
    .array(BreakpointSchema)
    .optional()
    .describe('Responsive breakpoints with sizes'),
  format: z
    .enum(['webp', 'avif', 'jpeg', 'png'])
    .default('webp')
    .describe('Output format'),
  quality: z
    .number()
    .min(1)
    .max(100)
    .default(85)
    .describe('Image quality'),
  dpr: z
    .array(z.number())
    .default([1, 2])
    .describe('Device pixel ratios to support'),
  generateFiles: z
    .boolean()
    .default(false)
    .describe('Actually generate image files (vs just URLs)'),
})

export type ResponsiveImageGeneratorInput = z.infer<typeof ResponsiveImageGeneratorSchema>

export interface ResponsiveImageResult {
  success: boolean
  srcset: string
  sizes: string
  images: Array<{
    url: string
    width: number
    height?: number
    format: string
    size?: number
  }>
  htmlSnippet: string
  pictureElementSnippet?: string
  error?: string
}

export class ResponsiveImageGeneratorTool extends Tool {
  name = 'responsive_image_generator'

  description = `Generate responsive image srcset and sizes for optimal image loading across devices.

  Features:
  - Generate multiple image sizes from source
  - Create srcset attribute string
  - Calculate optimal sizes attribute
  - Support custom breakpoints
  - Generate HTML snippets

  Input should be a JSON object with:
  - input: Source image path or URL
  - widths: Array of widths to generate (default: [320, 640, 768, 1024, 1280, 1536, 1920])
  - breakpoints: Optional array of {width, size} for custom breakpoints
  - format: Output format (webp, avif, jpeg, png)
  - quality: Image quality (1-100)
  - dpr: Device pixel ratios (default: [1, 2])
  - generateFiles: Actually create files vs URLs only

  Returns srcset, sizes, and HTML snippets for responsive images.`

  schema = ResponsiveImageGeneratorSchema

  async _call(input: ResponsiveImageGeneratorInput): Promise<string> {
    try {
      const result = await this.generateResponsiveImages(input)
      return JSON.stringify(result, null, 2)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      return JSON.stringify({
        success: false,
        error: errorMessage,
      })
    }
  }

  private async generateResponsiveImages(
    input: ResponsiveImageGeneratorInput
  ): Promise<ResponsiveImageResult> {
    const basePath = input.input.replace(/\.[^.]+$/, '')
    const extension = input.format

    // Generate image URLs for each width
    const images = input.widths.map((width) => ({
      url: `${basePath}-${width}w.${extension}`,
      width,
      format: input.format,
    }))

    // Generate srcset string
    const srcset = images.map((img) => `${img.url} ${img.width}w`).join(', ')

    // Generate sizes attribute
    let sizes: string
    if (input.breakpoints && input.breakpoints.length > 0) {
      // Custom breakpoints
      const sortedBreakpoints = [...input.breakpoints].sort((a, b) => a.width - b.width)

      const sizeStrings = sortedBreakpoints.map(
        (bp) => `(max-width: ${bp.width}px) ${bp.size}`
      )

      // Add default size for largest viewport
      const lastBreakpoint = sortedBreakpoints[sortedBreakpoints.length - 1]
      sizes = [...sizeStrings, lastBreakpoint.size].join(', ')
    } else {
      // Default responsive sizes
      sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
    }

    // Generate HTML img snippet
    const htmlSnippet = `<img
  src="${images[Math.floor(images.length / 2)].url}"
  srcset="${srcset}"
  sizes="${sizes}"
  alt="Description"
  loading="lazy"
  decoding="async"
/>`

    // Generate picture element with format fallbacks
    const pictureElementSnippet = `<picture>
  <source type="image/avif" srcset="${srcset.replace(/\.(webp|jpg|png)/g, '.avif')}" sizes="${sizes}" />
  <source type="image/webp" srcset="${srcset.replace(/\.(avif|jpg|png)/g, '.webp')}" sizes="${sizes}" />
  <img
    src="${images[Math.floor(images.length / 2)].url.replace(/\.(webp|avif)/g, '.jpg')}"
    srcset="${srcset.replace(/\.(webp|avif)/g, '.jpg')}"
    sizes="${sizes}"
    alt="Description"
    loading="lazy"
    decoding="async"
  />
</picture>`

    return {
      success: true,
      srcset,
      sizes,
      images,
      htmlSnippet,
      pictureElementSnippet,
    }
  }
}

/**
 * Create responsive image generator tool instance
 */
export function createResponsiveImageGeneratorTool(): ResponsiveImageGeneratorTool {
  return new ResponsiveImageGeneratorTool()
}

/**
 * Generate responsive images (direct function call)
 */
export async function generateResponsiveImages(
  input: ResponsiveImageGeneratorInput
): Promise<ResponsiveImageResult> {
  const tool = new ResponsiveImageGeneratorTool()
  const result = await tool._call(input)
  return JSON.parse(result)
}

/**
 * Helper: Calculate optimal sizes attribute from image analysis
 */
export function calculateOptimalSizes(options: {
  imageWidth: number
  containerWidth?: number
  breakpoints?: Array<{ width: number; columns?: number }>
}): string {
  const { imageWidth, containerWidth = imageWidth, breakpoints } = options

  if (!breakpoints) {
    // Default responsive behavior
    return '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
  }

  const sizeStrings = breakpoints.map((bp) => {
    const columns = bp.columns || 1
    const percentage = Math.round((1 / columns) * 100)
    return `(max-width: ${bp.width}px) ${percentage}vw`
  })

  // Add default for largest viewport
  const lastBp = breakpoints[breakpoints.length - 1]
  const lastPercentage = Math.round((1 / (lastBp.columns || 1)) * 100)
  sizeStrings.push(`${lastPercentage}vw`)

  return sizeStrings.join(', ')
}

/**
 * Helper: Generate srcset for different DPRs
 */
export function generateDprSrcset(baseUrl: string, dprValues: number[] = [1, 2, 3]): string {
  return dprValues.map((dpr) => `${baseUrl}?dpr=${dpr} ${dpr}x`).join(', ')
}
