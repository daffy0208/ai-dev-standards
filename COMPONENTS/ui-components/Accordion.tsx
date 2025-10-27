/**
 * Accordion Component
 *
 * Collapsible content sections with keyboard navigation and accessibility.
 * Follows ARIA accordion pattern with full keyboard support.
 *
 * @example
 * ```tsx
 * // Basic accordion (single item open at a time)
 * <Accordion>
 *   <AccordionItem value="item-1" title="Section 1">
 *     Content for section 1
 *   </AccordionItem>
 *   <AccordionItem value="item-2" title="Section 2">
 *     Content for section 2
 *   </AccordionItem>
 *   <AccordionItem value="item-3" title="Section 3">
 *     Content for section 3
 *   </AccordionItem>
 * </Accordion>
 *
 * // Multiple items can be open
 * <Accordion type="multiple" defaultValue={["item-1", "item-2"]}>
 *   <AccordionItem value="item-1" title="Section 1">
 *     Content 1
 *   </AccordionItem>
 *   <AccordionItem value="item-2" title="Section 2">
 *     Content 2
 *   </AccordionItem>
 * </Accordion>
 *
 * // Controlled accordion
 * const [value, setValue] = useState("item-1");
 * <Accordion value={value} onValueChange={setValue}>
 *   <AccordionItem value="item-1" title="Controlled Section">
 *     Controlled content
 *   </AccordionItem>
 * </Accordion>
 *
 * // Disabled items
 * <Accordion>
 *   <AccordionItem value="item-1" title="Enabled">
 *     Content
 *   </AccordionItem>
 *   <AccordionItem value="item-2" title="Disabled" disabled>
 *     This item is disabled
 *   </AccordionItem>
 * </Accordion>
 * ```
 */

import * as React from 'react';
import { cn } from './utils';

type AccordionType = 'single' | 'multiple';

export interface AccordionProps {
  /**
   * Accordion content (AccordionItem components)
   */
  children: React.ReactNode;

  /**
   * Type of accordion
   * - single: Only one item can be open at a time (default)
   * - multiple: Multiple items can be open
   */
  type?: AccordionType;

  /**
   * Controlled value (single mode: string, multiple mode: string[])
   */
  value?: string | string[];

  /**
   * Default value for uncontrolled mode
   */
  defaultValue?: string | string[];

  /**
   * Callback when value changes
   */
  onValueChange?: (value: string | string[]) => void;

  /**
   * Allow collapsing all items (only for single mode)
   */
  collapsible?: boolean;

  /**
   * Additional CSS classes
   */
  className?: string;
}

export interface AccordionItemProps {
  /**
   * Unique value for this item
   */
  value: string;

  /**
   * Item title/header
   */
  title: React.ReactNode;

  /**
   * Item content
   */
  children: React.ReactNode;

  /**
   * Whether the item is disabled
   */
  disabled?: boolean;

  /**
   * Additional CSS classes for the item
   */
  className?: string;
}

interface AccordionContextType {
  type: AccordionType;
  value: string | string[];
  onItemClick: (value: string) => void;
}

const AccordionContext = React.createContext<AccordionContextType | null>(null);

/**
 * Accordion with collapsible sections
 */
