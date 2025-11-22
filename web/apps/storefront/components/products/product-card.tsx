'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingCart, Eye } from 'lucide-react';
import { Button, Card, CardContent, Badge, Skeleton } from '@ecomify/ui';
import { formatCurrency } from '@ecomify/utils';
import { useCart } from '../../stores/cart-store';
import { usePrefetchProduct } from '../../hooks/use-products';
import type { Product } from '@ecomify/types';

/**
 * Product Card Component - Container/Presentational Pattern
 * Display product in grid/list views
 */

interface ProductCardProps {
  product: Product;
  view?: 'grid' | 'list';
}

export function ProductCard({ product, view = 'grid' }: ProductCardProps) {
  const { addItem } = useCart();
  const prefetchProduct = usePrefetchProduct();

  const mainImage = product.images[0];
  const defaultVariant = product.variants[0];
  const hasDiscount =
    defaultVariant?.compareAtPrice &&
    defaultVariant.compareAtPrice > defaultVariant.price;
  const discountPercent = hasDiscount
    ? Math.round(
        ((defaultVariant.compareAtPrice! - defaultVariant.price) /
          defaultVariant.compareAtPrice!) *
          100
      )
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (defaultVariant) {
      addItem({
        variantId: defaultVariant.id,
        productId: product.id,
        title: product.title,
        variantTitle: defaultVariant.title,
        price: defaultVariant.price,
        image: mainImage?.url || '',
      });
    }
  };

  if (view === 'list') {
    return (
      <Card className="group overflow-hidden">
        <div className="flex">
          {/* Image */}
          <Link
            href={`/products/${product.handle}`}
            className="relative aspect-square w-48 flex-shrink-0 overflow-hidden"
            onMouseEnter={() => prefetchProduct(product.handle)}
          >
            {mainImage ? (
              <Image
                src={mainImage.url}
                alt={mainImage.altText || product.title}
                fill
                className="object-cover transition-transform group-hover:scale-105"
                sizes="192px"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-muted">
                <ShoppingCart className="h-12 w-12 text-muted-foreground" />
              </div>
            )}
            {hasDiscount && (
              <Badge className="absolute left-2 top-2" variant="destructive">
                -{discountPercent}%
              </Badge>
            )}
          </Link>

          {/* Content */}
          <CardContent className="flex flex-1 flex-col p-4">
            <div className="flex-1">
              <Link
                href={`/products/${product.handle}`}
                className="line-clamp-1 font-semibold hover:underline"
              >
                {product.title}
              </Link>
              {product.vendor && (
                <p className="text-sm text-muted-foreground">{product.vendor}</p>
              )}
              {product.description && (
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                  {product.description}
                </p>
              )}
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold">
                  {formatCurrency(defaultVariant?.price || 0)}
                </span>
                {hasDiscount && (
                  <span className="text-sm text-muted-foreground line-through">
                    {formatCurrency(defaultVariant?.compareAtPrice || 0)}
                  </span>
                )}
              </div>
              <Button size="sm" onClick={handleAddToCart}>
                Add to Cart
              </Button>
            </div>
          </CardContent>
        </div>
      </Card>
    );
  }

  // Grid view
  return (
    <Card className="group overflow-hidden">
      {/* Image */}
      <Link
        href={`/products/${product.handle}`}
        className="relative block aspect-square overflow-hidden"
        onMouseEnter={() => prefetchProduct(product.handle)}
      >
        {mainImage ? (
          <Image
            src={mainImage.url}
            alt={mainImage.altText || product.title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-muted">
            <ShoppingCart className="h-12 w-12 text-muted-foreground" />
          </div>
        )}

        {/* Badges */}
        {hasDiscount && (
          <Badge className="absolute left-2 top-2" variant="destructive">
            -{discountPercent}%
          </Badge>
        )}
        {defaultVariant?.inventoryQty === 0 && (
          <Badge className="absolute left-2 top-2" variant="secondary">
            Out of Stock
          </Badge>
        )}

        {/* Hover actions */}
        <div className="absolute inset-x-0 bottom-0 flex translate-y-full gap-2 bg-background/90 p-2 transition-transform group-hover:translate-y-0">
          <Button
            variant="secondary"
            size="sm"
            className="flex-1"
            onClick={handleAddToCart}
            disabled={defaultVariant?.inventoryQty === 0}
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            Add to Cart
          </Button>
          <Button variant="outline" size="icon" className="h-9 w-9">
            <Heart className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-9 w-9" asChild>
            <Link href={`/products/${product.handle}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </Link>

      {/* Content */}
      <CardContent className="p-4">
        <Link
          href={`/products/${product.handle}`}
          className="line-clamp-1 font-semibold hover:underline"
        >
          {product.title}
        </Link>
        {product.vendor && (
          <p className="text-sm text-muted-foreground">{product.vendor}</p>
        )}
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-lg font-bold">
            {formatCurrency(defaultVariant?.price || 0)}
          </span>
          {hasDiscount && (
            <span className="text-sm text-muted-foreground line-through">
              {formatCurrency(defaultVariant?.compareAtPrice || 0)}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Product Card Skeleton
 */
export function ProductCardSkeleton({ view = 'grid' }: { view?: 'grid' | 'list' }) {
  if (view === 'list') {
    return (
      <Card className="overflow-hidden">
        <div className="flex">
          <Skeleton className="aspect-square w-48 flex-shrink-0" />
          <CardContent className="flex flex-1 flex-col p-4">
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="mt-2 h-4 w-1/3" />
            <Skeleton className="mt-4 h-16" />
            <div className="mt-4 flex items-center justify-between">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-9 w-24" />
            </div>
          </CardContent>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <Skeleton className="aspect-square w-full" />
      <CardContent className="p-4">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="mt-2 h-4 w-1/2" />
        <Skeleton className="mt-2 h-6 w-1/4" />
      </CardContent>
    </Card>
  );
}
