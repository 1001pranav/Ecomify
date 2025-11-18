'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useOrder } from '@ecomify/api-client';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Separator,
  Button,
} from '@ecomify/ui';
import { ArrowLeft, Package, RefreshCw, XCircle } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { OrderLineItems } from './OrderLineItems';
import { AddressDisplay } from './AddressDisplay';
import { OrderTimeline } from './OrderTimeline';
import { FulfillmentDialog } from './FulfillmentDialog';

/**
 * Order Detail Component - Container/Presentational Pattern
 * Displays comprehensive order information
 */

interface OrderDetailProps {
  orderId: string;
}

export function OrderDetail({ orderId }: OrderDetailProps) {
  const { data: order, isLoading } = useOrder(orderId);
  const [showFulfillDialog, setShowFulfillDialog] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading order details...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="text-2xl font-semibold">Order not found</div>
        <Link href="/orders">
          <Button variant="outline">Back to Orders</Button>
        </Link>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: order.currency,
    }).format(amount);
  };

  const canFulfill = order.fulfillmentStatus === 'unfulfilled' ||
                     order.fulfillmentStatus === 'partially_fulfilled';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link href="/orders">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Orders
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold">Order {order.orderNumber}</h1>
          <p className="text-muted-foreground">{formatDate(order.createdAt)}</p>
        </div>
        <div className="flex gap-2">
          {canFulfill && (
            <Button onClick={() => setShowFulfillDialog(true)}>
              <Package className="h-4 w-4 mr-2" />
              Fulfill Order
            </Button>
          )}
        </div>
      </div>

      {/* Status Badges */}
      <div className="flex gap-2">
        <StatusBadge status={order.financialStatus} type="financial" />
        <StatusBadge status={order.fulfillmentStatus} type="fulfillment" />
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="col-span-2 space-y-6">
          {/* Line Items */}
          <Card>
            <CardHeader>
              <CardTitle>Items</CardTitle>
            </CardHeader>
            <CardContent>
              <OrderLineItems items={order.lineItems} currency={order.currency} />
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <OrderTimeline order={order} />
            </CardContent>
          </Card>

          {/* Notes */}
          {order.note && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{order.note}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer */}
          <Card>
            <CardHeader>
              <CardTitle>Customer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <div className="font-medium">{order.email}</div>
                {order.phone && (
                  <div className="text-sm text-muted-foreground">{order.phone}</div>
                )}
              </div>
              {order.customerId && (
                <Link href={`/customers/${order.customerId}`}>
                  <Button variant="link" size="sm" className="px-0">
                    View customer profile
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle>Shipping Address</CardTitle>
            </CardHeader>
            <CardContent>
              <AddressDisplay address={order.shippingAddress} />
            </CardContent>
          </Card>

          {/* Billing Address */}
          <Card>
            <CardHeader>
              <CardTitle>Billing Address</CardTitle>
            </CardHeader>
            <CardContent>
              <AddressDisplay address={order.billingAddress} />
            </CardContent>
          </Card>

          {/* Payment Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Payment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(order.subtotalPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{formatCurrency(order.totalShipping)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span>{formatCurrency(order.totalTax)}</span>
                </div>
                {order.totalDiscount > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Discount</span>
                    <span>-{formatCurrency(order.totalDiscount)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-bold text-base">
                  <span>Total</span>
                  <span>{formatCurrency(order.totalPrice)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          {order.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {order.tags.map((tag) => (
                    <div
                      key={tag}
                      className="px-2 py-1 bg-gray-100 rounded text-sm"
                    >
                      {tag}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Fulfillment Dialog */}
      {showFulfillDialog && (
        <FulfillmentDialog
          order={order}
          open={showFulfillDialog}
          onClose={() => setShowFulfillDialog(false)}
        />
      )}
    </div>
  );
}
