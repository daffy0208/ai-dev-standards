/**
 * Gallery Component
 *
 * Image gallery with lightbox, grid layout, and keyboard navigation.
 *
 * Features:
 * - Grid layout with optional masonry
 * - Click to open lightbox
 * - Keyboard navigation (arrow keys, ESC)
 * - Zoom in/out
 * - Touch swipe support
 * - Full accessibility
 *
 * @example
 * ```tsx
 * <Gallery
 *   images={[
 *     { src: '/image1.jpg', alt: 'Description 1' },
 *     { src: '/image2.jpg', alt: 'Description 2' }
 *   ]}
 *   columns={3}
 *   gap={16}
 * />
 * ```
 */

import React, { useState, useEffect, useCallback, useRef } from 'react'

export interface GalleryImage {
  /**
   * Image source URL
   */
  src: string

  /**
   * Thumbnail URL (optional, uses src if not provided)
   */
  thumbnail?: string

  /**
   * Alt text
   */
  alt: string

  /**
   * Caption text
   */
  caption?: string

  /**
   * Width in pixels
   */
  width?: number

  /**
   * Height in pixels
   */
  height?: number
}

export interface GalleryProps {
  /**
   * Array of images to display
   */
  images: GalleryImage[]

  /**
   * Number of columns in grid
   */
  columns?: number

  /**
   * Gap between images in pixels
   */
  gap?: number

  /**
   * Layout type
   */
  layout?: 'grid' | 'masonry'

  /**
   * Custom class name
   */
  className?: string

  /**
   * Callback when image is clicked
   */
  onImageClick?: (index: number, image: GalleryImage) => void
}

