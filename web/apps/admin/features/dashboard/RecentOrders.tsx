'use client';

import Link from 'next/link';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Badge,
} from '@ecomify/ui';
import { useOrders } from '@ecomify/api-client';
import { formatCurrency, formatDate } from '@ecomify/utils';
import type { OrderFinancialStatus, OrderFulfillmentStatus } from '@ecomify/types';

/**
 * RecentOrders Component
 *
 * Displays a table of the 5 most recent orders with their details.
 *
 * Following the Container/Presentational Pattern
 */

export function RecentOrders() {
  const { data, isLoading, error } = useOrders({ limit: 5 });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Failed to load recent orders
          </p>
        </CardContent>
      </Card>
    );
  }

  const orders = data?.data || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Orders</CardTitle>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <p className="text-sm text-muted-foreground">No orders yet</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <Link
                      href={`/orders/${order.id}`}
                      className="font-medium hover:underline"
                    >
                      #{order.orderNumber}
                    </Link>
                  </TableCell>
                  <TableCell>{order.email}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(order.createdAt, 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell>
                    {formatCurrency(order.totalPrice, order.currency)}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <StatusBadge status={order.financialStatus} />
                      <FulfillmentBadge status={order.fulfillmentStatus} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        {orders.length > 0 && (
          <div className="mt-4 text-center">
            <Link
              href="/orders"
              className="text-sm text-primary hover:underline"
            >
              View all orders
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: OrderFinancialStatus }) {
  const variants: Record<OrderFinancialStatus, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
    paid: { variant: 'default', label: 'Paid' },
    pending: { variant: 'secondary', label: 'Pending' },
    partially_paid: { variant: 'secondary', label: 'Partially Paid' },
    refunded: { variant: 'outline', label: 'Refunded' },
    voided: { variant: 'destructive', label: 'Voided' },
  };

  const { variant, label } = variants[status];

  return <Badge variant={variant}>{label}</Badge>;
}

function FulfillmentBadge({ status }: { status: OrderFulfillmentStatus }) {
  const variants: Record<OrderFulfillmentStatus, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
    fulfilled: { variant: 'default', label: 'Fulfilled' },
    unfulfilled: { variant: 'secondary', label: 'Unfulfilled' },
    partially_fulfilled: { variant: 'secondary', label: 'Partial' },
    cancelled: { variant: 'destructive', label: 'Cancelled' },
  };

  const { variant, label } = variants[status];

  return <Badge variant={variant}>{label}</Badge>;
}
