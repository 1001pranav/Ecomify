'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, ShoppingCart } from 'lucide-react';
import { Card, CardContent, Badge } from '@ecomify/ui';
import { formatCurrency } from '@ecomify/utils';
import { useLocalStorage } from '@ecomify/hooks';
import type { Product } from '@ecomify/types';

/**
 * Recently Viewed Products Hook
 * Tracks and stores recently viewed products
 */

const MAX_RECENT_PRODUCTS = 10;

interface RecentProduct {
  id: string;
  handle: string;
  title: string;
  price: number;
  compareAtPrice?: number;
  image?: string;
  viewedAt: number;
}

export function useRecentlyViewed() {
  const [recentProducts, setRecentProducts] = useLocalStorage<RecentProduct[]>(
    'recently-viewed',
    []
  );

  const addProduct = (product: Product) => {
    setRecentProducts((prev) => {
      // Remove if already exists
      const filtered = prev.filter((p) => p.id !== product.id);

      // Add to front
      const newProduct: RecentProduct = {
        id: product.id,
        handle: product.handle,
        title: product.title,
        price: product.variants[0]?.price || 0,
        compareAtPrice: product.variants[0]?.compareAtPrice,
        image: product.images[0]?.url,
        viewedAt: Date.now(),
      };

      // Keep only MAX items
      return [newProduct, ...filtered].slice(0, MAX_RECENT_PRODUCTS);
    });
  };

  const clearRecent = () => {
    setRecentProducts([]);
  };

  return {
    recentProducts,
    addProduct,
    clearRecent,
  };
}

/**
 * Recently Viewed Products Component
 * Displays recently viewed products
 */

interface RecentlyViewedProps {
  currentProductId?: string;
  maxItems?: number;
}

export function RecentlyViewed({
  currentProductId,
  maxItems = 4,
}: RecentlyViewedProps) {
  const { recentProducts } = useRecentlyViewed();

  // Filter out current product and limit
  const products = recentProducts
    .filter((p) => p.id !== currentProductId)
    .slice(0, maxItems);

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-8">
      <div className="mb-6 flex items-center gap-2">
        <Clock className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-xl font-bold">Recently Viewed</h2>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {products.map((product) => (
          <RecentProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

/**
 * Recent Product Card
 */
function RecentProductCard({ product }: { product: RecentProduct }) {
  const hasDiscount =
    product.compareAtPrice && product.compareAtPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(
        ((product.compareAtPrice! - product.price) / product.compareAtPrice!) *
          100
      )
    : 0;

  return (
    <Link href={`/products/${product.handle}`}>
      <Card className="group overflow-hidden transition-shadow hover:shadow-md">
        <div className="relative aspect-square overflow-hidden bg-muted">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <ShoppingCart className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
          {hasDiscount && (
            <Badge variant="destructive" className="absolute left-2 top-2">
              -{discountPercent}%
            </Badge>
          )}
        </div>
        <CardContent className="p-3">
          <h3 className="line-clamp-1 text-sm font-medium group-hover:text-primary">
            {product.title}
          </h3>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-semibold">{formatCurrency(product.price)}</span>
            {hasDiscount && (
              <span className="text-xs text-muted-foreground line-through">
                {formatCurrency(product.compareAtPrice!)}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

/**
 * Hook to track product view
 */
export function useTrackProductView(product: Product | undefined) {
  const { addProduct } = useRecentlyViewed();

  useEffect(() => {
    if (product) {
      addProduct(product);
    }
  }, [product?.id]);
}
