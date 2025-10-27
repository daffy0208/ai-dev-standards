/**
 * Alert Component
 *
 * Alert and notification messages for displaying important information.
 * Supports multiple variants, dismissible state, and icon support.
 *
 * @example
 * ```tsx
 * // Basic alert
 * <Alert title="Success" description="Your changes have been saved." />
 *
 * // Variants
 * <Alert variant="success" title="Success" description="Operation completed!" />
 * <Alert variant="warning" title="Warning" description="Please review before continuing." />
 * <Alert variant="error" title="Error" description="Something went wrong." />
 * <Alert variant="info" title="Info" description="Did you know?" />
 *
 * // Dismissible
 * <Alert
 *   variant="warning"
 *   title="Warning"
 *   description="This is a dismissible alert."
 *   dismissible
 *   onDismiss={() => console.log('dismissed')}
 * />
 *
 * // With custom icon
 * <Alert
 *   title="Custom"
 *   description="With a custom icon."
 *   icon={<CustomIcon />}
 * />
 * ```
 */

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from './utils';

const alertVariants = cva(
  'relative w-full rounded-lg border p-4 transition-opacity',
  {
    variants: {
      variant: {
        default: 'bg-white border-gray-200 text-gray-900',
        success:
          'bg-green-50 border-green-200 text-green-900',
        warning:
          'bg-yellow-50 border-yellow-200 text-yellow-900',
        error: 'bg-red-50 border-red-200 text-red-900',
        info: 'bg-blue-50 border-blue-200 text-blue-900',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  /**
   * Alert title
   */
  title?: string;

  /**
   * Alert description
   */
  description?: string;

  /**
   * Custom icon element
   */
  icon?: React.ReactNode;

  /**
   * Allow dismissing the alert
   */
  dismissible?: boolean;

  /**
   * Callback when alert is dismissed
   */
  onDismiss?: () => void;
}

/**
 * Default icons for each variant
 */
const defaultIcons = {
  default: (
    <svg
      className="w-5 h-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  success: (
    <svg
      className="w-5 h-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  warning: (
    <svg
      className="w-5 h-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
      />
    </svg>
  ),
  error: (
    <svg
      className="w-5 h-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  info: (
    <svg
      className="w-5 h-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
};

// Icon color map
const iconColorMap = {
  default: 'text-gray-500',
  success: 'text-green-500',
  warning: 'text-yellow-500',
  error: 'text-red-500',
  info: 'text-blue-500',
};

/**
 * Alert component for notifications and messages
 */
export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  (
    {
      className,
      variant = 'default',
      title,
      description,
      icon,
      dismissible = false,
      onDismiss,
      children,
      ...props
    },
    ref
  ) => {
    const [isVisible, setIsVisible] = React.useState(true);

    const handleDismiss = () => {
      setIsVisible(false);
      onDismiss?.();
    };

    if (!isVisible) return null;

    const displayIcon = icon || defaultIcons[variant!];

    return (
      <div
        ref={ref}
        role={variant === 'error' ? 'alert' : 'status'}
        aria-live={variant === 'error' ? 'assertive' : 'polite'}
        className={cn(alertVariants({ variant }), className)}
        {...props}
      >
        <div className="flex">
          {/* Icon */}
          {displayIcon && (
            <div
              className={cn(
                'flex-shrink-0',
                iconColorMap[variant!]
              )}
              aria-hidden="true"
            >
              {displayIcon}
            </div>
          )}

          {/* Content */}
          <div className={cn('flex-1', displayIcon && 'ml-3')}>
            {title && (
              <h3 className="text-sm font-semibold mb-1">{title}</h3>
            )}
            {description && (
              <p className="text-sm opacity-90">{description}</p>
            )}
            {children && <div className="mt-2">{children}</div>}
          </div>

          {/* Dismiss button */}
          {dismissible && (
            <button
              type="button"
              onClick={handleDismiss}
              className={cn(
                'flex-shrink-0 ml-3 p-1 rounded',
                'hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-offset-2',
                'transition-colors',
                {
                  'focus:ring-gray-400': variant === 'default',
                  'focus:ring-green-500': variant === 'success',
                  'focus:ring-yellow-500': variant === 'warning',
                  'focus:ring-red-500': variant === 'error',
                  'focus:ring-blue-500': variant === 'info',
                }
              )}
              aria-label="Dismiss alert"
            >
              <svg
                className="w-5 h-5"
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
        </div>
      </div>
    );
  }
);

Alert.displayName = 'Alert';
