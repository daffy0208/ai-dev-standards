/**
 * Optimized Image Component
 *
 * High-performance image component with lazy loading, responsive srcset,
 * blur placeholders, and error handling.
 *
 * Features:
 * - Lazy loading with IntersectionObserver
 * - Responsive images with srcset and sizes
 * - Blur placeholder while loading
 * - Error fallback
 * - Accessibility support
 * - TypeScript types
 *
 * @example
 * ```tsx
 * <Image
 *   src="/images/photo.jpg"
 *   alt="Description"
 *   width={800}
 *   height={600}
 *   srcSet="/images/photo-400.jpg 400w, /images/photo-800.jpg 800w"
 *   sizes="(max-width: 768px) 100vw, 800px"
 *   placeholder="/images/photo-blur.jpg"
 *   loading="lazy"
 * />
 * ```
 */

import React, { useState, useRef, useEffect } from 'react'

export interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  /**
   * Image source URL
   */
  src: string

  /**
   * Alt text (required for accessibility)
   */
  alt: string

  /**
   * Width in pixels
   */
  width?: number

  /**
   * Height in pixels
   */
  height?: number

  /**
   * Responsive srcset
   */
  srcSet?: string

  /**
   * Sizes attribute for responsive images
   */
  sizes?: string

  /**
   * Blur placeholder URL
   */
  placeholder?: string

  /**
   * Loading strategy
   */
  loading?: 'lazy' | 'eager'

  /**
   * Decode strategy
   */
  decoding?: 'async' | 'sync' | 'auto'

  /**
   * Object fit
   */
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down'

  /**
   * Object position
   */
  objectPosition?: string

  /**
   * Fallback image URL on error
   */
  fallback?: string

  /**
   * Callback when image loads
   */
  onLoad?: (event: React.SyntheticEvent<HTMLImageElement>) => void

  /**
   * Callback when image errors
   */
  onError?: (event: React.SyntheticEvent<HTMLImageElement>) => void

  /**
   * Custom class name
   */
  className?: string

  /**
   * Aspect ratio (e.g., '16/9', '4/3')
   */
  aspectRatio?: string
}

export const Image = React.forwardRef<HTMLImageElement, ImageProps>(
  (
    {
      src,
      alt,
      width,
      height,
      srcSet,
      sizes,
      placeholder,
      loading = 'lazy',
      decoding = 'async',
      objectFit = 'cover',
      objectPosition,
      fallback,
      onLoad,
      onError,
      className,
      aspectRatio,
      style,
      ...props
    },
    ref
  ) => {
    const [loaded, setLoaded] = useState(false)
    const [error, setError] = useState(false)
    const [shouldLoad, setShouldLoad] = useState(loading === 'eager')
    const imgRef = useRef<HTMLImageElement | null>(null)
    const observerRef = useRef<IntersectionObserver | null>(null)

    // Lazy loading with IntersectionObserver
    useEffect(() => {
      if (loading === 'lazy' && imgRef.current && !shouldLoad) {
        observerRef.current = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                setShouldLoad(true)
                observerRef.current?.disconnect()
              }
            })
          },
          {
            rootMargin: '50px', // Start loading 50px before entering viewport
          }
        )

        observerRef.current.observe(imgRef.current)

        return () => {
          observerRef.current?.disconnect()
        }
      }
    }, [loading, shouldLoad])

    const handleLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
      setLoaded(true)
      setError(false)
      onLoad?.(event)
    }

    const handleError = (event: React.SyntheticEvent<HTMLImageElement>) => {
      setError(true)
      setLoaded(false)
      onError?.(event)

      // Try fallback image
      if (fallback && event.currentTarget.src !== fallback) {
        event.currentTarget.src = fallback
      }
    }

    const setRefs = (element: HTMLImageElement | null) => {
      imgRef.current = element
      if (typeof ref === 'function') {
        ref(element)
      } else if (ref) {
        ref.current = element
      }
    }

    const imageStyle: React.CSSProperties = {
      objectFit,
      objectPosition,
      aspectRatio,
      opacity: loaded ? 1 : 0,
      transition: 'opacity 0.3s ease-in-out',
      ...style,
    }

    const wrapperStyle: React.CSSProperties = {
      position: 'relative',
      width: width ? `${width}px` : '100%',
      height: height ? `${height}px` : 'auto',
      aspectRatio: aspectRatio || (width && height ? `${width}/${height}` : undefined),
      overflow: 'hidden',
    }

    return (
      <div style={wrapperStyle} className={className}>
        {/* Blur placeholder */}
        {placeholder && !loaded && !error && (
          <img
            src={placeholder}
            alt=""
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit,
              objectPosition,
              filter: 'blur(10px)',
              transform: 'scale(1.1)', // Slightly larger to hide blur edges
            }}
          />
        )}

        {/* Main image */}
        {shouldLoad && !error && (
          <img
            ref={setRefs}
            src={src}
            alt={alt}
            width={width}
            height={height}
            srcSet={srcSet}
            sizes={sizes}
            loading={loading}
            decoding={decoding}
            onLoad={handleLoad}
            onError={handleError}
            style={imageStyle}
            {...props}
          />
        )}

        {/* Error fallback */}
        {error && !fallback && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#f3f4f6',
              color: '#6b7280',
            }}
            role="img"
            aria-label={alt}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </div>
        )}

        {/* Loading placeholder */}
        {!shouldLoad && (
          <div
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: '#f3f4f6',
            }}
            aria-hidden="true"
          />
        )}
      </div>
    )
  }
)

Image.displayName = 'Image'

export default Image
