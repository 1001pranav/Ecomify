'use client';

import Image from 'next/image';
import { ShoppingBag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Separator, Badge } from '@ecomify/ui';
import { formatCurrency } from '@ecomify/utils';
import { useCart } from '../../stores/cart-store';

/**
 * Order Summary Component
 * Displays cart items and totals during checkout
 */

interface OrderSummaryProps {
  shippingCost?: number;
  taxAmount?: number;
}

export function OrderSummary({ shippingCost, taxAmount }: OrderSummaryProps) {
  const { items, getSubtotal, discountCode, discountAmount } = useCart();
  const subtotal = getSubtotal();
  const shipping = shippingCost || 0;
  const tax = taxAmount || 0;
  const total = subtotal - discountAmount + shipping + tax;

  return (
    <Card className="sticky top-4">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between text-lg">
          Order Summary
          <Badge variant="secondary">{items.length} items</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Items */}
        <div className="max-h-64 space-y-3 overflow-y-auto">
          {items.map((item) => (
            <div key={item.variantId} className="flex gap-3">
              <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded border bg-muted">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <ShoppingBag className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  {item.quantity}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium">{item.title}</p>
                {item.variantTitle && item.variantTitle !== 'Default' && (
                  <p className="text-xs text-muted-foreground">{item.variantTitle}</p>
                )}
              </div>
              <p className="text-sm font-medium">
                {formatCurrency(item.price * item.quantity)}
              </p>
            </div>
          ))}
        </div>

        <Separator />

        {/* Totals */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>

          {discountCode && discountAmount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount ({discountCode})</span>
              <span>-{formatCurrency(discountAmount)}</span>
            </div>
          )}

          <div className="flex justify-between">
            <span className="text-muted-foreground">Shipping</span>
            <span>
              {shippingCost !== undefined
                ? formatCurrency(shipping)
                : 'Calculated next'}
            </span>
          </div>

          {taxAmount !== undefined && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax</span>
              <span>{formatCurrency(tax)}</span>
            </div>
          )}

          <Separator />

          <div className="flex justify-between font-semibold text-base">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
