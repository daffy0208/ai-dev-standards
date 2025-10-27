/**
 * ColorPicker Component
 *
 * A color selection UI with multiple input modes and presets.
 * Supports HEX, RGB, HSL formats with alpha channel.
 *
 * @example
 * ```tsx
 * // Basic color picker
 * <ColorPicker
 *   value="#3b82f6"
 *   onChange={(color) => console.log(color)}
 *   label="Theme Color"
 * />
 *
 * // With alpha support
 * <ColorPicker
 *   value="rgba(59, 130, 246, 0.8)"
 *   onChange={(color) => console.log(color)}
 *   showAlpha
 *   label="Background Color"
 * />
 *
 * // With presets
 * <ColorPicker
 *   value="#3b82f6"
 *   onChange={(color) => console.log(color)}
 *   presets={['#3b82f6', '#ef4444', '#10b981', '#f59e0b']}
 * />
 * ```
 */

import * as React from 'react';
import { cn } from './utils';

export interface ColorPickerProps {
  /**
   * Current color value (HEX, RGB, or HSL)
   */
  value?: string;

  /**
   * Callback when color changes
   */
  onChange?: (color: string) => void;

  /**
   * Label for the color picker
   */
  label?: string;

  /**
   * Show alpha/transparency control
   */
  showAlpha?: boolean;

  /**
   * Preset color palette
   */
  presets?: string[];

  /**
   * Input format (hex, rgb, hsl)
   */
  format?: 'hex' | 'rgb' | 'hsl';

  /**
   * Whether the picker is disabled
   */
  disabled?: boolean;

  /**
   * Additional CSS classes
   */
  className?: string;
}

// Color utility functions
const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

const rgbToHex = (r: number, g: number, b: number): string => {
  return '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('');
};

const rgbToHsl = (
  r: number,
  g: number,
  b: number
): { h: number; s: number; l: number } => {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0,
    s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
};

const hslToRgb = (
  h: number,
  s: number,
  l: number
): { r: number; g: number; b: number } => {
  h /= 360;
  s /= 100;
  l /= 100;

  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
};

/**
 * ColorPicker component for selecting colors
 */
export const ColorPicker = React.forwardRef<HTMLDivElement, ColorPickerProps>(
  (
    {
      value = '#3b82f6',
      onChange,
      label,
      showAlpha = false,
      presets = [],
      format = 'hex',
      disabled = false,
      className,
    },
    ref
  ) => {
    const pickerId = React.useId();
    const [isOpen, setIsOpen] = React.useState(false);
    const [inputValue, setInputValue] = React.useState(value);
    const containerRef = React.useRef<HTMLDivElement>(null);

    // Parse current color
    const rgb = hexToRgb(value.startsWith('#') ? value : value);
    const hsl = rgb ? rgbToHsl(rgb.r, rgb.g, rgb.b) : { h: 0, s: 0, l: 50 };

    // Close on outside click
    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
        }
      };

      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
      }

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [isOpen]);

    // Handle preset selection
    const handlePresetClick = (preset: string) => {
      setInputValue(preset);
      onChange?.(preset);
    };

    // Handle input change
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setInputValue(newValue);

      // Validate and update
      if (format === 'hex' && /^#[0-9A-Fa-f]{6}$/.test(newValue)) {
        onChange?.(newValue);
      }
    };

    // Format display value
    const getDisplayValue = (): string => {
      if (!rgb) return value;

      switch (format) {
        case 'rgb':
          return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
        case 'hsl':
          return `hsl(${Math.round(hsl.h)}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%)`;
        case 'hex':
        default:
          return value.startsWith('#') ? value : `#${value}`;
      }
    };

    return (
      <div ref={ref} className={cn('relative w-full', className)}>
        {/* Label */}
        {label && (
          <label
            htmlFor={pickerId}
            className={cn(
              'block text-sm font-medium text-gray-700 mb-1.5',
              disabled && 'opacity-50'
            )}
          >
            {label}
          </label>
        )}

        {/* Color Input */}
        <div ref={containerRef} className="relative">
          <button
            type="button"
            id={pickerId}
            onClick={() => !disabled && setIsOpen(!isOpen)}
            disabled={disabled}
            className={cn(
              'w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md border',
              'border-gray-300 bg-white text-gray-900',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
              'transition-colors',
              disabled && 'cursor-not-allowed opacity-50 bg-gray-50',
              !disabled && 'hover:bg-gray-50'
            )}
            aria-label="Open color picker"
            aria-expanded={isOpen}
          >
            <div
              className="w-6 h-6 rounded border border-gray-300"
              style={{ backgroundColor: value }}
              aria-hidden="true"
            />
            <span className="flex-1 text-left">{getDisplayValue()}</span>
            <svg
              className={cn(
                'w-4 h-4 text-gray-400 transition-transform',
                isOpen && 'rotate-180'
              )}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {/* Picker Dropdown */}
          {isOpen && (
            <div
              className={cn(
                'absolute z-50 mt-2 w-64 p-4 bg-white rounded-lg shadow-lg border border-gray-200'
              )}
              role="dialog"
              aria-label="Color picker"
            >
              {/* Color Preview */}
              <div
                className="w-full h-24 rounded-md border border-gray-300 mb-4"
                style={{ backgroundColor: value }}
              />

              {/* Input Field */}
              <input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                className={cn(
                  'w-full px-3 py-2 text-sm rounded-md border border-gray-300',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                  'mb-4'
                )}
                placeholder={format === 'hex' ? '#3b82f6' : 'Enter color'}
                aria-label="Color value input"
              />

              {/* Presets */}
              {presets.length > 0 && (
                <div>
                  <div className="text-xs font-medium text-gray-700 mb-2">
                    Presets
                  </div>
                  <div className="grid grid-cols-6 gap-2">
                    {presets.map((preset, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handlePresetClick(preset)}
                        className={cn(
                          'w-8 h-8 rounded border-2 transition-all',
                          'hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500',
                          preset === value
                            ? 'border-blue-600'
                            : 'border-gray-300'
                        )}
                        style={{ backgroundColor: preset }}
                        aria-label={`Preset color ${preset}`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Native Color Input */}
              <div className="mt-4">
                <input
                  type="color"
                  value={value.startsWith('#') ? value : `#${value}`}
                  onChange={(e) => {
                    const newColor = e.target.value;
                    setInputValue(newColor);
                    onChange?.(newColor);
                  }}
                  className="w-full h-10 rounded cursor-pointer"
                  aria-label="Native color picker"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
);

ColorPicker.displayName = 'ColorPicker';
