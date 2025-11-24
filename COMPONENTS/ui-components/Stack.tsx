import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from './utils'

const stackVariants = cva('flex', {
  variants: {
    direction: {
      vertical: 'flex-col',
      horizontal: 'flex-row'
    },
    spacing: {
      0: 'gap-0',
      1: 'gap-1',
      2: 'gap-2',
      3: 'gap-3',
      4: 'gap-4',
      5: 'gap-5',
      6: 'gap-6',
      7: 'gap-7',
      8: 'gap-8',
      10: 'gap-10',
      12: 'gap-12',
      16: 'gap-16',
      20: 'gap-20',
      24: 'gap-24'
    },
    align: {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      stretch: 'items-stretch',
      baseline: 'items-baseline'
    },
    justify: {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between',
      around: 'justify-around',
      evenly: 'justify-evenly'
    },
    wrap: {
      true: 'flex-wrap',
      false: 'flex-nowrap'
    }
  },
  defaultVariants: {
    direction: 'vertical',
    spacing: 4,
    align: 'stretch',
    justify: 'start',
    wrap: false
  }
})

export type StackProps = React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof stackVariants>

const Stack = React.forwardRef<HTMLDivElement, StackProps>(
  ({ className, direction, spacing, align, justify, wrap, children, ...props }, ref) => {
    return (
      <div
        className={cn(stackVariants({ direction, spacing, align, justify, wrap }), className)}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Stack.displayName = 'Stack'

export { Stack, stackVariants }
