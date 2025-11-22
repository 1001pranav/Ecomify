'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Minus, Plus, X, ShoppingBag, ArrowLeft, Trash2 } from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Separator,
} from '@ecomify/ui';
import { formatCurrency } from '@ecomify/utils';
import { StorefrontLayout } from '../../components/layout';
import { useCart } from '../../stores/cart-store';

/**
 * Cart Page - Full Cart View
 * Complete shopping cart with quantity management and checkout
 */

export default function CartPage() {
  const router = useRouter();
  const {
    items,
    getSubtotal,
    getTotal,
    getItemCount,
    removeItem,
    updateQuantity,
    clearCart,
    discountCode,
    discountAmount,
  } = useCart();

  if (items.length === 0) {
    return (
      <StorefrontLayout>
        <div className="container mx-auto px-4 py-16">
          <div className="flex flex-col items-center justify-center text-center">
            <ShoppingBag className="h-24 w-24 text-muted-foreground" />
            <h1 className="mt-6 text-2xl font-bold">Your cart is empty</h1>
            <p className="mt-2 text-muted-foreground">
              Looks like you haven't added anything to your cart yet
            </p>
            <Button asChild className="mt-6">
              <Link href="/products">Continue Shopping</Link>
            </Button>
          </div>
        </div>
      </StorefrontLayout>
    );
  }

  return (
    <StorefrontLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Shopping Cart</h1>
            <p className="text-muted-foreground">
              {getItemCount()} {getItemCount() === 1 ? 'item' : 'items'} in your cart
            </p>
          </div>
          <Button variant="ghost" onClick={clearCart}>
            <Trash2 className="mr-2 h-4 w-4" />
            Clear Cart
          </Button>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="divide-y p-0">
                {items.map((item) => (
                  <div key={item.variantId} className="flex gap-4 p-4">
                    {/* Image */}
                    <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border bg-muted">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex flex-1 flex-col">
                      <div className="flex justify-between">
                        <div>
                          <Link
                            href={`/products/${item.productId}`}
                            className="font-semibold hover:underline"
                          >
                            {item.title}
                          </Link>
                          {item.variantTitle && item.variantTitle !== 'Default' && (
                            <p className="text-sm text-muted-foreground">
                              {item.variantTitle}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => removeItem(item.variantId)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="mt-auto flex items-center justify-between">
                        {/* Quantity */}
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) =>
                              updateQuantity(item.variantId, parseInt(e.target.value) || 1)
                            }
                            className="h-8 w-16 text-center"
                            min={1}
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <p className="font-semibold">
                            {formatCurrency(item.price * item.quantity)}
                          </p>
                          {item.quantity > 1 && (
                            <p className="text-sm text-muted-foreground">
                              {formatCurrency(item.price)} each
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Continue Shopping */}
            <div className="mt-4">
              <Button variant="ghost" asChild>
                <Link href="/products">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Continue Shopping
                </Link>
              </Button>
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Discount Code */}
                <div className="flex gap-2">
                  <Input placeholder="Discount code" className="flex-1" />
                  <Button variant="outline">Apply</Button>
                </div>

                <Separator />

                {/* Totals */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatCurrency(getSubtotal())}</span>
                  </div>

                  {discountCode && discountAmount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount ({discountCode})</span>
                      <span>-{formatCurrency(discountAmount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="text-muted-foreground">
                      Calculated at checkout
                    </span>
                  </div>

                  <Separator />

                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>{formatCurrency(getTotal())}</span>
                  </div>
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => router.push('/checkout')}
                >
                  Proceed to Checkout
                </Button>

                <p className="text-center text-xs text-muted-foreground">
                  Shipping and taxes calculated at checkout
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </StorefrontLayout>
  );
}
