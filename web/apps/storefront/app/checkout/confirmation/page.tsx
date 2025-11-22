'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Package, Truck, Mail, ArrowRight } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle, Separator } from '@ecomify/ui';

/**
 * Order Confirmation Page
 * Displayed after successful checkout
 */

export default function OrderConfirmationPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId') || 'N/A';

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-2xl">
        {/* Success Icon */}
        <div className="flex justify-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
        </div>

        {/* Success Message */}
        <div className="mt-8 text-center">
          <h1 className="text-3xl font-bold">Thank you for your order!</h1>
          <p className="mt-2 text-muted-foreground">
            Your order has been confirmed and will be shipped soon.
          </p>
        </div>

        {/* Order Number */}
        <Card className="mt-8">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Order number</p>
                <p className="text-lg font-semibold">{orderId}</p>
              </div>
              <Button variant="outline" size="sm">
                View Order
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* What's Next */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>What happens next?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">Order Confirmation Email</h3>
                <p className="text-sm text-muted-foreground">
                  You will receive an email confirmation with your order details.
                </p>
              </div>
            </div>

            <Separator />

            <div className="flex gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">Order Processing</h3>
                <p className="text-sm text-muted-foreground">
                  We'll start preparing your order for shipment.
                </p>
              </div>
            </div>

            <Separator />

            <div className="flex gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Truck className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">Shipping Notification</h3>
                <p className="text-sm text-muted-foreground">
                  You'll receive tracking information once your order ships.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Button asChild>
            <Link href="/products">
              Continue Shopping
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/account/orders">View All Orders</Link>
          </Button>
        </div>

        {/* Support */}
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            Have questions about your order?{' '}
            <Link href="/contact" className="text-primary hover:underline">
              Contact our support team
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
