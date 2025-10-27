import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from './utils';

const radioVariants = cva(
  'peer shrink-0 rounded-full border border-gray-300 bg-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      size: {
        sm: 'h-4 w-4',
        md: 'h-5 w-5',
        lg: 'h-6 w-6',
      },
      checked: {
        true: 'border-blue-600 bg-white',
        false: 'border-gray-300 bg-white',
      },
    },
    defaultVariants: {
      size: 'md',
      checked: false,
    },
  }
);

const radioIndicatorVariants = cva('rounded-full bg-blue-600 transition-transform', {
  variants: {
    size: {
      sm: 'h-2 w-2',
      md: 'h-2.5 w-2.5',
      lg: 'h-3 w-3',
    },
    checked: {
      true: 'scale-100',
      false: 'scale-0',
    },
  },
  defaultVariants: {
    size: 'md',
    checked: false,
  },
});

export interface RadioProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'>,
    VariantProps<typeof radioVariants> {
  /** Label text */
  label?: string;
  /** Label position */
  labelPosition?: 'left' | 'right';
  /** Label className */
  labelClassName?: string;
  /** Description text below label */
  description?: string;
}

const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  (
    {
      className,
      labelClassName,
      size = 'md',
      label,
      labelPosition = 'right',
      description,
      disabled,
      checked,
      ...props
    },
    ref
  ) => {
    const radioElement = (
      <div className="relative inline-flex items-center justify-center">
        <input
          type="radio"
          className="peer sr-only"
          disabled={disabled}
          checked={checked}
          ref={ref}
          {...props}
        />
        <div className={cn(radioVariants({ size, checked }), className)}>
          <div className="flex items-center justify-center">
            <div className={radioIndicatorVariants({ size, checked })} aria-hidden="true" />
          </div>
        </div>
      </div>
    );

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
          {radioElement}
          {labelPosition === 'right' && (
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-gray-900">{label}</span>
              {description && <span className="text-xs text-gray-500">{description}</span>}
            </div>
          )}
        </label>
      );
    }

    return radioElement;
  }
);

Radio.displayName = 'Radio';

// RadioGroup Component
export interface RadioGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Current value */
  value?: string;
  /** Default value (uncontrolled) */
  defaultValue?: string;
  /** Change handler */
  onValueChange?: (value: string) => void;
  /** Disabled state */
  disabled?: boolean;
  /** Layout direction */
  orientation?: 'horizontal' | 'vertical';
  /** Spacing between items */
  spacing?: 'sm' | 'md' | 'lg';
}

const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  (
    {
      className,
      value: controlledValue,
      defaultValue,
      onValueChange,
      disabled,
      orientation = 'vertical',
      spacing = 'md',
      children,
      ...props
    },
    ref
  ) => {
    const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue ?? '');

    const isControlled = controlledValue !== undefined;
    const value = isControlled ? controlledValue : uncontrolledValue;

    const spacingMap = {
      sm: 'gap-2',
      md: 'gap-3',
      lg: 'gap-4',
    };

    const handleChange = (newValue: string) => {
      if (!isControlled) {
        setUncontrolledValue(newValue);
      }
      onValueChange?.(newValue);
    };

    return (
      <div
        role="radiogroup"
        className={cn(
          'flex',
          orientation === 'vertical' ? 'flex-col' : 'flex-row flex-wrap',
          spacingMap[spacing],
          className
        )}
        ref={ref}
        {...props}
      >
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child) && child.type === Radio) {
            return React.cloneElement(child as React.ReactElement<RadioProps>, {
              checked: child.props.value === value,
              disabled: disabled || child.props.disabled,
              onChange: () => {
                if (child.props.value) {
                  handleChange(child.props.value);
                }
              },
            });
          }
          return child;
        })}
      </div>
    );
  }
);

RadioGroup.displayName = 'RadioGroup';

export { Radio, RadioGroup, radioVariants };
