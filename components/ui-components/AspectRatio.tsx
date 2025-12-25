import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from './utils'

const aspectRatioVariants = cva('relative w-full overflow-hidden', {
  variants: {
    ratio: {
      square: 'aspect-square',
      video: 'aspect-video',
      '4/3': 'aspect-[4/3]',
      '3/2': 'aspect-[3/2]',
      '2/1': 'aspect-[2/1]',
      '21/9': 'aspect-[21/9]',
      '9/16': 'aspect-[9/16]',
      '3/4': 'aspect-[3/4]'
    }
  },
  defaultVariants: {
    ratio: 'video'
  }
})

export interface AspectRatioProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof aspectRatioVariants> {
  /** Custom aspect ratio (e.g., '16/9' or 1.7778) */
  customRatio?: string | number
}

const AspectRatio = React.forwardRef<HTMLDivElement, AspectRatioProps>(
  ({ className, ratio, customRatio, style, children, ...props }, ref) => {
    // Calculate custom ratio if provided
    const customStyle = customRatio
      ? {
          ...style,
          aspectRatio: typeof customRatio === 'number' ? String(customRatio) : customRatio
        }
      : style

    return (
      <div
        className={cn(
          !customRatio && aspectRatioVariants({ ratio }),
          customRatio && 'relative w-full overflow-hidden',
          className
        )}
        ref={ref}
        style={customStyle}
        {...props}
      >
        <div className="absolute inset-0">{children}</div>
      </div>
    )
  }
)

AspectRatio.displayName = 'AspectRatio'

export { AspectRatio, aspectRatioVariants }
