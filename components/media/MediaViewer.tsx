/**
 * MediaViewer Component
 *
 * Image and video viewer with zoom, pan, and download functionality.
 *
 * Features:
 * - Support for images and videos
 * - Zoom with mouse wheel
 * - Pan when zoomed
 * - Keyboard controls
 * - Download button
 * - Full accessibility
 *
 * @example
 * ```tsx
 * <MediaViewer
 *   src="/image.jpg"
 *   alt="Description"
 *   type="image"
 *   downloadable
 * />
 * ```
 */

import React, { useState, useRef, useEffect } from 'react'

export type MediaType = 'image' | 'video'

export interface MediaViewerProps {
  /**
   * Media source URL
   */
  src: string

  /**
   * Media type
   */
  type: MediaType

  /**
   * Alt text for images
   */
  alt?: string

  /**
   * Title/caption
   */
  title?: string

  /**
   * Allow download
   */
  downloadable?: boolean

  /**
   * Download filename
   */
  downloadFilename?: string

  /**
   * Show controls for video
   */
  videoControls?: boolean

  /**
   * Auto-play video
   */
  videoAutoPlay?: boolean

  /**
   * Loop video
   */
  videoLoop?: boolean

  /**
   * Muted video
   */
  videoMuted?: boolean

  /**
   * Custom class name
   */
  className?: string

  /**
   * Maximum zoom level
   */
  maxZoom?: number

  /**
   * Minimum zoom level
   */
  minZoom?: number

  /**
   * Close handler
   */
  onClose?: () => void
}

export const MediaViewer: React.FC<MediaViewerProps> = ({
  src,
  type,
  alt = '',
  title,
  downloadable = true,
  downloadFilename,
  videoControls = true,
  videoAutoPlay = false,
  videoLoop = false,
  videoMuted = false,
  className,
  maxZoom = 5,
  minZoom = 1,
  onClose
}) => {
  const [zoom, setZoom] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const dragStart = useRef({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  // Reset zoom and position when src changes
  useEffect(() => {
    setZoom(1)
    setPosition({ x: 0, y: 0 })
  }, [src])

  const handleZoomIn = () => {
    setZoom(z => Math.min(z + 0.5, maxZoom))
  }

  const handleZoomOut = () => {
    setZoom(z => {
      const newZoom = Math.max(z - 0.5, minZoom)
      if (newZoom === minZoom) {
        setPosition({ x: 0, y: 0 })
      }
      return newZoom
    })
  }

  const handleWheel = (e: React.WheelEvent) => {
    if (type === 'image') {
      e.preventDefault()
      const delta = e.deltaY > 0 ? -0.2 : 0.2
      setZoom(z => {
        const newZoom = Math.max(minZoom, Math.min(z + delta, maxZoom))
        if (newZoom === minZoom) {
          setPosition({ x: 0, y: 0 })
        }
        return newZoom
      })
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > minZoom && type === 'image') {
      setIsDragging(true)
      dragStart.current = {
        x: e.clientX - position.x,
        y: e.clientY - position.y
      }
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > minZoom) {
      setPosition({
        x: e.clientX - dragStart.current.x,
        y: e.clientY - dragStart.current.y
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleDownload = async () => {
    try {
      const response = await fetch(src)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = downloadFilename || src.split('/').pop() || 'download'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Download failed:', error)
    }
  }

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (type === 'image') {
        switch (e.key) {
          case '+':
          case '=':
            e.preventDefault()
            handleZoomIn()
            break
          case '-':
          case '_':
            e.preventDefault()
            handleZoomOut()
            break
          case 'Escape':
            if (onClose) {
              e.preventDefault()
              onClose()
            }
            break
          case '0':
            e.preventDefault()
            setZoom(1)
            setPosition({ x: 0, y: 0 })
            break
        }
      } else if (e.key === 'Escape' && onClose) {
        e.preventDefault()
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [type, onClose])

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        backgroundColor: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
      }}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      role="region"
      aria-label="Media viewer"
    >
      {/* Controls */}
      <div
        style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          display: 'flex',
          gap: '8px',
          zIndex: 10
        }}
      >
        {/* Zoom controls (images only) */}
        {type === 'image' && (
          <>
            <button
              onClick={handleZoomOut}
              disabled={zoom <= minZoom}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                color: '#000',
                fontSize: '20px',
                cursor: zoom <= minZoom ? 'not-allowed' : 'pointer',
                opacity: zoom <= minZoom ? 0.5 : 1
              }}
              aria-label="Zoom out"
            >
              −
            </button>
            <button
              onClick={handleZoomIn}
              disabled={zoom >= maxZoom}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                color: '#000',
                fontSize: '20px',
                cursor: zoom >= maxZoom ? 'not-allowed' : 'pointer',
                opacity: zoom >= maxZoom ? 0.5 : 1
              }}
              aria-label="Zoom in"
            >
              +
            </button>
          </>
        )}

        {/* Download button */}
        {downloadable && (
          <button
            onClick={handleDownload}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              color: '#000',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            aria-label="Download"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </button>
        )}

        {/* Close button */}
        {onClose && (
          <button
            onClick={onClose}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              color: '#000',
              fontSize: '24px',
              cursor: 'pointer'
            }}
            aria-label="Close"
          >
            ×
          </button>
        )}
      </div>

      {/* Media content */}
      <div
        style={{
          maxWidth: '100%',
          maxHeight: '100%',
          cursor: isDragging ? 'grabbing' : zoom > minZoom && type === 'image' ? 'grab' : 'default'
        }}
      >
        {type === 'image' ? (
          <img
            src={src}
            alt={alt}
            style={{
              maxWidth: zoom === minZoom ? '100%' : 'none',
              maxHeight: zoom === minZoom ? '100%' : 'none',
              transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
              transition: isDragging ? 'none' : 'transform 0.3s ease',
              display: 'block',
              userSelect: 'none'
            }}
            draggable={false}
          />
        ) : (
          <video
            src={src}
            controls={videoControls}
            autoPlay={videoAutoPlay}
            loop={videoLoop}
            muted={videoMuted}
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              display: 'block'
            }}
          >
            Your browser does not support the video tag.
          </video>
        )}
      </div>

      {/* Title */}
      {title && (
        <div
          style={{
            position: 'absolute',
            bottom: '16px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '8px',
            maxWidth: '80%',
            textAlign: 'center',
            fontSize: '14px'
          }}
        >
          {title}
        </div>
      )}

      {/* Zoom indicator (images only) */}
      {type === 'image' && zoom > minZoom && (
        <div
          style={{
            position: 'absolute',
            bottom: '16px',
            right: '16px',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            padding: '4px 12px',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: 600
          }}
          aria-live="polite"
        >
          {Math.round(zoom * 100)}%
        </div>
      )}

      {/* Instructions */}
      {type === 'image' && (
        <div
          style={{
            position: 'absolute',
            top: '16px',
            left: '16px',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '8px',
            fontSize: '12px',
            opacity: 0.7
          }}
        >
          {zoom > minZoom ? 'Drag to pan' : 'Scroll or use +/- to zoom'}
        </div>
      )}
    </div>
  )
}

export default MediaViewer
