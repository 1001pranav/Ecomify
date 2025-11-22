'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CreditCard, Lock, Loader2 } from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Checkbox,
  Separator,
} from '@ecomify/ui';
import { formatCurrency } from '@ecomify/utils';
import { useCart } from '../../stores/cart-store';
import type { CheckoutData } from '../../types/checkout';

/**
 * Payment Step - Payment Information
 * Final step of checkout flow with Stripe-like payment form
 */

interface PaymentStepProps {
  data: Partial<CheckoutData>;
  onBack: () => void;
}

export function PaymentStep({ data, onBack }: PaymentStepProps) {
  const router = useRouter();
  const { getSubtotal, discountAmount, clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [sameAsShipping, setSameAsShipping] = useState(true);

  // Payment form state
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardName, setCardName] = useState('');

  // Calculate totals
  const subtotal = getSubtotal();
  const shipping = data.shippingMethod?.price || 0;
  const tax = (subtotal - discountAmount) * 0.08; // 8% tax
  const total = subtotal - discountAmount + shipping + tax;

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0; i < match.length; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(' ') : v;
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Generate order ID
      const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;

      // Clear cart and redirect to confirmation
      clearCart();
      router.push(`/checkout/confirmation?orderId=${orderId}`);
    } catch (error) {
      console.error('Payment failed:', error);
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Order Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Contact</span>
            <span className="text-muted-foreground">{data.email}</span>
          </div>
          <div className="flex justify-between">
            <span>Ship to</span>
            <span className="text-muted-foreground">
              {data.shippingAddress?.city}, {data.shippingAddress?.state}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Method</span>
            <span className="text-muted-foreground">
              {data.shippingMethod?.name} · {formatCurrency(data.shippingMethod?.price || 0)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Payment Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            All transactions are secure and encrypted
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="cardNumber">Card Number</Label>
            <div className="relative">
              <Input
                id="cardNumber"
                placeholder="1234 1234 1234 1234"
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                maxLength={19}
                required
              />
              <Lock className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="cardExpiry">Expiration Date</Label>
              <Input
                id="cardExpiry"
                placeholder="MM/YY"
                value={cardExpiry}
                onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                maxLength={5}
                required
              />
            </div>
            <div>
              <Label htmlFor="cardCvc">Security Code</Label>
              <Input
                id="cardCvc"
                placeholder="CVC"
                value={cardCvc}
                onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                maxLength={4}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="cardName">Name on Card</Label>
            <Input
              id="cardName"
              placeholder="Full name on card"
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              required
            />
          </div>
        </CardContent>
      </Card>

      {/* Billing Address */}
      <Card>
        <CardHeader>
          <CardTitle>Billing Address</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Checkbox
              id="sameAsShipping"
              checked={sameAsShipping}
              onCheckedChange={(checked) => setSameAsShipping(checked as boolean)}
            />
            <Label htmlFor="sameAsShipping" className="text-sm font-normal">
              Same as shipping address
            </Label>
          </div>

          {!sameAsShipping && (
            <div className="mt-4 space-y-4">
              <p className="text-sm text-muted-foreground">
                Billing address form would go here...
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Final Totals */}
      <Card>
        <CardContent className="space-y-2 pt-6 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount</span>
              <span>-{formatCurrency(discountAmount)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Shipping</span>
            <span>{formatCurrency(shipping)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tax</span>
            <span>{formatCurrency(tax)}</span>
          </div>
          <Separator />
          <div className="flex justify-between text-lg font-semibold">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between">
        <Button type="button" variant="ghost" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Return to Shipping
        </Button>
        <Button type="submit" size="lg" disabled={isProcessing}>
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            `Pay ${formatCurrency(total)}`
          )}
        </Button>
      </div>
    </form>
  );
}
