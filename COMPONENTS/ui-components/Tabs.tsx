import React, { createContext, useContext, useState, useCallback } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from './utils'

/**
 * Tabs Component
 *
 * A fully accessible tabs component with compound component pattern.
 * Supports both controlled and uncontrolled modes with keyboard navigation.
 *
 * @example
 * // Uncontrolled usage
 * ```tsx
 * <Tabs defaultValue="tab1" variant="default">
 *   <TabsList>
 *     <TabsTrigger value="tab1">Account</TabsTrigger>
 *     <TabsTrigger value="tab2">Password</TabsTrigger>
 *     <TabsTrigger value="tab3">Settings</TabsTrigger>
 *   </TabsList>
 *   <TabsContent value="tab1">
 *     <h3>Account Settings</h3>
 *     <p>Manage your account settings here.</p>
 *   </TabsContent>
 *   <TabsContent value="tab2">
 *     <h3>Password</h3>
 *     <p>Change your password here.</p>
 *   </TabsContent>
 *   <TabsContent value="tab3">
 *     <h3>Settings</h3>
 *     <p>Configure your application settings.</p>
 *   </TabsContent>
 * </Tabs>
 * ```
 *
 * @example
 * // Controlled usage
 * ```tsx
 * const [activeTab, setActiveTab] = useState('tab1');
 *
 * <Tabs value={activeTab} onValueChange={setActiveTab} variant="pills">
 *   <TabsList>
 *     <TabsTrigger value="tab1">Overview</TabsTrigger>
 *     <TabsTrigger value="tab2">Analytics</TabsTrigger>
 *   </TabsList>
 *   <TabsContent value="tab1">Overview content</TabsContent>
 *   <TabsContent value="tab2">Analytics content</TabsContent>
 * </Tabs>
 * ```
 *
 * @example
 * // Underline variant
 * ```tsx
 * <Tabs defaultValue="home" variant="underline">
 *   <TabsList>
 *     <TabsTrigger value="home">Home</TabsTrigger>
 *     <TabsTrigger value="profile">Profile</TabsTrigger>
 *     <TabsTrigger value="messages">Messages</TabsTrigger>
 *   </TabsList>
 *   <TabsContent value="home">Welcome home!</TabsContent>
 *   <TabsContent value="profile">Your profile</TabsContent>
 *   <TabsContent value="messages">Your messages</TabsContent>
 * </Tabs>
 * ```
 */

const tabsListVariants = cva('inline-flex items-center', {
  variants: {
    variant: {
      default: 'h-10 rounded-md bg-gray-100 p-1',
      pills: 'space-x-2',
      underline: 'border-b border-gray-200'
    }
  },
  defaultVariants: {
    variant: 'default'
  }
})

const tabsTriggerVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'rounded-sm data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm',
        pills:
          'rounded-full data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=inactive]:hover:bg-gray-100',
        underline:
          'border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-gray-900'
      }
    },
    defaultVariants: {
      variant: 'default'
    }
  }
)

interface TabsContextValue {
  value: string
  onValueChange: (value: string) => void
  variant: 'default' | 'pills' | 'underline'
}

const TabsContext = createContext<TabsContextValue | undefined>(undefined)

const useTabsContext = () => {
  const context = useContext(TabsContext)
  if (!context) {
    throw new Error('Tabs components must be used within a Tabs component')
  }
  return context
}

export interface TabsProps extends VariantProps<typeof tabsListVariants> {
  /** The value of the tab that should be active (controlled mode) */
  value?: string
  /** The value of the tab that should be active by default (uncontrolled mode) */
  defaultValue?: string
  /** Callback fired when the active tab changes */
  onValueChange?: (value: string) => void
  /** The content of the tabs component */
  children: React.ReactNode
  /** Additional CSS classes */
  className?: string
}

const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  (
    {
      value: controlledValue,
      defaultValue,
      onValueChange,
      variant = 'default',
      children,
      className,
      ...props
    },
    ref
  ) => {
    const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue || '')
    const isControlled = controlledValue !== undefined
    const value = isControlled ? controlledValue : uncontrolledValue

    const handleValueChange = useCallback(
      (newValue: string) => {
        if (!isControlled) {
          setUncontrolledValue(newValue)
        }
        onValueChange?.(newValue)
      },
      [isControlled, onValueChange]
    )

    return (
      <TabsContext.Provider
        value={{ value, onValueChange: handleValueChange, variant: variant || 'default' }}
      >
        <div ref={ref} className={cn('w-full', className)} {...props}>
          {children}
        </div>
      </TabsContext.Provider>
    )
  }
)

Tabs.displayName = 'Tabs'

export interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The content of the tabs list */
  children: React.ReactNode
  /** Additional CSS classes */
  className?: string
}

const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(
  ({ children, className, ...props }, ref) => {
    const { variant } = useTabsContext()
    const tabRefs = React.useRef<(HTMLButtonElement | null)[]>([])

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      const tabs = tabRefs.current.filter(Boolean) as HTMLButtonElement[]
      const currentIndex = tabs.findIndex(tab => tab === document.activeElement)

      if (currentIndex === -1) return

      let nextIndex = currentIndex

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault()
          nextIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1
          break
        case 'ArrowRight':
          e.preventDefault()
          nextIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0
          break
        case 'Home':
          e.preventDefault()
          nextIndex = 0
          break
        case 'End':
          e.preventDefault()
          nextIndex = tabs.length - 1
          break
        default:
          return
      }

      tabs[nextIndex]?.focus()
    }

    return (
      <div
        ref={ref}
        role="tablist"
        aria-orientation="horizontal"
        className={cn(tabsListVariants({ variant }), className)}
        onKeyDown={handleKeyDown}
        {...props}
      >
        {React.Children.map(children, (child, index) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child as React.ReactElement<any>, {
              ref: (el: HTMLButtonElement | null) => {
                tabRefs.current[index] = el
              }
            })
          }
          return child
        })}
      </div>
    )
  }
)

TabsList.displayName = 'TabsList'

export interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** The value that this tab represents */
  value: string
  /** The content of the tab trigger */
  children: React.ReactNode
  /** Additional CSS classes */
  className?: string
}

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ value: tabValue, children, className, ...props }, ref) => {
    const { value: activeValue, onValueChange, variant } = useTabsContext()
    const isActive = activeValue === tabValue

    return (
      <button
        ref={ref}
        role="tab"
        type="button"
        aria-selected={isActive}
        aria-controls={`panel-${tabValue}`}
        data-state={isActive ? 'active' : 'inactive'}
        id={`tab-${tabValue}`}
        tabIndex={isActive ? 0 : -1}
        className={cn(tabsTriggerVariants({ variant }), className)}
        onClick={() => onValueChange(tabValue)}
        {...props}
      >
        {children}
      </button>
    )
  }
)

TabsTrigger.displayName = 'TabsTrigger'

export interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The value that this content represents */
  value: string
  /** The content to display when this tab is active */
  children: React.ReactNode
  /** Additional CSS classes */
  className?: string
}

const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ value: tabValue, children, className, ...props }, ref) => {
    const { value: activeValue } = useTabsContext()
    const isActive = activeValue === tabValue

    if (!isActive) return null

    return (
      <div
        ref={ref}
        role="tabpanel"
        id={`panel-${tabValue}`}
        aria-labelledby={`tab-${tabValue}`}
        tabIndex={0}
        className={cn(
          'mt-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 rounded-sm',
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

TabsContent.displayName = 'TabsContent'

export { Tabs, TabsList, TabsTrigger, TabsContent }
