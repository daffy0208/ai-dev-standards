import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from './utils'

const spacerVariants = cva('', {
  variants: {
    size: {
      0: '',
      1: '',
      2: '',
      3: '',
      4: '',
      5: '',
      6: '',
      8: '',
      10: '',
      12: '',
      16: '',
      20: '',
      24: '',
      32: '',
      40: '',
      48: '',
      56: '',
      64: ''
    },
    direction: {
      vertical: 'block',
      horizontal: 'inline-block'
    },
    responsive: {
      true: '',
      false: ''
    }
  },
  defaultVariants: {
    size: 4,
    direction: 'vertical',
    responsive: false
  }
})

// Map size to actual spacing classes
const verticalSpacing = {
  0: 'h-0',
  1: 'h-1',
  2: 'h-2',
  3: 'h-3',
  4: 'h-4',
  5: 'h-5',
  6: 'h-6',
  8: 'h-8',
  10: 'h-10',
  12: 'h-12',
  16: 'h-16',
  20: 'h-20',
  24: 'h-24',
  32: 'h-32',
  40: 'h-40',
  48: 'h-48',
  56: 'h-56',
  64: 'h-64'
}

const horizontalSpacing = {
  0: 'w-0',
  1: 'w-1',
  2: 'w-2',
  3: 'w-3',
  4: 'w-4',
  5: 'w-5',
  6: 'w-6',
  8: 'w-8',
  10: 'w-10',
  12: 'w-12',
  16: 'w-16',
  20: 'w-20',
  24: 'w-24',
  32: 'w-32',
  40: 'w-40',
  48: 'w-48',
  56: 'w-56',
  64: 'w-64'
}

export interface SpacerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spacerVariants> {
  /** Responsive sizing */
  responsiveSizes?: {
    sm?: number
    md?: number
    lg?: number
    xl?: number
  }
}

const Spacer = React.forwardRef<HTMLDivElement, SpacerProps>(
  ({ className, size = 4, direction = 'vertical', responsiveSizes, ...props }, ref) => {
    const spacingClass =
      direction === 'vertical'
        ? verticalSpacing[size as keyof typeof verticalSpacing]
        : horizontalSpacing[size as keyof typeof horizontalSpacing]

    // Build responsive classes
    const responsiveClasses = responsiveSizes
      ? [
          responsiveSizes.sm &&
            (direction === 'vertical'
              ? `sm:h-${responsiveSizes.sm}`
              : `sm:w-${responsiveSizes.sm}`),
          responsiveSizes.md &&
            (direction === 'vertical'
              ? `md:h-${responsiveSizes.md}`
              : `md:w-${responsiveSizes.md}`),
          responsiveSizes.lg &&
            (direction === 'vertical'
              ? `lg:h-${responsiveSizes.lg}`
              : `lg:w-${responsiveSizes.lg}`),
          responsiveSizes.xl &&
            (direction === 'vertical' ? `xl:h-${responsiveSizes.xl}` : `xl:w-${responsiveSizes.xl}`)
        ]
          .filter(Boolean)
          .join(' ')
      : ''

    return (
      <div
        className={cn(spacerVariants({ direction }), spacingClass, responsiveClasses, className)}
        ref={ref}
        aria-hidden="true"
        {...props}
      />
    )
  }
)

Spacer.displayName = 'Spacer'

export { Spacer, spacerVariants }
