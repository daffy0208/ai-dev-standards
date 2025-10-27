import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from './utils';

const gridVariants = cva('grid', {
  variants: {
    cols: {
      1: 'grid-cols-1',
      2: 'grid-cols-2',
      3: 'grid-cols-3',
      4: 'grid-cols-4',
      5: 'grid-cols-5',
      6: 'grid-cols-6',
      7: 'grid-cols-7',
      8: 'grid-cols-8',
      9: 'grid-cols-9',
      10: 'grid-cols-10',
      11: 'grid-cols-11',
      12: 'grid-cols-12',
    },
    gap: {
      0: 'gap-0',
      1: 'gap-1',
      2: 'gap-2',
      3: 'gap-3',
      4: 'gap-4',
      5: 'gap-5',
      6: 'gap-6',
      8: 'gap-8',
      10: 'gap-10',
      12: 'gap-12',
      16: 'gap-16',
    },
    autoFit: {
      true: 'grid-cols-[repeat(auto-fit,minmax(0,1fr))]',
      false: '',
    },
    autoFill: {
      true: 'grid-cols-[repeat(auto-fill,minmax(0,1fr))]',
      false: '',
    },
  },
  defaultVariants: {
    cols: 1,
    gap: 4,
    autoFit: false,
    autoFill: false,
  },
});

export interface GridProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof gridVariants> {
  /** Minimum column width for auto-fit/auto-fill (e.g., '250px') */
  minColWidth?: string;
  /** Responsive column configuration */
  responsive?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
}

const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  (
    {
      className,
      cols,
      gap,
      autoFit,
      autoFill,
      minColWidth,
      responsive,
      style,
      children,
      ...props
    },
    ref
  ) => {
    // Build responsive classes
    const responsiveClasses = responsive
      ? [
          responsive.sm && `sm:grid-cols-${responsive.sm}`,
          responsive.md && `md:grid-cols-${responsive.md}`,
          responsive.lg && `lg:grid-cols-${responsive.lg}`,
          responsive.xl && `xl:grid-cols-${responsive.xl}`,
        ]
          .filter(Boolean)
          .join(' ')
      : '';

    // Build style for auto-fit/auto-fill with minColWidth
    const gridStyle =
      (autoFit || autoFill) && minColWidth
        ? {
            ...style,
            gridTemplateColumns: `repeat(${
              autoFit ? 'auto-fit' : 'auto-fill'
            }, minmax(${minColWidth}, 1fr))`,
          }
        : style;

    return (
      <div
        className={cn(
          gridVariants({ cols, gap, autoFit, autoFill }),
          responsiveClasses,
          className
        )}
        ref={ref}
        style={gridStyle}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Grid.displayName = 'Grid';

export { Grid, gridVariants };