export const Gallery: React.FC<GalleryProps> = ({
  images,
  columns = 3,
  gap = 16,
  layout = 'grid',
  className,
  onImageClick
}) => {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [zoom, setZoom] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const isDragging = useRef(false)
  const dragStart = useRef({ x: 0, y: 0 })
  const touchStart = useRef({ x: 0, y: 0 })

  const openLightbox = (index: number) => {
    setLightboxIndex(index)
    setZoom(1)
    setPosition({ x: 0, y: 0 })
    onImageClick?.(index, images[index])
  }

  const closeLightbox = () => {
    setLightboxIndex(null)
    setZoom(1)
    setPosition({ x: 0, y: 0 })
  }

  const nextImage = useCallback(() => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex + 1) % images.length)
      setZoom(1)
      setPosition({ x: 0, y: 0 })
    }
  }, [lightboxIndex, images.length])

  const prevImage = useCallback(() => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex - 1 + images.length) % images.length)
      setZoom(1)
      setPosition({ x: 0, y: 0 })
    }
  }, [lightboxIndex, images.length])

  const handleZoomIn = () => {
    setZoom(z => Math.min(z + 0.5, 3))
  }

  const handleZoomOut = () => {
    setZoom(z => Math.max(z - 0.5, 1))
    if (zoom <= 1) {
      setPosition({ x: 0, y: 0 })
    }
  }

  // Keyboard navigation
  useEffect(() => {
    if (lightboxIndex === null) return

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          closeLightbox()
          break
        case 'ArrowLeft':
          prevImage()
          break
        case 'ArrowRight':
          nextImage()
          break
        case '+':
        case '=':
          handleZoomIn()
          break
        case '-':
        case '_':
          handleZoomOut()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [lightboxIndex, nextImage, prevImage])

  // Mouse drag for panning
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      isDragging.current = true
      dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y }
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging.current && zoom > 1) {
      setPosition({
        x: e.clientX - dragStart.current.x,
        y: e.clientY - dragStart.current.y
      })
    }
  }

  const handleMouseUp = () => {
    isDragging.current = false
  }

  // Touch events for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    touchStart.current = { x: touch.clientX, y: touch.clientY }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touch = e.changedTouches[0]
    const deltaX = touch.clientX - touchStart.current.x
    const deltaY = Math.abs(touch.clientY - touchStart.current.y)

    // Swipe threshold
    if (Math.abs(deltaX) > 50 && deltaY < 50) {
      if (deltaX > 0) {
        prevImage()
      } else {
        nextImage()
      }
    }
  }

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gap: `${gap}px`
  }

  const masonryStyle: React.CSSProperties = {
    columnCount: columns,
    columnGap: `${gap}px`
  }

  const currentImage = lightboxIndex !== null ? images[lightboxIndex] : null

  return (
    <>
      {/* Gallery Grid */}
      <div style={layout === 'grid' ? gridStyle : masonryStyle} className={className}>
        {images.map((image, index) => (
          <div
            key={index}
            style={{
              cursor: 'pointer',
              overflow: 'hidden',
              borderRadius: '8px',
              marginBottom: layout === 'masonry' ? `${gap}px` : 0,
              breakInside: 'avoid'
            }}
            onClick={() => openLightbox(index)}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                openLightbox(index)
              }
            }}
            role="button"
            tabIndex={0}
            aria-label={`View ${image.alt}`}
          >
            <img
              src={image.thumbnail || image.src}
              alt={image.alt}
              style={{
                width: '100%',
                height: layout === 'grid' ? '100%' : 'auto',
                objectFit: 'cover',
                display: 'block',
                transition: 'transform 0.3s ease'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'scale(1.05)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'scale(1)'
              }}
            />
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {currentImage && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.95)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
          aria-label="Image lightbox"
        >
          {/* Close button */}
          <button
            onClick={closeLightbox}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              color: 'white',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              cursor: 'pointer',
              fontSize: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10001
            }}
            aria-label="Close lightbox"
          >
            ×
          </button>

          {/* Zoom controls */}
          <div
            style={{
              position: 'absolute',
              top: '20px',
              left: '20px',
              display: 'flex',
              gap: '8px',
              zIndex: 10001
            }}
          >
            <button
              onClick={e => {
                e.stopPropagation()
                handleZoomIn()
              }}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                color: 'white',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                cursor: 'pointer',
                fontSize: '20px'
              }}
              aria-label="Zoom in"
            >
              +
            </button>
            <button
              onClick={e => {
                e.stopPropagation()
                handleZoomOut()
              }}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                color: 'white',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                cursor: 'pointer',
                fontSize: '20px'
              }}
              aria-label="Zoom out"
            >
              −
            </button>
          </div>

          {/* Previous button */}
          {images.length > 1 && (
            <button
              onClick={e => {
                e.stopPropagation()
                prevImage()
              }}
              style={{
                position: 'absolute',
                left: '20px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                color: 'white',
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                cursor: 'pointer',
                fontSize: '24px',
                zIndex: 10001
              }}
              aria-label="Previous image"
            >
              ‹
            </button>
          )}

          {/* Next button */}
          {images.length > 1 && (
            <button
              onClick={e => {
                e.stopPropagation()
                nextImage()
              }}
              style={{
                position: 'absolute',
                right: '20px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                color: 'white',
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                cursor: 'pointer',
                fontSize: '24px',
                zIndex: 10001
              }}
              aria-label="Next image"
            >
              ›
            </button>
          )}

          {/* Image */}
          <div
            onClick={e => e.stopPropagation()}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            style={{
              cursor: zoom > 1 ? 'grab' : 'default',
              maxWidth: '90%',
              maxHeight: '90%',
              overflow: 'hidden'
            }}
          >
            <img
              src={currentImage.src}
              alt={currentImage.alt}
              style={{
                maxWidth: zoom === 1 ? '100%' : 'none',
                maxHeight: zoom === 1 ? '100%' : 'none',
                transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
                transition: isDragging.current ? 'none' : 'transform 0.3s ease',
                display: 'block'
              }}
            />
          </div>

          {/* Caption */}
          {currentImage.caption && (
            <div
              style={{
                position: 'absolute',
                bottom: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                color: 'white',
                background: 'rgba(0, 0, 0, 0.7)',
                padding: '12px 24px',
                borderRadius: '8px',
                maxWidth: '80%',
                textAlign: 'center'
              }}
            >
              {currentImage.caption}
            </div>
          )}

          {/* Counter */}
          {images.length > 1 && (
            <div
              style={{
                position: 'absolute',
                bottom: '20px',
                right: '20px',
                color: 'white',
                background: 'rgba(0, 0, 0, 0.7)',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '14px'
              }}
              aria-live="polite"
            >
              {lightboxIndex + 1} / {images.length}
            </div>
          )}
        </div>
      )}
    </>
  )
}

export default Gallery
