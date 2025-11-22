'use client';

import { Grid2X2, List, ChevronDown } from 'lucide-react';
import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@ecomify/ui';

/**
 * Product Sort Component
 * Sorting options for product listing
 */

interface ProductSortProps {
  value?: string;
  onChange: (value: string) => void;
}

const sortOptions = [
  { value: 'newest', label: 'Newest' },
  { value: 'best-selling', label: 'Best Selling' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'name-asc', label: 'Name: A to Z' },
  { value: 'name-desc', label: 'Name: Z to A' },
];

export function ProductSort({ value = 'newest', onChange }: ProductSortProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Sort by" />
      </SelectTrigger>
      <SelectContent>
        {sortOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/**
 * View Toggle Component
 * Toggle between grid and list views
 */

interface ViewToggleProps {
  view: 'grid' | 'list';
  onChange: (view: 'grid' | 'list') => void;
}

export function ViewToggle({ view, onChange }: ViewToggleProps) {
  return (
    <div className="flex rounded-md border">
      <Button
        variant={view === 'grid' ? 'secondary' : 'ghost'}
        size="icon"
        className="rounded-r-none"
        onClick={() => onChange('grid')}
      >
        <Grid2X2 className="h-4 w-4" />
        <span className="sr-only">Grid view</span>
      </Button>
      <Button
        variant={view === 'list' ? 'secondary' : 'ghost'}
        size="icon"
        className="rounded-l-none border-l"
        onClick={() => onChange('list')}
      >
        <List className="h-4 w-4" />
        <span className="sr-only">List view</span>
      </Button>
    </div>
  );
}

/**
 * Products Header Component
 * Contains sort, view toggle, and product count
 */

interface ProductsHeaderProps {
  totalProducts: number;
  sort: string;
  onSortChange: (sort: string) => void;
  view: 'grid' | 'list';
  onViewChange: (view: 'grid' | 'list') => void;
}

export function ProductsHeader({
  totalProducts,
  sort,
  onSortChange,
  view,
  onViewChange,
}: ProductsHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        {totalProducts} {totalProducts === 1 ? 'product' : 'products'}
      </p>
      <div className="flex items-center gap-4">
        <ProductSort value={sort} onChange={onSortChange} />
        <ViewToggle view={view} onChange={onViewChange} />
      </div>
    </div>
  );
}
