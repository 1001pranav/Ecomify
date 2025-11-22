'use client';

import { useState, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Button, Skeleton } from '@ecomify/ui';
import { apiClient } from '@ecomify/api-client';
import { StorefrontLayout } from '../../components/layout';
import {
  ProductGrid,
  ProductGridSkeleton,
  ProductFilters,
  ActiveFilters,
  ProductsHeader,
} from '../../components/products';
import { useInfiniteProducts } from '../../hooks/use-products';
import type { ProductFilters as ProductFiltersType } from '@ecomify/types';

/**
 * Products Page - Container/Presentational Pattern
 * Main product listing page with filters and sorting
 */

const defaultTags = ['New', 'Sale', 'Featured', 'Best Seller', 'Limited Edition'];

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // State
  const [view, setView] = useState<'grid' | 'list'>('grid');

  // Fetch categories from API
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await apiClient.categories.list();
      return response.data || [];
    },
  });
  const categories = categoriesData || [];

  // Parse filters from URL
  const filters: ProductFiltersType = {
    search: searchParams.get('search') || undefined,
    categoryId: searchParams.get('category') || undefined,
    tags: searchParams.get('tags')?.split(',') || undefined,
    minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
    maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
    sort: searchParams.get('sort') || 'newest',
    status: searchParams.get('status') as ProductFiltersType['status'] || undefined,
    limit: 12,
  };

  // Update URL with filters
  const updateFilters = useCallback(
    (newFilters: Partial<ProductFiltersType>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(newFilters).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
          params.delete(key);
        } else if (Array.isArray(value)) {
          params.set(key, value.join(','));
        } else {
          params.set(key, String(value));
        }
      });

      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, router, pathname]
  );

  // Fetch products with infinite scroll
  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteProducts(filters);

  // Flatten products from all pages
  const products = data?.pages.flatMap((page) => page.data) || [];
  const totalProducts = data?.pages[0]?.total || 0;

  return (
    <StorefrontLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="mt-2 text-muted-foreground">
            Browse our collection of products
          </p>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <ProductFilters
            filters={filters}
            onChange={updateFilters}
            categories={categories}
            tags={defaultTags}
            maxPrice={1000}
          />

          {/* Main Content */}
          <div className="flex-1">
            {/* Active Filters */}
            <ActiveFilters
              filters={filters}
              onChange={updateFilters}
              categories={categories}
            />

            {/* Products Header */}
            <div className="mb-6">
              <ProductsHeader
                totalProducts={totalProducts}
                sort={filters.sort || 'newest'}
                onSortChange={(sort) => updateFilters({ sort })}
                view={view}
                onViewChange={setView}
              />
            </div>

            {/* Products Grid */}
            {isLoading ? (
              <ProductGridSkeleton count={12} view={view} />
            ) : products.length === 0 ? (
              <EmptyState />
            ) : (
              <>
                <ProductGrid products={products} view={view} />

                {/* Load More */}
                {hasNextPage && (
                  <div className="mt-8 text-center">
                    <Button
                      variant="outline"
                      onClick={() => fetchNextPage()}
                      disabled={isFetchingNextPage}
                    >
                      {isFetchingNextPage ? 'Loading...' : 'Load More Products'}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </StorefrontLayout>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="rounded-full bg-muted p-4">
        <svg
          className="h-12 w-12 text-muted-foreground"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
      </div>
      <h3 className="mt-4 text-lg font-semibold">No products found</h3>
      <p className="mt-1 text-muted-foreground">
        Try adjusting your filters or search terms
      </p>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <StorefrontLayout>
          <div className="container mx-auto px-4 py-8">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="mt-4 h-6 w-64" />
            <div className="mt-8 flex gap-8">
              <Skeleton className="hidden h-[600px] w-64 lg:block" />
              <div className="flex-1">
                <ProductGridSkeleton count={12} />
              </div>
            </div>
          </div>
        </StorefrontLayout>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
