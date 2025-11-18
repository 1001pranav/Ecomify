'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button, Input } from '@ecomify/ui';
import { useProducts } from '@ecomify/api-client';
import { useDebounce } from '@ecomify/hooks';
import type { Status, ProductFilters as ProductFiltersType } from '@ecomify/types';
import { Plus, Search } from 'lucide-react';
import { ProductTable } from './ProductTable';
import { ProductFilters } from './ProductFilters';
import { Pagination } from './Pagination';

/**
 * ProductList Component
 *
 * Main container component for the product listing page.
 * Manages state for filters, search, and pagination.
 * Uses Container/Presentational Pattern.
 *
 * Features:
 * - Search with debouncing
 * - Filters (status, category, price, tags)
 * - Pagination
 * - Add Product button
 */

export function ProductList() {
  // State management
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<Status | undefined>();
  const [categoryId, setCategoryId] = useState<string | undefined>();
  const [minPrice, setMinPrice] = useState<number | undefined>();
  const [maxPrice, setMaxPrice] = useState<number | undefined>();
  const [tags, setTags] = useState<string[]>([]);
  const [page, setPage] = useState(1);

  // Debounce search to avoid excessive API calls
  const debouncedSearch = useDebounce(search, 500);

  // Build filters object
  const filters: ProductFiltersType = {
    search: debouncedSearch || undefined,
    status,
    categoryId,
    minPrice,
    maxPrice,
    tags: tags.length > 0 ? tags : undefined,
    page,
    limit: 10,
  };

  // Fetch products with filters
  const { data, isLoading, error } = useProducts(filters);

  const products = data?.data || [];
  const totalPages = data?.totalPages || 1;
  const total = data?.total || 0;

  // Clear all filters
  const handleClearFilters = () => {
    setSearch('');
    setStatus(undefined);
    setCategoryId(undefined);
    setMinPrice(undefined);
    setMaxPrice(undefined);
    setTags([]);
    setPage(1);
  };

  // Handle price range change
  const handlePriceRangeChange = (min?: number, max?: number) => {
    setMinPrice(min);
    setMaxPrice(max);
    setPage(1); // Reset to first page when filters change
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    // Scroll to top of page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">
            Manage your product catalog ({total} total)
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/products/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Link>
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search products..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1); // Reset to first page when search changes
          }}
          className="pl-9"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-[260px_1fr]">
        {/* Filters Sidebar */}
        <aside>
          <ProductFilters
            status={status}
            categoryId={categoryId}
            minPrice={minPrice}
            maxPrice={maxPrice}
            tags={tags}
            onStatusChange={(newStatus) => {
              setStatus(newStatus);
              setPage(1);
            }}
            onCategoryChange={(newCategoryId) => {
              setCategoryId(newCategoryId);
              setPage(1);
            }}
            onPriceRangeChange={handlePriceRangeChange}
            onTagsChange={(newTags) => {
              setTags(newTags);
              setPage(1);
            }}
            onClearFilters={handleClearFilters}
          />
        </aside>

        {/* Products Table */}
        <div className="space-y-4">
          {/* Error State */}
          {error && (
            <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
              <p className="text-sm text-destructive">
                Failed to load products. Please try again later.
              </p>
            </div>
          )}

          {/* Table */}
          <ProductTable products={products} isLoading={isLoading} />

          {/* Pagination */}
          {!isLoading && totalPages > 1 && (
            <div className="flex justify-center pt-4">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
