/**
 * Icon Component
 *
 * Universal icon component supporting multiple icon libraries (Heroicons, Lucide, Font Awesome).
 * Provides consistent API with size variants, colors, and full accessibility support.
 *
 * @example
 * ```tsx
 * // Heroicons
 * <Icon name="heart" library="heroicons" variant="solid" size="md" />
 *
 * // Lucide
 * <Icon name="heart" library="lucide" size="lg" color="#e53e3e" />
 *
 * // Font Awesome
 * <Icon name="heart" library="font-awesome" style="solid" size="xl" />
 * ```
 */

import React, { useEffect, useState } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

export type IconLibrary = 'heroicons' | 'lucide' | 'font-awesome'
export type HeroiconsVariant = 'outline' | 'solid'
export type FontAwesomeStyle = 'solid' | 'regular' | 'brands'

const iconVariants = cva('inline-flex items-center justify-center', {
  variants: {
    size: {
      xs: 'w-3 h-3',
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6',
      xl: 'w-8 h-8',
      '2xl': 'w-10 h-10'
    }
  },
  defaultVariants: {
    size: 'md'
  }
})

export interface IconProps extends VariantProps<typeof iconVariants> {
  /** Icon name */
  name: string

  /** Icon library */
  library: IconLibrary

  /** Heroicons variant (for heroicons library) */
  variant?: HeroiconsVariant

  /** Font Awesome style (for font-awesome library) */
  style?: FontAwesomeStyle

  /** Icon color (CSS color value) */
  color?: string

  /** Stroke width (for Lucide) */
  strokeWidth?: number

  /** Additional CSS class */
  className?: string

  /** Accessibility label */
  ariaLabel?: string

  /** Accessibility description */
  ariaDescription?: string

  /** Click handler */
  onClick?: () => void
}

/**
 * Universal Icon component
 */
export const Icon = React.forwardRef<HTMLSpanElement, IconProps>(
  (
    {
      name,
      library,
      variant = 'outline',
      style = 'solid',
      size = 'md',
      color,
      strokeWidth = 2,
      className,
      ariaLabel,
      ariaDescription,
      onClick
    },
    ref
  ) => {
    const [svgContent, setSvgContent] = useState<string>('')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Get numeric size from variant
    const getSizeInPixels = (): number => {
      const sizeMap: Record<string, number> = {
        xs: 12,
        sm: 16,
        md: 20,
        lg: 24,
        xl: 32,
        '2xl': 40
      }
      return sizeMap[size || 'md'] || 20
    }

    useEffect(() => {
      let isMounted = true

      const fetchIcon = async () => {
        setLoading(true)
        setError(null)

        try {
          let svg = ''

          switch (library) {
            case 'heroicons': {
              // Fetch from Heroicons
              const sizeStr = getSizeInPixels() <= 20 ? '20' : '24'
              const url = `https://raw.githubusercontent.com/tailwindlabs/heroicons/master/src/${sizeStr}/${variant}/${name}.svg`
              const response = await fetch(url)

              if (!response.ok) {
                throw new Error(`Icon not found: ${name}`)
              }

              svg = await response.text()
              break
            }

            case 'lucide': {
              // Fetch from Lucide CDN
              const url = `https://cdn.jsdelivr.net/npm/lucide-static@latest/icons/${name}.svg`
              const response = await fetch(url)

              if (!response.ok) {
                throw new Error(`Icon not found: ${name}`)
              }

              svg = await response.text()

              // Customize Lucide SVG
              svg = svg.replace(/width="[^"]*"/, `width="${getSizeInPixels()}"`)
              svg = svg.replace(/height="[^"]*"/, `height="${getSizeInPixels()}"`)
              svg = svg.replace(/stroke-width="[^"]*"/, `stroke-width="${strokeWidth}"`)

              if (color) {
                svg = svg.replace(/stroke="[^"]*"/, `stroke="${color}"`)
              }
              break
            }

            case 'font-awesome': {
              // Fetch from Font Awesome CDN
              const stylePath = style === 'brands' ? 'brands' : style
              const url = `https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.5.1/svgs/${stylePath}/${name}.svg`
              const response = await fetch(url)

              if (!response.ok) {
                throw new Error(`Icon not found: ${name}`)
              }

              svg = await response.text()

              // Customize Font Awesome SVG
              if (color) {
                svg = svg.replace(/fill="[^"]*"/, `fill="${color}"`)
              }
              break
            }

            default:
              throw new Error(`Unknown icon library: ${library}`)
          }

          // Add currentColor support
          if (!color) {
            svg = svg.replace(/stroke="[^"]*"/g, 'stroke="currentColor"')
            svg = svg.replace(/fill="[^"]*"/g, 'fill="currentColor"')
          }

          if (isMounted) {
            setSvgContent(svg)
            setError(null)
          }
        } catch (err) {
          if (isMounted) {
            setError(err instanceof Error ? err.message : 'Failed to load icon')
            setSvgContent('')
          }
        } finally {
          if (isMounted) {
            setLoading(false)
          }
        }
      }

      fetchIcon()

      return () => {
        isMounted = false
      }
    }, [name, library, variant, style, size, color, strokeWidth])

    // Render loading state
    if (loading) {
      return (
        <span
          ref={ref}
          className={iconVariants({ size, className })}
          role="status"
          aria-label="Loading icon"
        >
          <svg
            className="animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </span>
      )
    }

    // Render error state
    if (error) {
      return (
        <span
          ref={ref}
          className={iconVariants({ size, className })}
          role="img"
          aria-label={ariaLabel || `Error: ${error}`}
          title={error}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </span>
      )
    }

    // Render icon
    return (
      <span
        ref={ref}
        className={iconVariants({ size, className })}
        role="img"
        aria-label={ariaLabel || name}
        aria-describedby={ariaDescription ? `${name}-desc` : undefined}
        onClick={onClick}
        style={{ cursor: onClick ? 'pointer' : 'default' }}
        dangerouslySetInnerHTML={{ __html: svgContent }}
      />
    )
  }
)

Icon.displayName = 'Icon'
