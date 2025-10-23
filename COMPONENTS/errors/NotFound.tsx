/**
 * 404 Not Found Page
 *
 * Production-ready 404 error page with helpful navigation.
 *
 * Features:
 * - Clean, friendly design
 * - Search functionality
 * - Popular pages links
 * - Contact support
 * - Custom illustrations
 *
 * Usage:
 * ```typescript
 * // In Next.js app/not-found.tsx
 * import { NotFound } from '@/components/errors/NotFound'
 *
 * export default function NotFoundPage() {
 *   return <NotFound />
 * }
 * ```
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export interface NotFoundProps {
  title?: string
  message?: string
  showSearch?: boolean
  showPopularPages?: boolean
  popularPages?: Array<{ label: string; href: string }>
}

export function NotFound({
  title = "Page Not Found",
  message = "Sorry, we couldn't find the page you're looking for.",
  showSearch = true,
  showPopularPages = true,
  popularPages = [
    { label: 'Home', href: '/' },
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Documentation', href: '/docs' },
    { label: 'Support', href: '/support' }
  ]
}: NotFoundProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="max-w-2xl w-full text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <svg
            className="mx-auto h-64 w-64 text-blue-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={0.5}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div className="text-8xl font-bold text-blue-600 -mt-20">404</div>
        </div>

        {/* Title & Message */}
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{title}</h1>
        <p className="text-xl text-gray-600 mb-8">{message}</p>

        {/* Search */}
        {showSearch && (
          <div className="mb-8">
            <form onSubmit={handleSearch} className="max-w-md mx-auto">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for a page..."
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Popular Pages */}
        {showPopularPages && popularPages.length > 0 && (
          <div className="mb-8">
            <p className="text-sm font-medium text-gray-700 mb-4">Popular Pages:</p>
            <div className="flex flex-wrap justify-center gap-3">
              {popularPages.map((page) => (
                <a
                  key={page.href}
                  href={page.href}
                  className="px-4 py-2 bg-white text-blue-600 rounded-lg shadow hover:shadow-md transition-shadow font-medium"
                >
                  {page.label}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <button
            onClick={() => router.back()}
            className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium rounded-lg transition-colors"
          >
            Go Back
          </button>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Go Home
          </button>
        </div>

        {/* Help Text */}
        <p className="text-sm text-gray-500">
          Need help?{' '}
          <a href="/support" className="text-blue-600 hover:text-blue-800 font-medium">
            Contact support
          </a>
        </p>
      </div>
    </div>
  )
}

/**
 * Minimal 404 Page (for simpler use cases)
 */
export function NotFoundMinimal() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-gray-300">404</h1>
        <p className="text-2xl font-semibold text-gray-700 mt-4">Page Not Found</p>
        <a
          href="/"
          className="inline-block mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Go Home
        </a>
      </div>
    </div>
  )
}

/**
 * 404 with Custom Illustration
 */
export function NotFoundWithIllustration() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="max-w-4xl w-full grid md:grid-cols-2 gap-8 items-center">
        {/* Illustration */}
        <div className="order-2 md:order-1">
          <svg
            className="w-full h-auto"
            viewBox="0 0 500 400"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Simple illustration - replace with actual SVG */}
            <circle cx="250" cy="200" r="150" fill="#E5E7EB" />
            <path d="M200 180 Q220 160 240 180 T280 180" stroke="#6B7280" strokeWidth="4" fill="none" />
            <circle cx="200" cy="160" r="10" fill="#6B7280" />
            <circle cx="300" cy="160" r="10" fill="#6B7280" />
            <text x="250" y="280" textAnchor="middle" fontSize="80" fill="#3B82F6" fontWeight="bold">
              404
            </text>
          </svg>
        </div>

        {/* Content */}
        <div className="order-1 md:order-2 text-center md:text-left">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Oops!</h1>
          <p className="text-xl text-gray-600 mb-6">
            We can't seem to find the page you're looking for.
          </p>
          <p className="text-gray-500 mb-8">
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="/"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-center transition-colors"
            >
              Go to Homepage
            </a>
            <a
              href="/support"
              className="px-6 py-3 border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-medium rounded-lg text-center transition-colors"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Example: Next.js App Router not-found.tsx
 */
export default function NotFoundPage() {
  return <NotFound />
}
