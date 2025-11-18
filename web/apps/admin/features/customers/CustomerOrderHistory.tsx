'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { apiClient } from '@ecomify/api-client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@ecomify/ui';
import { StatusBadge } from '../orders/StatusBadge';

/**
 * Customer Order History Component
 * Displays order history for a specific customer
 */

interface CustomerOrderHistoryProps {
  customerId: string;
}

export function CustomerOrderHistory({ customerId }: CustomerOrderHistoryProps) {
  const { data: orders, isLoading } = useQuery({
    queryKey: ['customer-orders', customerId],
    queryFn: async () => {
      const response = await apiClient.customers.getOrders(customerId);
      return response.data;
    },
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Loading order history...
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No orders found for this customer
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Order</TableHead>
          <TableHead>Date</TableHead>
          <TableHead className="text-right">Total</TableHead>
          <TableHead>Payment</TableHead>
          <TableHead>Fulfillment</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => (
          <TableRow key={order.id}>
            <TableCell>
              <Link
                href={`/orders/${order.id}`}
                className="font-medium text-blue-600 hover:underline"
              >
                {order.orderNumber}
              </Link>
            </TableCell>
            <TableCell>{formatDate(order.createdAt)}</TableCell>
            <TableCell className="text-right">
              {formatCurrency(order.totalPrice, order.currency)}
            </TableCell>
            <TableCell>
              <StatusBadge status={order.financialStatus} type="financial" />
            </TableCell>
            <TableCell>
              <StatusBadge status={order.fulfillmentStatus} type="fulfillment" />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