export const Accordion = React.forwardRef<HTMLDivElement, AccordionProps>(
  (
    {
      children,
      type = 'single',
      value: controlledValue,
      defaultValue,
      onValueChange,
      collapsible = false,
      className,
    },
    ref
  ) => {
    // Initialize internal state
    const getInitialValue = () => {
      if (controlledValue !== undefined) return controlledValue;
      if (defaultValue !== undefined) return defaultValue;
      return type === 'multiple' ? [] : '';
    };

    const [internalValue, setInternalValue] = React.useState<string | string[]>(
      getInitialValue
    );

    // Use controlled or internal state
    const value = controlledValue !== undefined ? controlledValue : internalValue;
    const setValue = (newValue: string | string[]) => {
      if (controlledValue === undefined) {
        setInternalValue(newValue);
      }
      onValueChange?.(newValue);
    };

    // Handle item click
    const onItemClick = (itemValue: string) => {
      if (type === 'single') {
        // Single mode: toggle or set new value
        const currentValue = value as string;
        if (currentValue === itemValue && collapsible) {
          setValue('');
        } else {
          setValue(itemValue);
        }
      } else {
        // Multiple mode: toggle item in array
        const currentValues = value as string[];
        if (currentValues.includes(itemValue)) {
          setValue(currentValues.filter((v) => v !== itemValue));
        } else {
          setValue([...currentValues, itemValue]);
        }
      }
    };

    return (
      <AccordionContext.Provider value={{ type, value, onItemClick }}>
        <div
          ref={ref}
          className={cn('space-y-2', className)}
          data-orientation="vertical"
        >
          {children}
        </div>
      </AccordionContext.Provider>
    );
  }
);

Accordion.displayName = 'Accordion';

/**
 * Accordion item
 */
export const AccordionItem = React.forwardRef<HTMLDivElement, AccordionItemProps>(
  ({ value, title, children, disabled = false, className }, ref) => {
    const context = React.useContext(AccordionContext);
    const buttonRef = React.useRef<HTMLButtonElement>(null);
    const panelRef = React.useRef<HTMLDivElement>(null);
    const panelId = React.useId();
    const buttonId = React.useId();

    if (!context) {
      throw new Error('AccordionItem must be used within Accordion');
    }

    const { type, value: accordionValue, onItemClick } = context;

    // Check if this item is open
    const isOpen =
      type === 'single'
        ? accordionValue === value
        : (accordionValue as string[]).includes(value);

    // Handle click
    const handleClick = () => {
      if (!disabled) {
        onItemClick(value);
      }
    };

    // Handle keyboard navigation
    const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
      const accordion = buttonRef.current?.closest('[data-orientation="vertical"]');
      if (!accordion) return;

      const buttons = Array.from(
        accordion.querySelectorAll<HTMLButtonElement>(
          'button[data-accordion-trigger]:not([disabled])'
        )
      );
      const currentIndex = buttons.indexOf(buttonRef.current!);

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          const nextIndex = (currentIndex + 1) % buttons.length;
          buttons[nextIndex]?.focus();
          break;
        case 'ArrowUp':
          event.preventDefault();
          const prevIndex = (currentIndex - 1 + buttons.length) % buttons.length;
          buttons[prevIndex]?.focus();
          break;
        case 'Home':
          event.preventDefault();
          buttons[0]?.focus();
          break;
        case 'End':
          event.preventDefault();
          buttons[buttons.length - 1]?.focus();
          break;
      }
    };

    return (
      <div
        ref={ref}
        className={cn(
          'border border-gray-200 rounded-lg overflow-hidden',
          className
        )}
      >
        <h3>
          <button
            ref={buttonRef}
            id={buttonId}
            type="button"
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            aria-expanded={isOpen}
            aria-controls={panelId}
            data-accordion-trigger
            className={cn(
              'flex w-full items-center justify-between px-4 py-3 text-left',
              'text-sm font-medium transition-all',
              'hover:bg-gray-50',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset',
              disabled && 'opacity-50 cursor-not-allowed hover:bg-transparent'
            )}
          >
            <span>{title}</span>
            <svg
              className={cn(
                'h-4 w-4 transition-transform duration-200',
                isOpen && 'rotate-180'
              )}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </h3>
        <div
          ref={panelRef}
          id={panelId}
          role="region"
          aria-labelledby={buttonId}
          hidden={!isOpen}
          className={cn(
            'overflow-hidden transition-all duration-200',
            isOpen
              ? 'animate-in slide-in-from-top-2'
              : 'animate-out slide-out-to-top-2'
          )}
        >
          {isOpen && (
            <div className="px-4 py-3 text-sm text-gray-700 border-t border-gray-200">
              {children}
            </div>
          )}
        </div>
      </div>
    );
  }
);

AccordionItem.displayName = 'AccordionItem';
