'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { Input, Button, Skeleton } from '@ecomify/ui';
import { StorefrontLayout } from '../../components/layout';
import {
  ProductGrid,
  ProductGridSkeleton,
  ProductFilters,
  ProductsHeader,
} from '../../components/products';
import { useProducts } from '../../hooks/use-products';
import type { ProductFilters as ProductFiltersType } from '@ecomify/types';

/**
 * Search Page - Product Search Results
 * Displays search results with filters
 */

// Mock data
const mockCategories = [
  { id: '1', name: 'Electronics', slug: 'electronics', productsCount: 45, createdAt: '', updatedAt: '' },
  { id: '2', name: 'Clothing', slug: 'clothing', productsCount: 120, createdAt: '', updatedAt: '' },
  { id: '3', name: 'Home & Garden', slug: 'home-garden', productsCount: 67, createdAt: '', updatedAt: '' },
];

const mockTags = ['New', 'Sale', 'Featured', 'Best Seller'];

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';

  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [searchInput, setSearchInput] = useState(query);

  // Parse filters from URL
  const filters: ProductFiltersType = {
    search: query,
    categoryId: searchParams.get('category') || undefined,
    tags: searchParams.get('tags')?.split(',') || undefined,
    minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
    maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
    sort: searchParams.get('sort') || 'relevance',
    limit: 24,
  };

  const { data, isLoading } = useProducts(filters);
  const products = data?.data || [];
  const totalProducts = data?.total || 0;

  const updateFilters = (newFilters: Partial<ProductFiltersType>) => {
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
    router.push(`/search?${params.toString()}`, { scroll: false });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchInput.trim())}`);
    }
  };

  const clearSearch = () => {
    setSearchInput('');
    router.push('/products');
  };

  return (
    <StorefrontLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            {query ? `Search results for "${query}"` : 'Search Products'}
          </h1>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="mt-4 flex gap-2">
            <div className="relative flex-1 max-w-xl">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search for products..."
                className="pl-9 pr-9"
              />
              {searchInput && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
                  onClick={() => setSearchInput('')}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <Button type="submit">Search</Button>
          </form>
        </div>

        {query ? (
          <div className="flex gap-8">
            {/* Filters */}
            <ProductFilters
              filters={filters}
              onChange={updateFilters}
              categories={mockCategories}
              tags={mockTags}
              maxPrice={1000}
            />

            {/* Results */}
            <div className="flex-1">
              <ProductsHeader
                totalProducts={totalProducts}
                sort={filters.sort || 'relevance'}
                onSortChange={(sort) => updateFilters({ sort })}
                view={view}
                onViewChange={setView}
              />

              <div className="mt-6">
                {isLoading ? (
                  <ProductGridSkeleton count={12} view={view} />
                ) : products.length === 0 ? (
                  <NoResults query={query} onClear={clearSearch} />
                ) : (
                  <ProductGrid products={products} view={view} />
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="py-16 text-center">
            <Search className="mx-auto h-16 w-16 text-muted-foreground" />
            <h2 className="mt-4 text-xl font-semibold">Start your search</h2>
            <p className="mt-2 text-muted-foreground">
              Enter a search term to find products
            </p>
          </div>
        )}
      </div>
    </StorefrontLayout>
  );
}

function NoResults({ query, onClear }: { query: string; onClear: () => void }) {
  return (
    <div className="py-16 text-center">
      <Search className="mx-auto h-16 w-16 text-muted-foreground" />
      <h2 className="mt-4 text-xl font-semibold">No results found</h2>
      <p className="mt-2 text-muted-foreground">
        We couldn't find any products matching "{query}"
      </p>
      <div className="mt-6 space-y-2">
        <p className="text-sm text-muted-foreground">Try:</p>
        <ul className="text-sm text-muted-foreground">
          <li>• Checking your spelling</li>
          <li>• Using more general terms</li>
          <li>• Removing filters</li>
        </ul>
      </div>
      <Button onClick={onClear} className="mt-6">
        Browse All Products
      </Button>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <StorefrontLayout>
          <div className="container mx-auto px-4 py-8">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="mt-4 h-10 w-full max-w-xl" />
            <div className="mt-8">
              <ProductGridSkeleton count={12} />
            </div>
          </div>
        </StorefrontLayout>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
