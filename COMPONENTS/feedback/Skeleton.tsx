/**
 * Skeleton Loading Components
 *
 * Content placeholders for better perceived performance.
 *
 * Features:
 * - Text skeleton
 * - Avatar skeleton
 * - Card skeleton
 * - Table skeleton
 * - Custom skeleton
 * - Animated shimmer effect
 *
 * Usage:
 * ```typescript
 * import { Skeleton, SkeletonCard, SkeletonTable } from './Skeleton'
 *
 * {loading ? <SkeletonCard /> : <UserCard data={user} />}
 * {loading ? <SkeletonTable rows={5} /> : <DataTable data={data} />}
 * ```
 */

'use client'

export interface SkeletonProps {
  className?: string
  width?: string | number
  height?: string | number
  circle?: boolean
  count?: number
}

/**
 * Base skeleton component
 */
export function Skeleton({
  className = '',
  width,
  height,
  circle = false
}: SkeletonProps) {
  const style: React.CSSProperties = {
    width: width ? (typeof width === 'number' ? `${width}px` : width) : undefined,
    height: height ? (typeof height === 'number' ? `${height}px` : height) : undefined
  }

  return (
    <div
      className={`bg-gray-200 animate-pulse ${circle ? 'rounded-full' : 'rounded'} ${className}`}
      style={style}
    />
  )
}

/**
 * Text skeleton (line)
 */
export function SkeletonText({
  lines = 1,
  className = ''
}: {
  lines?: number
  className?: string
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height={16}
          width={i === lines - 1 ? '80%' : '100%'}
        />
      ))}
    </div>
  )
}

/**
 * Avatar skeleton
 */
export function SkeletonAvatar({ size = 40 }: { size?: number }) {
  return <Skeleton width={size} height={size} circle />
}

/**
 * Card skeleton
 */
export function SkeletonCard({ hasImage = true }: { hasImage?: boolean }) {
  return (
    <div className="border rounded-lg p-4 space-y-4">
      {hasImage && <Skeleton height={200} className="rounded-lg" />}
      <div className="space-y-2">
        <Skeleton height={24} width="60%" />
        <SkeletonText lines={3} />
      </div>
      <div className="flex items-center gap-2">
        <SkeletonAvatar size={32} />
        <Skeleton height={16} width={100} />
      </div>
    </div>
  )
}

/**
 * Table skeleton
 */
export function SkeletonTable({
  rows = 5,
  columns = 4
}: {
  rows?: number
  columns?: number
}) {
  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} height={20} />
        ))}
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className="grid gap-4 py-3 border-t"
          style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} height={16} />
          ))}
        </div>
      ))}
    </div>
  )
}

/**
 * List skeleton
 */
export function SkeletonList({ items = 5 }: { items?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <SkeletonAvatar size={48} />
          <div className="flex-1 space-y-2">
            <Skeleton height={16} width="40%" />
            <Skeleton height={14} width="60%" />
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * Profile skeleton
 */
export function SkeletonProfile() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <SkeletonAvatar size={80} />
        <div className="flex-1 space-y-2">
          <Skeleton height={24} width={200} />
          <Skeleton height={16} width={150} />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="text-center space-y-2">
            <Skeleton height={32} width="100%" />
            <Skeleton height={16} width="80%" className="mx-auto" />
          </div>
        ))}
      </div>

      {/* Bio */}
      <SkeletonText lines={4} />
    </div>
  )
}

/**
 * Dashboard skeleton
 */
export function SkeletonDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton height={32} width={200} />
        <Skeleton height={40} width={120} />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="border rounded-lg p-4 space-y-3">
            <Skeleton height={16} width="60%" />
            <Skeleton height={32} width={100} />
            <Skeleton height={12} width="80%" />
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="border rounded-lg p-6">
        <Skeleton height={24} width={150} className="mb-4" />
        <Skeleton height={300} />
      </div>

      {/* Table */}
      <div className="border rounded-lg p-6">
        <Skeleton height={24} width={150} className="mb-4" />
        <SkeletonTable rows={5} columns={5} />
      </div>
    </div>
  )
}

