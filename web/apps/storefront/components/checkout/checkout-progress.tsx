'use client';

import { Check } from 'lucide-react';
import { cn } from '@ecomify/utils';

/**
 * Checkout Progress Component - Wizard/Stepper Pattern
 * Shows progress through checkout steps
 */

export type CheckoutStep = 'information' | 'shipping' | 'payment';

interface CheckoutProgressProps {
  currentStep: CheckoutStep;
}

const steps: Array<{ key: CheckoutStep; label: string }> = [
  { key: 'information', label: 'Information' },
  { key: 'shipping', label: 'Shipping' },
  { key: 'payment', label: 'Payment' },
];

export function CheckoutProgress({ currentStep }: CheckoutProgressProps) {
  const currentIndex = steps.findIndex((s) => s.key === currentStep);

  return (
    <nav aria-label="Checkout progress" className="mb-8">
      <ol className="flex items-center justify-center gap-4 sm:gap-8">
        {steps.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <li key={step.key} className="flex items-center">
              <div className="flex items-center">
                <span
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-medium transition-colors',
                    isCompleted
                      ? 'border-primary bg-primary text-primary-foreground'
                      : isCurrent
                      ? 'border-primary bg-background text-primary'
                      : 'border-muted bg-background text-muted-foreground'
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    index + 1
                  )}
                </span>
                <span
                  className={cn(
                    'ml-2 text-sm font-medium hidden sm:block',
                    isCurrent ? 'text-foreground' : 'text-muted-foreground'
                  )}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'ml-4 h-0.5 w-8 sm:w-16',
                    index < currentIndex ? 'bg-primary' : 'bg-muted'
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
