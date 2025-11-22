'use client';

import { ProductCard, ProductCardSkeleton } from './product-card';
import type { Product } from '@ecomify/types';

/**
 * Product Grid Component
 * Displays products in a responsive grid
 */

interface ProductGridProps {
  products: Product[];
  view?: 'grid' | 'list';
  columns?: 2 | 3 | 4;
}

export function ProductGrid({ products, view = 'grid', columns = 4 }: ProductGridProps) {
  if (view === 'list') {
    return (
      <div className="space-y-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} view="list" />
        ))}
      </div>
    );
  }

  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  };

  return (
    <div className={`grid gap-4 ${gridCols[columns]}`}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} view="grid" />
      ))}
    </div>
  );
}

/**
 * Product Grid Skeleton
 */
interface ProductGridSkeletonProps {
  count?: number;
  view?: 'grid' | 'list';
  columns?: 2 | 3 | 4;
}

export function ProductGridSkeleton({
  count = 8,
  view = 'grid',
  columns = 4,
}: ProductGridSkeletonProps) {
  if (view === 'list') {
    return (
      <div className="space-y-4">
        {Array.from({ length: count }).map((_, i) => (
          <ProductCardSkeleton key={i} view="list" />
        ))}
      </div>
    );
  }

  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  };

  return (
    <div className={`grid gap-4 ${gridCols[columns]}`}>
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} view="grid" />
      ))}
    </div>
  );
}
