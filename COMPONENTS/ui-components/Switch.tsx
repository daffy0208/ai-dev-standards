import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from './utils';

const switchVariants = cva(
  'relative inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      size: {
        sm: 'h-5 w-9',
        md: 'h-6 w-11',
        lg: 'h-7 w-14',
      },
      checked: {
        true: 'bg-blue-600',
        false: 'bg-gray-200',
      },
    },
    defaultVariants: {
      size: 'md',
      checked: false,
    },
  }
);

const thumbVariants = cva(
  'pointer-events-none inline-block rounded-full bg-white shadow-lg ring-0 transition-transform',
  {
    variants: {
      size: {
        sm: 'h-4 w-4',
        md: 'h-5 w-5',
        lg: 'h-6 w-6',
      },
      checked: {
        true: '',
        false: 'translate-x-0',
      },
    },
    compoundVariants: [
      { size: 'sm', checked: true, class: 'translate-x-4' },
      { size: 'md', checked: true, class: 'translate-x-5' },
      { size: 'lg', checked: true, class: 'translate-x-7' },
    ],
    defaultVariants: {
      size: 'md',
      checked: false,
    },
  }
);

export interface SwitchProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'>,
    VariantProps<typeof switchVariants> {
  /** Controlled checked state */
  checked?: boolean;
  /** Default checked state (uncontrolled) */
  defaultChecked?: boolean;
  /** Change handler */
  onCheckedChange?: (checked: boolean) => void;
  /** Label text */
  label?: string;
  /** Label position */
  labelPosition?: 'left' | 'right';
  /** Label className */
  labelClassName?: string;
}

const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  (
    {
      className,
      labelClassName,
      size = 'md',
      checked: controlledChecked,
      defaultChecked,
      onCheckedChange,
      label,
      labelPosition = 'right',
      disabled,
      ...props
    },
    ref
  ) => {
    const [uncontrolledChecked, setUncontrolledChecked] = React.useState(
      defaultChecked ?? false
    );

    const isControlled = controlledChecked !== undefined;
    const checked = isControlled ? controlledChecked : uncontrolledChecked;

    const handleClick = () => {
      if (disabled) return;

      const newChecked = !checked;
      if (!isControlled) {
        setUncontrolledChecked(newChecked);
      }
      onCheckedChange?.(newChecked);
    };

    const switchElement = (
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        className={cn(switchVariants({ size, checked }), className)}
        onClick={handleClick}
        ref={ref}
        {...props}
      >
        <span className={thumbVariants({ size, checked })} aria-hidden="true" />
      </button>
    );

    if (label) {
      return (
        <label
          className={cn(
            'inline-flex items-center gap-2',
            disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
            labelClassName
          )}
        >
          {labelPosition === 'left' && (
            <span className="text-sm font-medium text-gray-900">{label}</span>
          )}
          {switchElement}
          {labelPosition === 'right' && (
            <span className="text-sm font-medium text-gray-900">{label}</span>
          )}
        </label>
      );
    }

    return switchElement;
  }
);

Switch.displayName = 'Switch';

export { Switch, switchVariants };