/**
 * Form skeleton
 */
export function SkeletonForm({ fields = 5 }: { fields?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton height={16} width={100} />
          <Skeleton height={40} />
        </div>
      ))}
      <div className="flex gap-3 pt-4">
        <Skeleton height={40} width={120} />
        <Skeleton height={40} width={100} />
      </div>
    </div>
  )
}

/**
 * Comment skeleton
 */
export function SkeletonComment() {
  return (
    <div className="flex gap-3">
      <SkeletonAvatar size={40} />
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton height={16} width={120} />
          <Skeleton height={14} width={80} />
        </div>
        <SkeletonText lines={2} />
        <div className="flex gap-4">
          <Skeleton height={14} width={60} />
          <Skeleton height={14} width={60} />
        </div>
      </div>
    </div>
  )
}

/**
 * Blog post skeleton
 */
export function SkeletonBlogPost() {
  return (
    <article className="space-y-6">
      {/* Featured image */}
      <Skeleton height={400} className="rounded-lg" />

      {/* Title */}
      <Skeleton height={40} width="80%" />

      {/* Meta */}
      <div className="flex items-center gap-4">
        <SkeletonAvatar size={40} />
        <div className="space-y-2">
          <Skeleton height={16} width={150} />
          <Skeleton height={14} width={200} />
        </div>
      </div>

      {/* Content */}
      <div className="space-y-4">
        <SkeletonText lines={4} />
        <SkeletonText lines={5} />
        <SkeletonText lines={3} />
      </div>

      {/* Tags */}
      <div className="flex gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} height={24} width={80} className="rounded-full" />
        ))}
      </div>
    </article>
  )
}

/**
 * Shimmer effect (optional, more polished)
 */
export function SkeletonWithShimmer({
  className = '',
  width,
  height,
  circle = false
}: SkeletonProps) {
  const style: React.CSSProperties = {
    width: width ? (typeof width === 'number' ? `${width}px` : width) : undefined,
    height: height ? (typeof height === 'number' ? `${height}px` : height) : undefined
  }

  return (
    <div
      className={`relative overflow-hidden bg-gray-200 ${circle ? 'rounded-full' : 'rounded'} ${className}`}
      style={style}
    >
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/40 to-transparent" />
    </div>
  )
}

/**
 * Examples
 */
export function SkeletonExamples() {
  return (
    <div className="space-y-8 p-6">
      <div>
        <h3 className="font-medium mb-4">Basic Skeleton</h3>
        <Skeleton height={20} width={200} />
      </div>

      <div>
        <h3 className="font-medium mb-4">Text Lines</h3>
        <SkeletonText lines={3} />
      </div>

      <div>
        <h3 className="font-medium mb-4">Avatar</h3>
        <SkeletonAvatar size={64} />
      </div>

      <div>
        <h3 className="font-medium mb-4">Card</h3>
        <SkeletonCard />
      </div>

      <div>
        <h3 className="font-medium mb-4">List</h3>
        <SkeletonList items={3} />
      </div>

      <div>
        <h3 className="font-medium mb-4">Table</h3>
        <SkeletonTable rows={3} columns={4} />
      </div>

      <div>
        <h3 className="font-medium mb-4">Profile</h3>
        <SkeletonProfile />
      </div>

      <div>
        <h3 className="font-medium mb-4">Form</h3>
        <SkeletonForm fields={3} />
      </div>

      <div>
        <h3 className="font-medium mb-4">With Shimmer</h3>
        <SkeletonWithShimmer height={100} width={300} />
        <style jsx global>{`
          @keyframes shimmer {
            100% {
              transform: translateX(100%);
            }
          }
          .animate-shimmer {
            animation: shimmer 2s infinite;
          }
        `}</style>
      </div>
    </div>
  )
}
