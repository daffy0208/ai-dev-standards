import React, { useState, useRef, useEffect } from 'react';
import { cn } from './utils';

/**
 * Select option interface
 */
export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

/**
 * Select component props
 */
export interface SelectProps {
  /** Array of select options */
  options: SelectOption[];
  /** Current selected value(s) */
  value?: string | string[];
  /** Change handler */
  onChange?: (value: string | string[]) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Enable search/filter functionality */
  searchable?: boolean;
  /** Disable the select */
  disabled?: boolean;
  /** Enable multi-select with checkboxes */
  multiple?: boolean;
  /** Custom className */
  className?: string;
  /** Label for the select */
  label?: string;
  /** Error message */
  error?: string;
  /** Helper text */
  helperText?: string;
}

/**
 * Select/Dropdown component with search functionality
 *
 * @example
 * ```tsx
 * // Single select
 * const [value, setValue] = useState('');
 *
 * <Select
 *   label="Choose a fruit"
 *   options={[
 *     { value: 'apple', label: 'Apple' },
 *     { value: 'banana', label: 'Banana' },
 *     { value: 'orange', label: 'Orange' }
 *   ]}
 *   value={value}
 *   onChange={setValue}
 *   placeholder="Select a fruit"
 *   searchable
 * />
 * ```
 *
 * @example
 * ```tsx
 * // Multi-select
 * const [values, setValues] = useState<string[]>([]);
 *
 * <Select
 *   label="Choose multiple colors"
 *   options={[
 *     { value: 'red', label: 'Red' },
 *     { value: 'green', label: 'Green' },
 *     { value: 'blue', label: 'Blue' }
 *   ]}
 *   value={values}
 *   onChange={setValues}
 *   multiple
 *   searchable
 * />
 * ```
 */
