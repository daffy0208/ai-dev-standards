/**
 * Stepper Component
 *
 * Multi-step progress indicator for wizards and multi-step forms.
 * Supports horizontal and vertical layouts with clickable steps.
 *
 * @example
 * ```tsx
 * // Horizontal stepper
 * <Stepper
 *   steps={[
 *     { label: 'Account', description: 'Create account' },
 *     { label: 'Profile', description: 'Setup profile' },
 *     { label: 'Complete', description: 'Finish setup' }
 *   ]}
 *   currentStep={1}
 * />
 *
 * // Vertical stepper
 * <Stepper
 *   orientation="vertical"
 *   steps={steps}
 *   currentStep={2}
 * />
 *
 * // Clickable steps
 * <Stepper
 *   steps={steps}
 *   currentStep={currentStep}
 *   onStepClick={(index) => setCurrentStep(index)}
 *   clickable
 * />
 *
 * // With custom icons
 * <Stepper
 *   steps={[
 *     { label: 'Step 1', icon: <Icon1 /> },
 *     { label: 'Step 2', icon: <Icon2 /> },
 *     { label: 'Step 3', icon: <Icon3 /> }
 *   ]}
 *   currentStep={1}
 * />
 * ```
 */

import * as React from 'react'
import { cn } from './utils'

export interface Step {
  /**
   * Step label
   */
  label: string

  /**
   * Optional description
   */
  description?: string

  /**
   * Custom icon for the step
   */
  icon?: React.ReactNode
}

export interface StepperProps {
  /**
   * Array of steps
   */
  steps: Step[]

  /**
   * Current active step index (0-based)
   */
  currentStep: number

  /**
   * Orientation of the stepper
   */
  orientation?: 'horizontal' | 'vertical'

  /**
   * Allow clicking on steps to navigate
   */
  clickable?: boolean

  /**
   * Callback when step is clicked (if clickable)
   */
  onStepClick?: (stepIndex: number) => void

  /**
   * Additional CSS classes
   */
  className?: string
}

/**
 * Stepper component for multi-step workflows
 */
export const Stepper = React.forwardRef<HTMLDivElement, StepperProps>(
  (
    { steps, currentStep, orientation = 'horizontal', clickable = false, onStepClick, className },
    ref
  ) => {
    const handleStepClick = (index: number) => {
      if (clickable && onStepClick) {
        onStepClick(index)
      }
    }

    const getStepState = (index: number): 'completed' | 'current' | 'upcoming' => {
      if (index < currentStep) return 'completed'
      if (index === currentStep) return 'current'
      return 'upcoming'
    }

    // Check icon for completed steps
    const CompletedIcon = () => (
      <svg
        className="w-5 h-5 text-white"
        fill="currentColor"
        viewBox="0 0 20 20"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
          clipRule="evenodd"
        />
      </svg>
    )

    if (orientation === 'vertical') {
      return (
        <nav ref={ref} aria-label="Progress" className={cn('space-y-4', className)}>
          {steps.map((step, index) => {
            const state = getStepState(index)
            const isClickable = clickable && state !== 'upcoming'

            return (
              <div key={index} className="relative flex items-start">
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      'absolute left-5 top-11 h-full w-0.5',
                      state === 'completed' ? 'bg-blue-600' : 'bg-gray-200'
                    )}
                    aria-hidden="true"
                  />
                )}

                {/* Step indicator */}
                <div className="relative flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => handleStepClick(index)}
                    disabled={!isClickable}
                    className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center',
                      'border-2 transition-all',
                      'focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2',
                      {
                        'bg-blue-600 border-blue-600': state === 'completed' || state === 'current',
                        'bg-white border-gray-300': state === 'upcoming',
                        'cursor-pointer hover:bg-blue-700': isClickable,
                        'cursor-default': !isClickable
                      }
                    )}
                    aria-current={state === 'current' ? 'step' : undefined}
                  >
                    {state === 'completed' ? (
                      <CompletedIcon />
                    ) : step.icon ? (
                      step.icon
                    ) : (
                      <span
                        className={cn(
                          'text-sm font-semibold',
                          state === 'current' ? 'text-white' : 'text-gray-500'
                        )}
                      >
                        {index + 1}
                      </span>
                    )}
                  </button>
                </div>

                {/* Step content */}
                <div className="ml-4 min-w-0 flex-1">
                  <h3
                    className={cn(
                      'text-sm font-medium',
                      state === 'upcoming' ? 'text-gray-500' : 'text-gray-900'
                    )}
                  >
                    {step.label}
                  </h3>
                  {step.description && <p className="text-sm text-gray-500">{step.description}</p>}
                </div>
              </div>
            )
          })}
        </nav>
      )
    }

    // Horizontal orientation
    return (
      <nav ref={ref} aria-label="Progress" className={cn('w-full', className)}>
        <ol className="flex items-center w-full">
          {steps.map((step, index) => {
            const state = getStepState(index)
            const isClickable = clickable && state !== 'upcoming'
            const isLast = index === steps.length - 1

            return (
              <li key={index} className={cn('flex items-center', !isLast && 'flex-1')}>
                <div className="flex flex-col items-center">
                  {/* Step indicator */}
                  <button
                    type="button"
                    onClick={() => handleStepClick(index)}
                    disabled={!isClickable}
                    className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center',
                      'border-2 transition-all',
                      'focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2',
                      {
                        'bg-blue-600 border-blue-600': state === 'completed' || state === 'current',
                        'bg-white border-gray-300': state === 'upcoming',
                        'cursor-pointer hover:bg-blue-700': isClickable,
                        'cursor-default': !isClickable
                      }
                    )}
                    aria-current={state === 'current' ? 'step' : undefined}
                  >
                    {state === 'completed' ? (
                      <CompletedIcon />
                    ) : step.icon ? (
                      step.icon
                    ) : (
                      <span
                        className={cn(
                          'text-sm font-semibold',
                          state === 'current' ? 'text-white' : 'text-gray-500'
                        )}
                      >
                        {index + 1}
                      </span>
                    )}
                  </button>

                  {/* Step label */}
                  <div className="mt-2 text-center">
                    <h3
                      className={cn(
                        'text-xs font-medium whitespace-nowrap',
                        state === 'upcoming' ? 'text-gray-500' : 'text-gray-900'
                      )}
                    >
                      {step.label}
                    </h3>
                    {step.description && (
                      <p className="text-xs text-gray-500 whitespace-nowrap">{step.description}</p>
                    )}
                  </div>
                </div>

                {/* Connector line */}
                {!isLast && (
                  <div
                    className={cn(
                      'flex-1 h-0.5 mx-4 -mt-10',
                      state === 'completed' ? 'bg-blue-600' : 'bg-gray-200'
                    )}
                    aria-hidden="true"
                  />
                )}
              </li>
            )
          })}
        </ol>
      </nav>
    )
  }
)

Stepper.displayName = 'Stepper'
