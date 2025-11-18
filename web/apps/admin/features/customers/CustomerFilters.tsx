'use client';

import { useState } from 'react';
import { Button, Input } from '@ecomify/ui';
import type { CustomerFilters as CustomerFiltersType } from '@ecomify/types';

/**
 * Customer Filters Component - Container/Presentational Pattern
 * Provides filtering UI for customer list
 */

interface CustomerFiltersProps {
  value: CustomerFiltersType;
  onChange: (filters: CustomerFiltersType) => void;
}

export function CustomerFilters({ value, onChange }: CustomerFiltersProps) {
  const [search, setSearch] = useState(value.search || '');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onChange({ ...value, search, page: 1 });
  };

  const handleReset = () => {
    setSearch('');
    onChange({ page: 1, limit: value.limit });
  };

  const hasActiveFilters = !!value.search;

  return (
    <div className="flex gap-2 items-center">
      <form onSubmit={handleSearchSubmit} className="flex gap-2 flex-1">
        <Input
          placeholder="Search customers by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />
        <Button type="submit">Search</Button>
      </form>

      {hasActiveFilters && (
        <Button variant="outline" onClick={handleReset}>
          Clear Filters
        </Button>
      )}
    </div>
  );
}
