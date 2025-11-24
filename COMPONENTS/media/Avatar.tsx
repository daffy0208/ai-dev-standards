/**
 * Avatar Component
 *
 * User avatar component with image, initials fallback, and status indicator.
 *
 * Features:
 * - Image with fallback to initials
 * - Size variants (xs, sm, md, lg, xl)
 * - Status indicator (online, offline, busy, away)
 * - Accessibility support
 * - Customizable colors
 *
 * @example
 * ```tsx
 * <Avatar
 *   src="/avatar.jpg"
 *   alt="John Doe"
 *   name="John Doe"
 *   size="md"
 *   status="online"
 * />
 * ```
 */

import React, { useState } from 'react'

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
export type AvatarStatus = 'online' | 'offline' | 'busy' | 'away'

export interface AvatarProps {
  /**
   * Image source URL
   */
  src?: string

  /**
   * Alt text (required for accessibility)
   */
  alt: string

  /**
   * User name (used for initials fallback)
   */
  name?: string

  /**
   * Size variant
   */
  size?: AvatarSize

  /**
   * Status indicator
   */
  status?: AvatarStatus

  /**
   * Custom background color for initials
   */
  backgroundColor?: string

  /**
   * Custom text color for initials
   */
  textColor?: string

  /**
   * Custom class name
   */
  className?: string

  /**
   * Click handler
   */
  onClick?: () => void
}

const sizeMap: Record<AvatarSize, { size: number; fontSize: number; statusSize: number }> = {
  xs: { size: 24, fontSize: 10, statusSize: 6 },
  sm: { size: 32, fontSize: 12, statusSize: 8 },
  md: { size: 48, fontSize: 16, statusSize: 12 },
  lg: { size: 64, fontSize: 24, statusSize: 14 },
  xl: { size: 96, fontSize: 32, statusSize: 18 }
}

const statusColors: Record<AvatarStatus, string> = {
  online: '#10b981', // green
  offline: '#6b7280', // gray
  busy: '#ef4444', // red
  away: '#f59e0b' // yellow
}

/**
 * Generate initials from name
 */
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase()
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

/**
 * Generate consistent color from string
 */
function stringToColor(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }

  const colors = [
    '#ef4444', // red
    '#f59e0b', // amber
    '#10b981', // green
    '#3b82f6', // blue
    '#6366f1', // indigo
    '#8b5cf6', // purple
    '#ec4899', // pink
    '#06b6d4' // cyan
  ]

  return colors[Math.abs(hash) % colors.length]
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  name,
  size = 'md',
  status,
  backgroundColor,
  textColor = '#ffffff',
  className,
  onClick
}) => {
  const [imageError, setImageError] = useState(false)
  const { size: pixelSize, fontSize, statusSize } = sizeMap[size]

  const showInitials = !src || imageError
  const initials = name ? getInitials(name) : alt.substring(0, 2).toUpperCase()
  const bgColor = backgroundColor || (name ? stringToColor(name) : '#6b7280')

  const handleImageError = () => {
    setImageError(true)
  }

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onClick()
              }
            }
          : undefined
      }
    >
      {/* Avatar circle */}
      <div
        style={{
          width: `${pixelSize}px`,
          height: `${pixelSize}px`,
          borderRadius: '50%',
          overflow: 'hidden',
          backgroundColor: showInitials ? bgColor : '#f3f4f6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: textColor,
          fontSize: `${fontSize}px`,
          fontWeight: 600,
          cursor: onClick ? 'pointer' : 'default',
          transition: 'transform 0.2s'
        }}
        onMouseEnter={e => {
          if (onClick) {
            e.currentTarget.style.transform = 'scale(1.05)'
          }
        }}
        onMouseLeave={e => {
          if (onClick) {
            e.currentTarget.style.transform = 'scale(1)'
          }
        }}
      >
        {showInitials ? (
          <span aria-hidden="true">{initials}</span>
        ) : (
          <img
            src={src}
            alt={alt}
            onError={handleImageError}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
        )}
      </div>

      {/* Status indicator */}
      {status && (
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: `${statusSize}px`,
            height: `${statusSize}px`,
            borderRadius: '50%',
            backgroundColor: statusColors[status],
            border: '2px solid white',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}
          role="status"
          aria-label={`Status: ${status}`}
        />
      )}

      {/* Screen reader text */}
      <span style={{ position: 'absolute', left: '-10000px' }}>{alt}</span>
    </div>
  )
}

export default Avatar
