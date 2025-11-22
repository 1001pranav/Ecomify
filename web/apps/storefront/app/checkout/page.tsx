'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ShoppingBag } from 'lucide-react';
import { Button } from '@ecomify/ui';
import { useCart } from '../../stores/cart-store';
import {
  CheckoutProgress,
  OrderSummary,
  InformationStep,
  ShippingStep,
  PaymentStep,
  type CheckoutStep,
  type InformationFormValues,
} from '../../components/checkout';
import type { CheckoutData, ShippingMethod } from '../../types/checkout';

/**
 * Checkout Page - Wizard/Stepper Pattern
 * Multi-step checkout flow
 */

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getItemCount } = useCart();
  const [step, setStep] = useState<CheckoutStep>('information');
  const [checkoutData, setCheckoutData] = useState<Partial<CheckoutData>>({});

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      router.push('/cart');
    }
  }, [items.length, router]);

  // Handle information step completion
  const handleInformationSubmit = (data: InformationFormValues) => {
    setCheckoutData((prev) => ({
      ...prev,
      email: data.email,
      phone: data.phone,
      shippingAddress: {
        firstName: data.firstName,
        lastName: data.lastName,
        address1: data.address1,
        address2: data.address2,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
        country: data.country,
      },
      saveInfo: data.saveInfo,
    }));
    setStep('shipping');
  };

  // Handle shipping step completion
  const handleShippingSubmit = (data: { shippingMethod: ShippingMethod }) => {
    setCheckoutData((prev) => ({
      ...prev,
      shippingMethod: data.shippingMethod,
    }));
    setStep('payment');
  };

  // Empty cart state
  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center text-center">
          <ShoppingBag className="h-24 w-24 text-muted-foreground" />
          <h1 className="mt-6 text-2xl font-bold">Your cart is empty</h1>
          <p className="mt-2 text-muted-foreground">
            Add some items to your cart before checkout
          </p>
          <Button asChild className="mt-6">
            <Link href="/products">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back to Cart */}
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link href="/cart">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Cart
          </Link>
        </Button>
      </div>

      {/* Progress */}
      <CheckoutProgress currentStep={step} />

      {/* Content */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Checkout Form */}
        <div className="lg:col-span-2">
          {step === 'information' && (
            <InformationStep
              data={checkoutData}
              onNext={handleInformationSubmit}
            />
          )}

          {step === 'shipping' && (
            <ShippingStep
              data={checkoutData}
              onNext={handleShippingSubmit}
              onBack={() => setStep('information')}
            />
          )}

          {step === 'payment' && (
            <PaymentStep
              data={checkoutData}
              onBack={() => setStep('shipping')}
            />
          )}
        </div>

        {/* Order Summary */}
        <div>
          <OrderSummary
            shippingCost={checkoutData.shippingMethod?.price}
            taxAmount={step === 'payment' ? (getItemCount() * 0.08) : undefined}
          />
        </div>
      </div>
    </div>
  );
}
