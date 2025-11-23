/**
 * Font Pairing Tool
 *
 * LangChain tool for suggesting font combinations based on typography principles.
 * Provides heading and body font pairings with reasoning.
 *
 * @example
 * ```typescript
 * import { FontPairingTool } from './font-pairing-tool'
 *
 * const tool = new FontPairingTool()
 * const result = await tool._call('Montserrat')
 * ```
 */

import { Tool } from 'langchain/tools'

export interface FontPairing {
  heading: string
  body: string
  reason: string
  contrast: 'high' | 'medium' | 'low'
  category: {
    heading: string
    body: string
  }
}

export interface FontPairingResult {
  primaryFont: string
  pairings: FontPairing[]
  principles: string[]
}

/**
 * Font Pairing Tool for LangChain
 */
export class FontPairingTool extends Tool {
  name = 'font_pairing'
  description = `Suggest font pairings for typography design.
Input should be a font name (e.g., "Montserrat", "Roboto").
Returns suggested heading and body font combinations with explanations.`

  async _call(fontName: string): Promise<string> {
    try {
      const result = this.generatePairings(fontName.trim())
      return JSON.stringify(result, null, 2)
    } catch (error) {
      return `Error generating font pairings: ${error instanceof Error ? error.message : String(error)}`
    }
  }

  /**
   * Generate font pairings for a given font
   */
  private generatePairings(fontName: string): FontPairingResult {
    const font = this.getFontInformation(fontName)

    const pairings: FontPairing[] = []

    // Generate pairings based on font category
    switch (font.category) {
      case 'sans-serif':
        pairings.push(
          {
            heading: fontName,
            body: 'Merriweather',
            reason:
              'Modern sans-serif heading with elegant serif body creates strong hierarchy and readability',
            contrast: 'high',
            category: { heading: 'sans-serif', body: 'serif' }
          },
          {
            heading: fontName,
            body: 'Lora',
            reason:
              'Clean geometric sans paired with warm serif balances professionalism with approachability',
            contrast: 'high',
            category: { heading: 'sans-serif', body: 'serif' }
          },
          {
            heading: fontName,
            body: fontName,
            reason:
              'Same family pairing with weight contrast (bold heading, regular body) ensures consistency',
            contrast: 'low',
            category: { heading: 'sans-serif', body: 'sans-serif' }
          },
          {
            heading: fontName,
            body: 'Georgia',
            reason: 'Modern sans with classic web-safe serif provides reliability and performance',
            contrast: 'high',
            category: { heading: 'sans-serif', body: 'serif' }
          }
        )
        break

      case 'serif':
        pairings.push(
          {
            heading: fontName,
            body: 'Open Sans',
            reason:
              'Traditional serif heading with clean humanist sans body creates elegant yet readable design',
            contrast: 'high',
            category: { heading: 'serif', body: 'sans-serif' }
          },
          {
            heading: fontName,
            body: 'Roboto',
            reason:
              'Classic serif paired with modern geometric sans balances tradition with contemporary feel',
            contrast: 'high',
            category: { heading: 'serif', body: 'sans-serif' }
          },
          {
            heading: fontName,
            body: 'Inter',
            reason:
              'Elegant serif with functional sans-serif optimizes both style and screen readability',
            contrast: 'high',
            category: { heading: 'serif', body: 'sans-serif' }
          },
          {
            heading: fontName,
            body: fontName,
            reason: 'Same family with size and weight contrast maintains typographic harmony',
            contrast: 'low',
            category: { heading: 'serif', body: 'serif' }
          }
        )
        break

      case 'display':
        pairings.push(
          {
            heading: fontName,
            body: 'Open Sans',
            reason:
              'Distinctive display heading with neutral sans body keeps focus on content while making impact',
            contrast: 'high',
            category: { heading: 'display', body: 'sans-serif' }
          },
          {
            heading: fontName,
            body: 'Roboto',
            reason:
              'Bold display paired with clean geometric sans creates modern, attention-grabbing design',
            contrast: 'high',
            category: { heading: 'display', body: 'sans-serif' }
          },
          {
            heading: fontName,
            body: 'Merriweather',
            reason:
              'Expressive display with readable serif balances personality with professionalism',
            contrast: 'high',
            category: { heading: 'display', body: 'serif' }
          }
        )
        break

      case 'monospace':
        pairings.push(
          {
            heading: 'Inter',
            body: fontName,
            reason:
              'Clean sans heading with monospace body ideal for technical documentation and code',
            contrast: 'medium',
            category: { heading: 'sans-serif', body: 'monospace' }
          },
          {
            heading: fontName,
            body: 'Inter',
            reason:
              'Monospace heading with professional sans body creates technical yet accessible feel',
            contrast: 'medium',
            category: { heading: 'monospace', body: 'sans-serif' }
          },
          {
            heading: fontName,
            body: fontName,
            reason:
              'Consistent monospace with size contrast perfect for developer-focused interfaces',
            contrast: 'low',
            category: { heading: 'monospace', body: 'monospace' }
          }
        )
        break

      default:
        // Generic pairings
        pairings.push(
          {
            heading: fontName,
            body: 'Open Sans',
            reason: 'Versatile pairing with widely-compatible fonts',
            contrast: 'medium',
            category: { heading: font.category, body: 'sans-serif' }
          },
          {
            heading: fontName,
            body: 'Roboto',
            reason: 'Modern pairing with excellent readability',
            contrast: 'medium',
            category: { heading: font.category, body: 'sans-serif' }
          }
        )
    }

    return {
      primaryFont: fontName,
      pairings,
      principles: [
        'Contrast: Pair fonts from different categories (serif + sans-serif) for visual hierarchy',
        'Similarity: Or use same family with weight/size variation for harmony',
        'Mood: Match font personality to brand and content tone',
        'Readability: Prioritize legibility for body text, allow more style in headings',
        'Hierarchy: Create clear visual distinction between heading and body sizes',
        'Simplicity: Limit to 2-3 font families per design'
      ]
    }
  }

  /**
   * Get font information
   */
  private getFontInformation(fontName: string): { name: string; category: string } {
    // Font database (simplified)
    const fonts: Record<string, string> = {
      // Sans-serif
      roboto: 'sans-serif',
      'open sans': 'sans-serif',
      lato: 'sans-serif',
      montserrat: 'sans-serif',
      inter: 'sans-serif',
      poppins: 'sans-serif',
      raleway: 'sans-serif',
      ubuntu: 'sans-serif',
      nunito: 'sans-serif',
      'work sans': 'sans-serif',

      // Serif
      merriweather: 'serif',
      'playfair display': 'serif',
      lora: 'serif',
      'pt serif': 'serif',
      'crimson text': 'serif',
      'libre baskerville': 'serif',
      'source serif pro': 'serif',
      'eb garamond': 'serif',
      cormorant: 'serif',
      georgia: 'serif',

      // Display
      'bebas neue': 'display',
      pacifico: 'display',
      lobster: 'display',
      righteous: 'display',
      'abril fatface': 'display',

      // Monospace
      'source code pro': 'monospace',
      'roboto mono': 'monospace',
      'fira code': 'monospace',
      'jetbrains mono': 'monospace',
      'courier new': 'monospace'
    }

    const normalizedName = fontName.toLowerCase()
    const category = fonts[normalizedName] || 'sans-serif'

    return {
      name: fontName,
      category
    }
  }
}

/**
 * Create font pairing tool
 */
export function createFontPairingTool(): FontPairingTool {
  return new FontPairingTool()
}
