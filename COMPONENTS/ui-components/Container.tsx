import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from './utils'

const containerVariants = cva('w-full mx-auto', {
  variants: {
    maxWidth: {
      sm: 'max-w-screen-sm',
      md: 'max-w-screen-md',
      lg: 'max-w-screen-lg',
      xl: 'max-w-screen-xl',
      '2xl': 'max-w-screen-2xl',
      full: 'max-w-full'
    },
    padding: {
      none: 'px-0',
      sm: 'px-4',
      md: 'px-6',
      lg: 'px-8',
      xl: 'px-12'
    },
    centerContent: {
      true: 'flex items-center justify-center',
      false: ''
    }
  },
  defaultVariants: {
    maxWidth: 'xl',
    padding: 'md',
    centerContent: false
  }
})

export type ContainerProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof containerVariants>

const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, maxWidth, padding, centerContent, children, ...props }, ref) => {
    return (
      <div
        className={cn(containerVariants({ maxWidth, padding, centerContent }), className)}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Container.displayName = 'Container'

export { Container, containerVariants }
