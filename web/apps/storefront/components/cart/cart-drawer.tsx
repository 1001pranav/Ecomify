'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Minus, Plus, X, ShoppingBag } from 'lucide-react';
import {
  Button,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  Separator,
  ScrollArea,
} from '@ecomify/ui';
import { formatCurrency } from '@ecomify/utils';
import { useCart } from '../../stores/cart-store';
import type { CartItem } from '@ecomify/types';

/**
 * Cart Drawer Component
 * Slide-out cart with item management
 */

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const router = useRouter();
  const { items, getTotal, getSubtotal, getItemCount, removeItem, updateQuantity } =
    useCart();

  const handleCheckout = () => {
    onClose();
    router.push('/checkout');
  };

  const handleViewCart = () => {
    onClose();
    router.push('/cart');
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="flex w-full flex-col sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Shopping Cart ({getItemCount()})
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <EmptyCart onClose={onClose} />
        ) : (
          <>
            {/* Cart Items */}
            <ScrollArea className="flex-1 -mx-6 px-6">
              <div className="space-y-4 py-4">
                {items.map((item) => (
                  <CartItemRow
                    key={item.variantId}
                    item={item}
                    onRemove={() => removeItem(item.variantId)}
                    onUpdateQuantity={(qty) => updateQuantity(item.variantId, qty)}
                  />
                ))}
              </div>
            </ScrollArea>

            {/* Cart Summary */}
            <div className="space-y-4 pt-4">
              <Separator />
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(getSubtotal())}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-muted-foreground">Calculated at checkout</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>{formatCurrency(getTotal())}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Button className="w-full" size="lg" onClick={handleCheckout}>
                  Checkout
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleViewCart}
                >
                  View Cart
                </Button>
              </div>

              <p className="text-center text-xs text-muted-foreground">
                Shipping and taxes calculated at checkout
              </p>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

/**
 * Empty Cart State
 */
function EmptyCart({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4">
      <ShoppingBag className="h-16 w-16 text-muted-foreground" />
      <div className="text-center">
        <h3 className="font-semibold">Your cart is empty</h3>
        <p className="text-sm text-muted-foreground">
          Add items to your cart to checkout
        </p>
      </div>
      <Button onClick={onClose} asChild>
        <Link href="/products">Continue Shopping</Link>
      </Button>
    </div>
  );
}

/**
 * Cart Item Row Component
 */
interface CartItemRowProps {
  item: CartItem;
  onRemove: () => void;
  onUpdateQuantity: (quantity: number) => void;
}

function CartItemRow({ item, onRemove, onUpdateQuantity }: CartItemRowProps) {
  return (
    <div className="flex gap-4">
      {/* Image */}
      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border bg-muted">
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
            <h4 className="font-medium leading-tight">
              <Link href={`/products/${item.productId}`} className="hover:underline">
                {item.title}
              </Link>
            </h4>
            {item.variantTitle && item.variantTitle !== 'Default' && (
              <p className="text-sm text-muted-foreground">{item.variantTitle}</p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onRemove}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Remove</span>
          </Button>
        </div>

        <div className="mt-auto flex items-center justify-between">
          {/* Quantity controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => onUpdateQuantity(item.quantity - 1)}
              disabled={item.quantity <= 1}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="w-8 text-center text-sm">{item.quantity}</span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => onUpdateQuantity(item.quantity + 1)}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          {/* Price */}
          <p className="font-medium">
            {formatCurrency(item.price * item.quantity)}
          </p>
        </div>
      </div>
    </div>
  );
}
