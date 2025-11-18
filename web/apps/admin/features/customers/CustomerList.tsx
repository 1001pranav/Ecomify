'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCustomers } from '@ecomify/api-client';
import type { CustomerFilters as CustomerFiltersType } from '@ecomify/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
} from '@ecomify/ui';
import { CustomerFilters } from './CustomerFilters';
import { Pagination } from '../products/Pagination';

/**
 * Customer List Component - Container/Presentational Pattern
 * Displays and manages customer list with filtering
 */

export function CustomerList() {
  const [filters, setFilters] = useState<CustomerFiltersType>({
    page: 1,
    limit: 20,
  });

  const { data, isLoading } = useCustomers(filters);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getCustomerName = (customer: any) => {
    if (customer.firstName || customer.lastName) {
      return `${customer.firstName || ''} ${customer.lastName || ''}`.trim();
    }
    return customer.email;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Customers</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filter Customers</CardTitle>
        </CardHeader>
        <CardContent>
          <CustomerFilters value={filters} onChange={setFilters} />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead className="text-right">Orders</TableHead>
                <TableHead className="text-right">Total Spent</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Tags</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Loading customers...
                  </TableCell>
                </TableRow>
              ) : !data?.data || data.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No customers found
                  </TableCell>
                </TableRow>
              ) : (
                data.data.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <Link
                        href={`/customers/${customer.id}`}
                        className="font-medium text-blue-600 hover:underline"
                      >
                        {getCustomerName(customer)}
                      </Link>
                    </TableCell>
                    <TableCell>{customer.email}</TableCell>
                    <TableCell>{customer.phone || '-'}</TableCell>
                    <TableCell className="text-right">{customer.ordersCount}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(customer.totalSpent)}
                    </TableCell>
                    <TableCell>{formatDate(customer.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {customer.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {customer.tags.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{customer.tags.length - 2}
                          </Badge>
                        )}
                      </div>
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