export const Select = React.forwardRef<HTMLDivElement, SelectProps>(
  (
    {
      options,
      value,
      onChange,
      placeholder = 'Select...',
      searchable = false,
      disabled = false,
      multiple = false,
      className,
      label,
      error,
      helperText,
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeIndex, setActiveIndex] = useState<number>(-1);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLUListElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    // Combine refs
    useEffect(() => {
      if (ref && dropdownRef.current) {
        if (typeof ref === 'function') {
          ref(dropdownRef.current);
        } else {
          ref.current = dropdownRef.current;
        }
      }
    }, [ref]);

    // Filter options based on search query
    const filteredOptions = searchQuery
      ? options.filter((option) =>
          option.label.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : options;

    // Get selected option(s) label(s)
    const getSelectedLabel = () => {
      if (!value) return placeholder;
      if (Array.isArray(value)) {
        if (value.length === 0) return placeholder;
        if (value.length === 1) {
          const option = options.find((opt) => opt.value === value[0]);
          return option?.label || placeholder;
        }
        return `${value.length} selected`;
      }
      const option = options.find((opt) => opt.value === value);
      return option?.label || placeholder;
    };

    // Handle option selection
    const handleSelect = (optionValue: string) => {
      if (multiple) {
        const currentValues = (value as string[]) || [];
        const newValues = currentValues.includes(optionValue)
          ? currentValues.filter((v) => v !== optionValue)
          : [...currentValues, optionValue];
        onChange?.(newValues);
      } else {
        onChange?.(optionValue);
        setIsOpen(false);
        setSearchQuery('');
        buttonRef.current?.focus();
      }
    };

    // Handle clear selection
    const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange?.(multiple ? [] : '');
      setSearchQuery('');
    };

    // Handle keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (disabled) return;

      switch (e.key) {
        case 'Enter':
        case ' ':
          if (!isOpen) {
            e.preventDefault();
            setIsOpen(true);
            setActiveIndex(0);
          } else if (activeIndex >= 0 && activeIndex < filteredOptions.length) {
            e.preventDefault();
            handleSelect(filteredOptions[activeIndex].value);
          }
          break;
        case 'Escape':
          e.preventDefault();
          setIsOpen(false);
          setSearchQuery('');
          setActiveIndex(-1);
          buttonRef.current?.focus();
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (!isOpen) {
            setIsOpen(true);
            setActiveIndex(0);
          } else {
            setActiveIndex((prev) =>
              prev < filteredOptions.length - 1 ? prev + 1 : prev
            );
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (isOpen) {
            setActiveIndex((prev) => (prev > 0 ? prev - 1 : prev));
          }
          break;
        case 'Home':
          if (isOpen) {
            e.preventDefault();
            setActiveIndex(0);
          }
          break;
        case 'End':
          if (isOpen) {
            e.preventDefault();
            setActiveIndex(filteredOptions.length - 1);
          }
          break;
      }
    };

    // Scroll active option into view
    useEffect(() => {
      if (isOpen && activeIndex >= 0 && listRef.current) {
        const activeElement = listRef.current.children[activeIndex] as HTMLElement;
        if (activeElement) {
          activeElement.scrollIntoView({ block: 'nearest' });
        }
      }
    }, [activeIndex, isOpen]);

    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(e.target as Node)
        ) {
          setIsOpen(false);
          setSearchQuery('');
          setActiveIndex(-1);
        }
      };

      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
      }
    }, [isOpen]);

    // Focus search input when dropdown opens
    useEffect(() => {
      if (isOpen && searchable && searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, [isOpen, searchable]);

    // Check if option is selected
    const isSelected = (optionValue: string) => {
      if (Array.isArray(value)) {
        return value.includes(optionValue);
      }
      return value === optionValue;
    };

    const hasValue = multiple
      ? Array.isArray(value) && value.length > 0
      : Boolean(value);

    return (
      <div ref={dropdownRef} className={cn('relative w-full', className)}>
        {label && (
          <label
            className="mb-1.5 block text-sm font-medium text-gray-700"
            id={`${label}-label`}
          >
            {label}
          </label>
        )}

        <div className="relative">
          <button
            ref={buttonRef}
            type="button"
            onClick={() => !disabled && setIsOpen(!isOpen)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            aria-haspopup="listbox"
            aria-expanded={isOpen}
            aria-labelledby={label ? `${label}-label` : undefined}
            aria-describedby={
              error
                ? `${label}-error`
                : helperText
                ? `${label}-helper`
                : undefined
            }
            className={cn(
              'flex w-full items-center justify-between rounded-md border px-3 py-2 text-left text-sm transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2',
              disabled
                ? 'cursor-not-allowed bg-gray-100 text-gray-400'
                : 'bg-white hover:border-gray-400',
              error
                ? 'border-red-500 focus-visible:ring-red-600'
                : 'border-gray-300',
              isOpen && !error && 'border-blue-600'
            )}
          >
            <span
              className={cn(
                'block truncate',
                !hasValue && 'text-gray-400'
              )}
            >
              {getSelectedLabel()}
            </span>

            <div className="flex items-center gap-1">
              {hasValue && !disabled && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="rounded p-0.5 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  aria-label="Clear selection"
                  tabIndex={-1}
                >
                  <svg
                    className="h-4 w-4 text-gray-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}

              <svg
                className={cn(
                  'h-4 w-4 text-gray-400 transition-transform',
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
            </div>
          </button>

          {isOpen && (
            <div className="absolute z-50 mt-1 w-full rounded-md border border-gray-300 bg-white shadow-lg">
              {searchable && (
                <div className="border-b border-gray-200 p-2">
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setActiveIndex(0);
                    }}
                    placeholder="Search..."
                    className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                    aria-label="Search options"
                  />
                </div>
              )}

              <ul
                ref={listRef}
                role="listbox"
                aria-labelledby={label ? `${label}-label` : undefined}
                aria-multiselectable={multiple}
                className="max-h-60 overflow-auto py-1"
                tabIndex={-1}
              >
                {filteredOptions.length === 0 ? (
                  <li className="px-3 py-2 text-sm text-gray-500">
                    No options found
                  </li>
                ) : (
                  filteredOptions.map((option, index) => {
                    const selected = isSelected(option.value);
                    const active = index === activeIndex;

                    return (
                      <li
                        key={option.value}
                        role="option"
                        aria-selected={selected}
                        aria-disabled={option.disabled}
                        onClick={() =>
                          !option.disabled && handleSelect(option.value)
                        }
                        className={cn(
                          'flex cursor-pointer items-center px-3 py-2 text-sm transition-colors',
                          option.disabled
                            ? 'cursor-not-allowed opacity-50'
                            : 'hover:bg-gray-100',
                          active && 'bg-gray-100',
                          selected && 'bg-blue-50 font-medium text-blue-600'
                        )}
                        id={`option-${option.value}`}
                      >
                        {multiple && (
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() => {}}
                            className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                            tabIndex={-1}
                            aria-hidden="true"
                          />
                        )}
                        <span className="flex-1">{option.label}</span>
                        {!multiple && selected && (
                          <svg
                            className="h-4 w-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            aria-hidden="true"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </li>
                    );
                  })
                )}
              </ul>
            </div>
          )}
        </div>

        {error && (
          <p
            id={`${label}-error`}
            className="mt-1.5 text-sm text-red-600"
            role="alert"
          >
            {error}
          </p>
        )}

        {helperText && !error && (
          <p id={`${label}-helper`} className="mt-1.5 text-sm text-gray-500">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
