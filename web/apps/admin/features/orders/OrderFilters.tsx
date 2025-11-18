'use client';

import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Button,
  Input,
} from '@ecomify/ui';
import type { OrderFilters as OrderFiltersType } from '@ecomify/types';

/**
 * Order Filters Component - Container/Presentational Pattern
 * Manages filter state and provides UI for filtering orders
 */

interface OrderFiltersProps {
  value: OrderFiltersType;
  onChange: (filters: OrderFiltersType) => void;
}

export function OrderFilters({ value, onChange }: OrderFiltersProps) {
  const [search, setSearch] = useState(value.search || '');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onChange({ ...value, search, page: 1 });
  };

  const handleReset = () => {
    setSearch('');
    onChange({ page: 1, limit: value.limit });
  };

  const hasActiveFilters = !!(
    value.search ||
    value.financialStatus ||
    value.fulfillmentStatus
  );

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <Input
          placeholder="Search orders by number, customer email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />
        <Button type="submit">Search</Button>
      </form>

      <div className="flex gap-4 items-center">
        <Select
          value={value.financialStatus || 'all'}
          onValueChange={(val) =>
            onChange({
              ...value,
              financialStatus: val === 'all' ? undefined : (val as any),
              page: 1,
            })
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Payment Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Payments</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="partially_paid">Partially Paid</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
            <SelectItem value="voided">Voided</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={value.fulfillmentStatus || 'all'}
          onValueChange={(val) =>
            onChange({
              ...value,
              fulfillmentStatus: val === 'all' ? undefined : (val as any),
              page: 1,
            })
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Fulfillment Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Fulfillments</SelectItem>
            <SelectItem value="fulfilled">Fulfilled</SelectItem>
            <SelectItem value="unfulfilled">Unfulfilled</SelectItem>
            <SelectItem value="partially_fulfilled">Partially Fulfilled</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button variant="outline" onClick={handleReset}>
            Clear Filters
          </Button>
        )}
      </div>
    </div>
  );
}
