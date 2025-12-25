import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from './utils'

const checkboxVariants = cva(
  'peer shrink-0 rounded border border-gray-300 bg-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      size: {
        sm: 'h-4 w-4',
        md: 'h-5 w-5',
        lg: 'h-6 w-6'
      },
      checked: {
        true: 'border-blue-600 bg-blue-600',
        false: 'border-gray-300 bg-white',
        indeterminate: 'border-blue-600 bg-blue-600'
      }
    },
    defaultVariants: {
      size: 'md',
      checked: false
    }
  }
)

const CheckIcon = ({ size }: { size?: 'sm' | 'md' | 'lg' }) => {
  const sizeMap = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  }

  return (
    <svg
      className={cn('text-white', sizeMap[size || 'md'])}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={3}
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  )
}

const IndeterminateIcon = ({ size }: { size?: 'sm' | 'md' | 'lg' }) => {
  const sizeMap = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  }

  return (
    <svg
      className={cn('text-white', sizeMap[size || 'md'])}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={3}
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12h12" />
    </svg>
  )
}

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'size'>,
    VariantProps<typeof checkboxVariants> {
  /** Controlled checked state */
  checked?: boolean
  /** Default checked state (uncontrolled) */
  defaultChecked?: boolean
  /** Indeterminate state */
  indeterminate?: boolean
  /** Change handler */
  onCheckedChange?: (checked: boolean) => void
  /** Label text */
  label?: string
  /** Label position */
  labelPosition?: 'left' | 'right'
  /** Label className */
  labelClassName?: string
  /** Description text below label */
  description?: string
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      className,
      labelClassName,
      size = 'md',
      checked: controlledChecked,
      defaultChecked,
      indeterminate,
      onCheckedChange,
      label,
      labelPosition = 'right',
      description,
      disabled,
      ...props
    },
    ref
  ) => {
    const [uncontrolledChecked, setUncontrolledChecked] = React.useState(defaultChecked ?? false)

    const isControlled = controlledChecked !== undefined
    const checked = isControlled ? controlledChecked : uncontrolledChecked

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const newChecked = event.target.checked
      if (!isControlled) {
        setUncontrolledChecked(newChecked)
      }
      onCheckedChange?.(newChecked)
    }

    const checkboxState = indeterminate ? 'indeterminate' : checked

    const checkboxElement = (
      <div className="relative inline-flex items-center justify-center">
        <input
          type="checkbox"
          className="peer sr-only"
          checked={checked}
          disabled={disabled}
          onChange={handleChange}
          ref={ref}
          aria-checked={indeterminate ? 'mixed' : checked}
          {...props}
        />
        <div className={cn(checkboxVariants({ size, checked: checkboxState }), className)}>
          {checked && !indeterminate && (
            <div className="flex items-center justify-center">
              <CheckIcon size={size} />
            </div>
          )}
          {indeterminate && (
            <div className="flex items-center justify-center">
              <IndeterminateIcon size={size} />
            </div>
          )}
        </div>
      </div>
    )

    if (label || description) {
      return (
        <label
          className={cn(
            'inline-flex items-start gap-2',
            disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
            labelClassName
          )}
        >
          {labelPosition === 'left' && (
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-gray-900">{label}</span>
              {description && <span className="text-xs text-gray-500">{description}</span>}
            </div>
          )}
          {checkboxElement}
          {labelPosition === 'right' && (
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-gray-900">{label}</span>
              {description && <span className="text-xs text-gray-500">{description}</span>}
            </div>
          )}
        </label>
      )
    }

    return checkboxElement
  }
)

Checkbox.displayName = 'Checkbox'

export { Checkbox, checkboxVariants }
