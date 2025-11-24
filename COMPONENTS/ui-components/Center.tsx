import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from './utils'

const centerVariants = cva('flex', {
  variants: {
    align: {
      horizontal: 'justify-center',
      vertical: 'items-center',
      both: 'items-center justify-center'
    },
    inline: {
      true: 'inline-flex',
      false: 'flex'
    },
    minHeight: {
      none: '',
      screen: 'min-h-screen',
      full: 'min-h-full',
      '50vh': 'min-h-[50vh]',
      '75vh': 'min-h-[75vh]'
    }
  },
  defaultVariants: {
    align: 'both',
    inline: false,
    minHeight: 'none'
  }
})

export type CenterProps = React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof centerVariants>

const Center = React.forwardRef<HTMLDivElement, CenterProps>(
  ({ className, align, inline, minHeight, children, ...props }, ref) => {
    return (
      <div
        className={cn(centerVariants({ align, inline, minHeight }), className)}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Center.displayName = 'Center'

export { Center, centerVariants }
