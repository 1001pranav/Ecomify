'use client';

import { useState } from 'react';
import { Truck, Package, Zap, ArrowLeft } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle, Label } from '@ecomify/ui';
import { formatCurrency, cn } from '@ecomify/utils';
import type { CheckoutData, ShippingMethod } from '../../types/checkout';

/**
 * Shipping Step - Shipping Method Selection
 * Second step of checkout flow
 */

interface ShippingStepProps {
  data: Partial<CheckoutData>;
  onNext: (data: { shippingMethod: ShippingMethod }) => void;
  onBack: () => void;
}

const shippingMethods: ShippingMethod[] = [
  {
    id: 'standard',
    name: 'Standard Shipping',
    description: '5-7 business days',
    price: 4.99,
    estimatedDays: '5-7',
    icon: 'Package',
  },
  {
    id: 'express',
    name: 'Express Shipping',
    description: '2-3 business days',
    price: 9.99,
    estimatedDays: '2-3',
    icon: 'Truck',
  },
  {
    id: 'overnight',
    name: 'Overnight Shipping',
    description: 'Next business day',
    price: 19.99,
    estimatedDays: '1',
    icon: 'Zap',
  },
];

const iconMap = {
  Package,
  Truck,
  Zap,
};

export function ShippingStep({ data, onNext, onBack }: ShippingStepProps) {
  const [selectedMethod, setSelectedMethod] = useState<string>(
    data.shippingMethod?.id || 'standard'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const method = shippingMethods.find((m) => m.id === selectedMethod);
    if (method) {
      onNext({ shippingMethod: method });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Shipping Address Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Ship to</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">
            {data.shippingAddress?.firstName} {data.shippingAddress?.lastName}
          </p>
          <p className="text-sm text-muted-foreground">
            {data.shippingAddress?.address1}
            {data.shippingAddress?.address2 && `, ${data.shippingAddress.address2}`}
          </p>
          <p className="text-sm text-muted-foreground">
            {data.shippingAddress?.city}, {data.shippingAddress?.state}{' '}
            {data.shippingAddress?.postalCode}
          </p>
          <p className="text-sm text-muted-foreground">
            {data.shippingAddress?.country}
          </p>
        </CardContent>
      </Card>

      {/* Shipping Methods */}
      <Card>
        <CardHeader>
          <CardTitle>Shipping Method</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {shippingMethods.map((method) => {
            const Icon = iconMap[method.icon as keyof typeof iconMap];
            const isSelected = selectedMethod === method.id;

            return (
              <label
                key={method.id}
                className={cn(
                  'flex cursor-pointer items-center gap-4 rounded-lg border p-4 transition-colors',
                  isSelected
                    ? 'border-primary bg-primary/5'
                    : 'border-muted hover:border-muted-foreground/50'
                )}
              >
                <input
                  type="radio"
                  name="shippingMethod"
                  value={method.id}
                  checked={isSelected}
                  onChange={() => setSelectedMethod(method.id)}
                  className="sr-only"
                />
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full',
                    isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{method.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {method.description}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">
                    {method.price === 0 ? 'Free' : formatCurrency(method.price)}
                  </p>
                </div>
              </label>
            );
          })}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between">
        <Button type="button" variant="ghost" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Return to Information
        </Button>
        <Button type="submit" size="lg">
          Continue to Payment
        </Button>
      </div>
    </form>
  );
}
