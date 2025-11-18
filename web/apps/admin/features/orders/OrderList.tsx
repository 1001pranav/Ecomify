'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useOrders } from '@ecomify/api-client';
import type { OrderFilters as OrderFiltersType } from '@ecomify/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@ecomify/ui';
import { OrderFilters } from './OrderFilters';
import { StatusBadge } from './StatusBadge';
import { OrderActions } from './OrderActions';
import { Pagination } from '../products/Pagination';

/**
 * Order List Component - Container/Presentational Pattern
 * Main container for displaying and managing orders
 */

export function OrderList() {
  const [filters, setFilters] = useState<OrderFiltersType>({
    page: 1,
    limit: 20,
  });

  const { data, isLoading } = useOrders(filters);

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

  const handleExport = async () => {
    // TODO: Implement export functionality
    console.log('Export orders', filters);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Orders</h1>
        <Button variant="outline" onClick={handleExport}>
          Export
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filter Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <OrderFilters value={filters} onChange={setFilters} />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Fulfillment</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Loading orders...
                  </TableCell>
                </TableRow>
              ) : !data?.data || data.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No orders found
                  </TableCell>
                </TableRow>
              ) : (
                data.data.map((order) => (
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
                    <TableCell>{order.email}</TableCell>
                    <TableCell>{formatCurrency(order.totalPrice, order.currency)}</TableCell>
                    <TableCell>
                      <StatusBadge status={order.financialStatus} type="financial" />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={order.fulfillmentStatus} type="fulfillment" />
                    </TableCell>
                    <TableCell className="text-right">
                      <OrderActions order={order} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {data && data.totalPages > 1 && (
        <Pagination
          currentPage={filters.page || 1}
          totalPages={data.totalPages}
          onPageChange={(page) => setFilters({ ...filters, page })}
        />
      )}
    </div>
  );
}
