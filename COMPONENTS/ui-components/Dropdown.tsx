/**
 * Dropdown Component
 *
 * Accessible dropdown menu with keyboard navigation.
 *
 * @example
 * ```tsx
 * <Dropdown>
 *   <DropdownTrigger>
 *     <Button>Options</Button>
 *   </DropdownTrigger>
 *   <DropdownMenu>
 *     <DropdownItem onSelect={() => console.log('Edit')}>
 *       Edit
 *     </DropdownItem>
 *     <DropdownItem onSelect={() => console.log('Delete')}>
 *       Delete
 *     </DropdownItem>
 *     <DropdownDivider />
 *     <DropdownItem disabled>
 *       Disabled
 *     </DropdownItem>
 *   </DropdownMenu>
 * </Dropdown>
 * ```
 */

import * as React from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils/cn'

export interface DropdownProps {
  children: React.ReactNode
  className?: string
}

export interface DropdownContextType {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  triggerRef: React.RefObject<HTMLElement>
}

const DropdownContext = React.createContext<DropdownContextType | null>(null)

export const Dropdown = ({ children, className }: DropdownProps) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const triggerRef = React.useRef<HTMLElement>(null)

  return (
    <DropdownContext.Provider value={{ isOpen, setIsOpen, triggerRef }}>
      <div className={cn('relative inline-block', className)}>
        {children}
      </div>
    </DropdownContext.Provider>
  )
}

Dropdown.displayName = 'Dropdown'

/**
 * Dropdown Trigger
 */
export interface DropdownTriggerProps {
  children: React.ReactElement
  className?: string
}

export const DropdownTrigger = ({ children, className }: DropdownTriggerProps) => {
  const context = React.useContext(DropdownContext)

  if (!context) {
    throw new Error('DropdownTrigger must be used within Dropdown')
  }

  const { isOpen, setIsOpen, triggerRef } = context

  const handleClick = () => {
    setIsOpen(!isOpen)
  }

  return React.cloneElement(children, {
    ref: triggerRef,
    onClick: handleClick,
    'aria-haspopup': 'true',
    'aria-expanded': isOpen,
    className: cn(children.props.className, className),
  })
}

DropdownTrigger.displayName = 'DropdownTrigger'

/**
 * Dropdown Menu
 */
export interface DropdownMenuProps {
  children: React.ReactNode
  align?: 'start' | 'center' | 'end'
  side?: 'top' | 'bottom'
  className?: string
}

export const DropdownMenu = ({
  children,
  align = 'start',
  side = 'bottom',
  className,
}: DropdownMenuProps) => {
  const context = React.useContext(DropdownContext)
  const menuRef = React.useRef<HTMLDivElement>(null)

  if (!context) {
    throw new Error('DropdownMenu must be used within Dropdown')
  }

  const { isOpen, setIsOpen, triggerRef } = context

  // Close on click outside
  React.useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, setIsOpen, triggerRef])

  // Close on escape
  React.useEffect(() => {
    if (!isOpen) return

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
        triggerRef.current?.focus()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, setIsOpen, triggerRef])

  // Keyboard navigation
  React.useEffect(() => {
    if (!isOpen || !menuRef.current) return

    const items = Array.from(
      menuRef.current.querySelectorAll('[role="menuitem"]:not([aria-disabled="true"])')
    ) as HTMLElement[]

    if (items.length === 0) return

    let currentIndex = 0

    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault()
          currentIndex = (currentIndex + 1) % items.length
          items[currentIndex]?.focus()
          break

        case 'ArrowUp':
          event.preventDefault()
          currentIndex = (currentIndex - 1 + items.length) % items.length
          items[currentIndex]?.focus()
          break

        case 'Home':
          event.preventDefault()
          currentIndex = 0
          items[0]?.focus()
          break

        case 'End':
          event.preventDefault()
          currentIndex = items.length - 1
          items[items.length - 1]?.focus()
          break
      }
    }

    menuRef.current.addEventListener('keydown', handleKeyDown)
    return () => menuRef.current?.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  if (!isOpen) return null

  return createPortal(
    <div
      ref={menuRef}
      role="menu"
      className={cn(
        'absolute z-50 min-w-[8rem] rounded-md border border-gray-200 bg-white p-1 shadow-lg',
        'animate-in fade-in-0 zoom-in-95',
        // Alignment
        align === 'start' && 'left-0',
        align === 'center' && 'left-1/2 -translate-x-1/2',
        align === 'end' && 'right-0',
        // Side
        side === 'top' && 'bottom-full mb-1',
        side === 'bottom' && 'top-full mt-1',
        className
      )}
    >
      {children}
    </div>,
    document.body
  )
}

DropdownMenu.displayName = 'DropdownMenu'

/**
 * Dropdown Item
 */
export interface DropdownItemProps {
  children: React.ReactNode
  onSelect?: () => void
  disabled?: boolean
  destructive?: boolean
  className?: string
}

export const DropdownItem = ({
  children,
  onSelect,
  disabled,
  destructive,
  className,
}: DropdownItemProps) => {
  const context = React.useContext(DropdownContext)

  if (!context) {
    throw new Error('DropdownItem must be used within Dropdown')
  }

  const { setIsOpen } = context

  const handleClick = () => {
    if (disabled) return
    onSelect?.()
    setIsOpen(false)
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleClick()
    }
  }

  return (
    <div
      role="menuitem"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={cn(
        'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors',
        'focus:bg-gray-100 focus:text-gray-900',
        disabled && 'pointer-events-none opacity-50',
        destructive && 'text-red-600 focus:bg-red-50 focus:text-red-700',
        className
      )}
    >
      {children}
    </div>
  )
}

DropdownItem.displayName = 'DropdownItem'

/**
 * Dropdown Divider
 */
export interface DropdownDividerProps {
  className?: string
}

export const DropdownDivider = ({ className }: DropdownDividerProps) => {
  return (
    <div
      role="separator"
      aria-orientation="horizontal"
      className={cn('-mx-1 my-1 h-px bg-gray-200', className)}
    />
  )
}

DropdownDivider.displayName = 'DropdownDivider'

/**
 * Dropdown Label (for grouping)
 */
export interface DropdownLabelProps {
  children: React.ReactNode
  className?: string
}

export const DropdownLabel = ({ children, className }: DropdownLabelProps) => {
  return (
    <div
      className={cn(
        'px-2 py-1.5 text-xs font-semibold text-gray-500',
        className
      )}
    >
      {children}
    </div>
  )
}

DropdownLabel.displayName = 'DropdownLabel'

/**
 * Dropdown Item with Icon
 */
export interface DropdownItemWithIconProps extends DropdownItemProps {
  icon?: React.ReactNode
  shortcut?: string
}

export const DropdownItemWithIcon = ({
  children,
  icon,
  shortcut,
  ...props
}: DropdownItemWithIconProps) => {
  return (
    <DropdownItem {...props} className={cn('gap-2', props.className)}>
      {icon && <span className="w-4 h-4">{icon}</span>}
      <span className="flex-1">{children}</span>
      {shortcut && (
        <span className="ml-auto text-xs text-gray-400">{shortcut}</span>
      )}
    </DropdownItem>
  )
}

DropdownItemWithIcon.displayName = 'DropdownItemWithIcon'
