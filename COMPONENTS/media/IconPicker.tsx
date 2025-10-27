/**
 * IconPicker Component
 *
 * Icon selection UI with search, preview, and category filtering.
 * Supports multiple icon libraries with copy-to-clipboard functionality.
 *
 * @example
 * ```tsx
 * <IconPicker
 *   library="heroicons"
 *   onSelect={(icon) => console.log('Selected:', icon)}
 *   defaultSearch="arrow"
 * />
 * ```
 */

import React, { useState, useEffect, useCallback } from 'react'
import { Icon, type IconLibrary } from './Icon'

export interface IconPickerProps {
  /** Icon library to use */
  library: IconLibrary

  /** Callback when icon is selected */
  onSelect?: (icon: SelectedIcon) => void

  /** Default search query */
  defaultSearch?: string

  /** Show copy code button */
  showCopyCode?: boolean

  /** Maximum icons to display */
  maxResults?: number

  /** Custom CSS class */
  className?: string
}

export interface SelectedIcon {
  name: string
  library: IconLibrary
  displayName: string
}

interface IconMetadata {
  name: string
  displayName: string
  category?: string
  tags?: string[]
}

/**
 * Icon Picker component
 */
export const IconPicker: React.FC<IconPickerProps> = ({
  library,
  onSelect,
  defaultSearch = '',
  showCopyCode = true,
  maxResults = 50,
  className = '',
}) => {
  const [search, setSearch] = useState(defaultSearch)
  const [icons, setIcons] = useState<IconMetadata[]>([])
  const [filteredIcons, setFilteredIcons] = useState<IconMetadata[]>([])
  const [selectedIcon, setSelectedIcon] = useState<SelectedIcon | null>(null)
  const [loading, setLoading] = useState(true)
  const [copiedIcon, setCopiedIcon] = useState<string | null>(null)

  // Load icons based on library
  useEffect(() => {
    const loadIcons = async () => {
      setLoading(true)

      try {
        const iconList = getIconList(library)
        setIcons(iconList)
        setFilteredIcons(iconList.slice(0, maxResults))
      } catch (error) {
        console.error('Failed to load icons:', error)
        setIcons([])
        setFilteredIcons([])
      } finally {
        setLoading(false)
      }
    }

    loadIcons()
  }, [library, maxResults])

  // Filter icons based on search
  useEffect(() => {
    if (!search.trim()) {
      setFilteredIcons(icons.slice(0, maxResults))
      return
    }

    const query = search.toLowerCase().trim()
    const filtered = icons.filter((icon) => {
      const nameMatch = icon.name.toLowerCase().includes(query)
      const displayMatch = icon.displayName.toLowerCase().includes(query)
      const tagMatch = icon.tags?.some((tag) => tag.toLowerCase().includes(query))

      return nameMatch || displayMatch || tagMatch
    })

    setFilteredIcons(filtered.slice(0, maxResults))
  }, [search, icons, maxResults])

  // Handle icon selection
  const handleSelect = useCallback(
    (icon: IconMetadata) => {
      const selected: SelectedIcon = {
        name: icon.name,
        library,
        displayName: icon.displayName,
      }

      setSelectedIcon(selected)
      onSelect?.(selected)
    },
    [library, onSelect]
  )

  // Copy icon code to clipboard
  const copyIconCode = useCallback(async (icon: IconMetadata) => {
    const code = `<Icon name="${icon.name}" library="${library}" size="md" />`

    try {
      await navigator.clipboard.writeText(code)
      setCopiedIcon(icon.name)

      setTimeout(() => {
        setCopiedIcon(null)
      }, 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }, [library])

  return (
    <div className={`icon-picker ${className}`}>
      {/* Search Input */}
      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search icons..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Search icons"
        />

        <div className="mt-2 text-sm text-gray-600">
          {loading ? 'Loading icons...' : `Showing ${filteredIcons.length} icons`}
        </div>
      </div>

      {/* Icon Grid */}
      <div
        className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2"
        role="grid"
        aria-label="Icon selection grid"
      >
        {filteredIcons.map((icon) => (
          <button
            key={icon.name}
            onClick={() => handleSelect(icon)}
            className={`
              p-3 rounded-lg border-2 transition-all
              hover:border-blue-500 hover:bg-blue-50
              focus:outline-none focus:ring-2 focus:ring-blue-500
              ${
                selectedIcon?.name === icon.name
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200'
              }
            `}
            role="gridcell"
            aria-label={icon.displayName}
            title={icon.displayName}
          >
            <Icon name={icon.name} library={library} size="lg" />
          </button>
        ))}
      </div>

      {/* Selected Icon Details */}
      {selectedIcon && (
        <div className="mt-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Icon name={selectedIcon.name} library={library} size="2xl" />

              <div>
                <h3 className="font-semibold text-lg">{selectedIcon.displayName}</h3>
                <p className="text-sm text-gray-600">
                  {selectedIcon.name} ({library})
                </p>
              </div>
            </div>

            {showCopyCode && (
              <button
                onClick={() => copyIconCode(icons.find((i) => i.name === selectedIcon.name)!)}
                className={`
                  px-4 py-2 rounded-lg font-medium transition-colors
                  ${
                    copiedIcon === selectedIcon.name
                      ? 'bg-green-500 text-white'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }
                `}
                aria-label="Copy icon code"
              >
                {copiedIcon === selectedIcon.name ? 'Copied!' : 'Copy Code'}
              </button>
            )}
          </div>

          {showCopyCode && (
            <div className="mt-4">
              <code className="block p-3 bg-gray-800 text-gray-100 rounded text-sm overflow-x-auto">
                {`<Icon name="${selectedIcon.name}" library="${library}" size="md" />`}
              </code>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredIcons.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">No icons found</p>
          <p className="text-sm mt-1">Try a different search term</p>
        </div>
      )}
    </div>
  )
}

/**
 * Get icon list for library
 */
function getIconList(library: IconLibrary): IconMetadata[] {
  switch (library) {
    case 'heroicons':
      return [
        { name: 'arrow-right', displayName: 'Arrow Right', tags: ['arrow', 'right', 'next'] },
        { name: 'arrow-left', displayName: 'Arrow Left', tags: ['arrow', 'left', 'back'] },
        { name: 'arrow-up', displayName: 'Arrow Up', tags: ['arrow', 'up'] },
        { name: 'arrow-down', displayName: 'Arrow Down', tags: ['arrow', 'down'] },
        { name: 'check', displayName: 'Check', tags: ['check', 'done', 'success'] },
        { name: 'x-mark', displayName: 'X Mark', tags: ['x', 'close', 'cancel'] },
        { name: 'plus', displayName: 'Plus', tags: ['plus', 'add', 'create'] },
        { name: 'minus', displayName: 'Minus', tags: ['minus', 'subtract'] },
        { name: 'heart', displayName: 'Heart', tags: ['heart', 'like', 'favorite'] },
        { name: 'star', displayName: 'Star', tags: ['star', 'favorite'] },
        { name: 'home', displayName: 'Home', tags: ['home', 'house'] },
        { name: 'user', displayName: 'User', tags: ['user', 'person', 'account'] },
        { name: 'users', displayName: 'Users', tags: ['users', 'people', 'team'] },
        { name: 'cog-6-tooth', displayName: 'Settings', tags: ['settings', 'cog', 'gear'] },
        { name: 'magnifying-glass', displayName: 'Search', tags: ['search', 'find'] },
        { name: 'bell', displayName: 'Bell', tags: ['bell', 'notification', 'alert'] },
        { name: 'envelope', displayName: 'Envelope', tags: ['email', 'mail'] },
        { name: 'folder', displayName: 'Folder', tags: ['folder', 'directory'] },
        { name: 'document', displayName: 'Document', tags: ['document', 'file'] },
        { name: 'trash', displayName: 'Trash', tags: ['trash', 'delete', 'remove'] },
      ]

    case 'lucide':
      return [
        { name: 'arrow-right', displayName: 'Arrow Right', tags: ['arrow', 'right', 'next'] },
        { name: 'arrow-left', displayName: 'Arrow Left', tags: ['arrow', 'left', 'back'] },
        { name: 'check', displayName: 'Check', tags: ['check', 'done', 'success'] },
        { name: 'x', displayName: 'X', tags: ['x', 'close', 'cancel'] },
        { name: 'plus', displayName: 'Plus', tags: ['plus', 'add', 'create'] },
        { name: 'minus', displayName: 'Minus', tags: ['minus', 'subtract'] },
        { name: 'heart', displayName: 'Heart', tags: ['heart', 'like', 'favorite'] },
        { name: 'star', displayName: 'Star', tags: ['star', 'favorite'] },
        { name: 'home', displayName: 'Home', tags: ['home', 'house'] },
        { name: 'user', displayName: 'User', tags: ['user', 'person', 'account'] },
        { name: 'users', displayName: 'Users', tags: ['users', 'people', 'team'] },
        { name: 'settings', displayName: 'Settings', tags: ['settings', 'cog', 'gear'] },
        { name: 'search', displayName: 'Search', tags: ['search', 'find'] },
        { name: 'bell', displayName: 'Bell', tags: ['bell', 'notification', 'alert'] },
        { name: 'mail', displayName: 'Mail', tags: ['email', 'mail'] },
        { name: 'folder', displayName: 'Folder', tags: ['folder', 'directory'] },
        { name: 'file', displayName: 'File', tags: ['document', 'file'] },
        { name: 'trash-2', displayName: 'Trash', tags: ['trash', 'delete', 'remove'] },
      ]

    case 'font-awesome':
      return [
        { name: 'arrow-right', displayName: 'Arrow Right', tags: ['arrow', 'right', 'next'] },
        { name: 'arrow-left', displayName: 'Arrow Left', tags: ['arrow', 'left', 'back'] },
        { name: 'check', displayName: 'Check', tags: ['check', 'done', 'success'] },
        { name: 'xmark', displayName: 'X Mark', tags: ['x', 'close', 'cancel'] },
        { name: 'plus', displayName: 'Plus', tags: ['plus', 'add', 'create'] },
        { name: 'minus', displayName: 'Minus', tags: ['minus', 'subtract'] },
        { name: 'heart', displayName: 'Heart', tags: ['heart', 'like', 'favorite'] },
        { name: 'star', displayName: 'Star', tags: ['star', 'favorite'] },
        { name: 'house', displayName: 'House', tags: ['home', 'house'] },
        { name: 'user', displayName: 'User', tags: ['user', 'person', 'account'] },
        { name: 'users', displayName: 'Users', tags: ['users', 'people', 'team'] },
        { name: 'gear', displayName: 'Gear', tags: ['settings', 'cog', 'gear'] },
        { name: 'magnifying-glass', displayName: 'Magnifying Glass', tags: ['search', 'find'] },
        { name: 'bell', displayName: 'Bell', tags: ['bell', 'notification', 'alert'] },
        { name: 'envelope', displayName: 'Envelope', tags: ['email', 'mail'] },
        { name: 'folder', displayName: 'Folder', tags: ['folder', 'directory'] },
        { name: 'file', displayName: 'File', tags: ['document', 'file'] },
        { name: 'trash', displayName: 'Trash', tags: ['trash', 'delete', 'remove'] },
      ]

    default:
      return []
  }
}
