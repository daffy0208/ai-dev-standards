/**
 * Carousel Component
 *
 * Image/content carousel with auto-play, touch swipe, and keyboard navigation.
 *
 * Features:
 * - Auto-play with pause on hover
 * - Dot indicators and prev/next buttons
 * - Touch swipe support
 * - Keyboard navigation
 * - Accessibility support
 * - Customizable transition duration
 *
 * @example
 * ```tsx
 * <Carousel
 *   items={[
 *     { src: '/image1.jpg', alt: 'Slide 1', caption: 'Caption 1' },
 *     { src: '/image2.jpg', alt: 'Slide 2', caption: 'Caption 2' }
 *   ]}
 *   autoPlay
 *   interval={5000}
 * />
 * ```
 */

import React, { useState, useEffect, useRef, useCallback } from 'react'

export interface CarouselItem {
  /**
   * Image source URL or custom content
   */
  src?: string

  /**
   * Alt text for image
   */
  alt?: string

  /**
   * Caption text
   */
  caption?: string

  /**
   * Custom content (instead of image)
   */
  content?: React.ReactNode

  /**
   * Click handler
   */
  onClick?: () => void
}

export interface CarouselProps {
  /**
   * Array of carousel items
   */
  items: CarouselItem[]

  /**
   * Auto-play carousel
   */
  autoPlay?: boolean

  /**
   * Interval between slides in ms
   */
  interval?: number

  /**
   * Transition duration in ms
   */
  transitionDuration?: number

  /**
   * Show navigation arrows
   */
  showArrows?: boolean

  /**
   * Show dot indicators
   */
  showDots?: boolean

  /**
   * Pause on hover
   */
  pauseOnHover?: boolean

  /**
   * Infinite loop
   */
  loop?: boolean

  /**
   * Custom class name
   */
  className?: string

  /**
   * Height of carousel
   */
  height?: string | number

  /**
   * Callback when slide changes
   */
  onSlideChange?: (index: number) => void
}

export const Carousel: React.FC<CarouselProps> = ({
  items,
  autoPlay = false,
  interval = 5000,
  transitionDuration = 500,
  showArrows = true,
  showDots = true,
  pauseOnHover = true,
  loop = true,
  className,
  height = '400px',
  onSlideChange
}) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const goToSlide = useCallback(
    (index: number) => {
      if (loop) {
        setCurrentIndex((index + items.length) % items.length)
      } else {
        setCurrentIndex(Math.max(0, Math.min(index, items.length - 1)))
      }
      onSlideChange?.(index)
    },
    [items.length, loop, onSlideChange]
  )

  const nextSlide = useCallback(() => {
    if (loop || currentIndex < items.length - 1) {
      goToSlide(currentIndex + 1)
    }
  }, [currentIndex, items.length, loop, goToSlide])

  const prevSlide = useCallback(() => {
    if (loop || currentIndex > 0) {
      goToSlide(currentIndex - 1)
    }
  }, [currentIndex, loop, goToSlide])

  // Auto-play
  useEffect(() => {
    if (autoPlay && !isHovered) {
      timerRef.current = setInterval(() => {
        nextSlide()
      }, interval)

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current)
        }
      }
    }
  }, [autoPlay, interval, isHovered, nextSlide])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        prevSlide()
      } else if (e.key === 'ArrowRight') {
        nextSlide()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [nextSlide, prevSlide])

  // Touch swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.touches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 50) {
      // Swipe left
      nextSlide()
    }

    if (touchStart - touchEnd < -50) {
      // Swipe right
      prevSlide()
    }
  }

  const handleMouseEnter = () => {
    if (pauseOnHover) {
      setIsHovered(true)
    }
  }

  const handleMouseLeave = () => {
    if (pauseOnHover) {
      setIsHovered(false)
    }
  }

  const canGoPrev = loop || currentIndex > 0
  const canGoNext = loop || currentIndex < items.length - 1

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        width: '100%',
        height: typeof height === 'number' ? `${height}px` : height,
        overflow: 'hidden'
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      role="region"
      aria-label="Carousel"
      aria-live="polite"
    >
      {/* Slides */}
      <div
        style={{
          display: 'flex',
          height: '100%',
          transform: `translateX(-${currentIndex * 100}%)`,
          transition: `transform ${transitionDuration}ms ease-in-out`
        }}
      >
        {items.map((item, index) => (
          <div
            key={index}
            style={{
              minWidth: '100%',
              height: '100%',
              position: 'relative'
            }}
            aria-hidden={index !== currentIndex}
          >
            {item.content ? (
              item.content
            ) : (
              <img
                src={item.src}
                alt={item.alt || `Slide ${index + 1}`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  cursor: item.onClick ? 'pointer' : 'default'
                }}
                onClick={item.onClick}
              />
            )}

            {/* Caption */}
            {item.caption && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '20px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'rgba(0, 0, 0, 0.7)',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  maxWidth: '80%',
                  textAlign: 'center'
                }}
              >
                {item.caption}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Previous button */}
      {showArrows && canGoPrev && (
        <button
          onClick={prevSlide}
          style={{
            position: 'absolute',
            left: '20px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'rgba(255, 255, 255, 0.9)',
            border: 'none',
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            cursor: 'pointer',
            fontSize: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
            zIndex: 10,
            transition: 'background 0.2s'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 1)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)'
          }}
          aria-label="Previous slide"
        >
          ‹
        </button>
      )}

      {/* Next button */}
      {showArrows && canGoNext && (
        <button
          onClick={nextSlide}
          style={{
            position: 'absolute',
            right: '20px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'rgba(255, 255, 255, 0.9)',
            border: 'none',
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            cursor: 'pointer',
            fontSize: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
            zIndex: 10,
            transition: 'background 0.2s'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 1)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)'
          }}
          aria-label="Next slide"
        >
          ›
        </button>
      )}

      {/* Dot indicators */}
      {showDots && (
        <div
          style={{
            position: 'absolute',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '8px',
            zIndex: 10
          }}
          role="tablist"
          aria-label="Slide indicators"
        >
          {items.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                border: '2px solid white',
                background: index === currentIndex ? 'white' : 'transparent',
                cursor: 'pointer',
                padding: 0,
                transition: 'background 0.3s'
              }}
              role="tab"
              aria-selected={index === currentIndex}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Auto-play indicator */}
      {autoPlay && (
        <div
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'rgba(0, 0, 0, 0.5)',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            zIndex: 10
          }}
          aria-live="polite"
        >
          {isHovered ? 'Paused' : 'Auto-play'}
        </div>
      )}
    </div>
  )
}

export default Carousel
