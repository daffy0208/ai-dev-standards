import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from './utils'

const dividerVariants = cva('border-gray-200', {
  variants: {
    orientation: {
      horizontal: 'w-full border-t',
      vertical: 'h-full border-l'
    },
    variant: {
      solid: 'border-solid',
      dashed: 'border-dashed',
      dotted: 'border-dotted'
    },
    color: {
      default: 'border-gray-200',
      primary: 'border-blue-200',
      secondary: 'border-gray-300',
      muted: 'border-gray-100'
    },
    spacing: {
      none: '',
      sm: '',
      md: '',
      lg: ''
    }
  },
  defaultVariants: {
    orientation: 'horizontal',
    variant: 'solid',
    color: 'default',
    spacing: 'md'
  }
})

const spacingClasses = {
  horizontal: {
    none: '',
    sm: 'my-2',
    md: 'my-4',
    lg: 'my-6'
  },
  vertical: {
    none: '',
    sm: 'mx-2',
    md: 'mx-4',
    lg: 'mx-6'
  }
}

type DividerElementProps = Omit<React.HTMLAttributes<HTMLDivElement>, 'color'>

export interface DividerProps extends DividerElementProps, VariantProps<typeof dividerVariants> {
  /** Label or text to display in the divider */
  label?: string
  /** Label alignment for horizontal dividers */
  labelAlign?: 'left' | 'center' | 'right'
}

const Divider = React.forwardRef<HTMLDivElement, DividerProps>(
  (
    {
      className,
      orientation = 'horizontal',
      variant,
      color,
      spacing = 'md',
      label,
      labelAlign = 'center',
      ...props
    },
    ref
  ) => {
    const spacingClass =
      spacingClasses[orientation as keyof typeof spacingClasses][
        spacing as keyof typeof spacingClasses.horizontal
      ]

    if (label && orientation === 'horizontal') {
      return (
        <div
          className={cn('flex items-center', spacingClass, className)}
          ref={ref}
          role="separator"
          aria-label={typeof label === 'string' ? label : undefined}
          {...props}
        >
          {labelAlign !== 'left' && (
            <div className={cn(dividerVariants({ orientation, variant, color }), 'flex-1')} />
          )}
          <span className="px-3 text-sm text-gray-500">{label}</span>
          {labelAlign !== 'right' && (
            <div className={cn(dividerVariants({ orientation, variant, color }), 'flex-1')} />
          )}
        </div>
      )
    }

    return (
      <div
        className={cn(dividerVariants({ orientation, variant, color }), spacingClass, className)}
        ref={ref}
        role="separator"
        aria-orientation={orientation}
        {...props}
      />
    )
  }
)

Divider.displayName = 'Divider'

export { Divider, dividerVariants }
