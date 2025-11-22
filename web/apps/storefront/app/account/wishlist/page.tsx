'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingCart, Trash2, X } from 'lucide-react';
import {
  Card,
  CardContent,
  Button,
  Badge,
} from '@ecomify/ui';
import { formatCurrency } from '@ecomify/utils';
import { useCart } from '../../../stores/cart-store';

/**
 * Wishlist Page
 * Saved products for later
 */

// Mock wishlist items
const initialWishlist = [
  {
    id: '1',
    productId: 'prod-1',
    variantId: 'var-1',
    title: 'Classic White T-Shirt',
    variantTitle: 'Medium / White',
    price: 29.99,
    compareAtPrice: 39.99,
    image: '/placeholder-product.jpg',
    inStock: true,
    handle: 'classic-white-tshirt',
  },
  {
    id: '2',
    productId: 'prod-2',
    variantId: 'var-2',
    title: 'Premium Denim Jeans',
    variantTitle: '32 / Dark Blue',
    price: 89.99,
    image: '/placeholder-product.jpg',
    inStock: true,
    handle: 'premium-denim-jeans',
  },
  {
    id: '3',
    productId: 'prod-3',
    variantId: 'var-3',
    title: 'Leather Messenger Bag',
    variantTitle: 'Brown',
    price: 149.99,
    compareAtPrice: 199.99,
    image: '/placeholder-product.jpg',
    inStock: false,
    handle: 'leather-messenger-bag',
  },
  {
    id: '4',
    productId: 'prod-4',
    variantId: 'var-4',
    title: 'Running Sneakers',
    variantTitle: '10 / Black',
    price: 119.99,
    image: '/placeholder-product.jpg',
    inStock: true,
    handle: 'running-sneakers',
  },
];

interface WishlistItem {
  id: string;
  productId: string;
  variantId: string;
  title: string;
  variantTitle: string;
  price: number;
  compareAtPrice?: number;
  image: string;
  inStock: boolean;
  handle: string;
}

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>(initialWishlist);
  const { addItem } = useCart();

  const handleRemove = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const handleAddToCart = (item: WishlistItem) => {
    addItem({
      variantId: item.variantId,
      productId: item.productId,
      title: item.title,
      variantTitle: item.variantTitle,
      price: item.price,
      image: item.image,
    });
    // Optionally remove from wishlist after adding to cart
    // handleRemove(item.id);
  };

  const handleAddAllToCart = () => {
    const inStockItems = items.filter((item) => item.inStock);
    inStockItems.forEach((item) => {
      addItem({
        variantId: item.variantId,
        productId: item.productId,
        title: item.title,
        variantTitle: item.variantTitle,
        price: item.price,
        image: item.image,
      });
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">My Wishlist</h2>
          <p className="text-muted-foreground">
            {items.length} {items.length === 1 ? 'item' : 'items'} saved
          </p>
        </div>
        {items.length > 0 && (
          <Button onClick={handleAddAllToCart}>
            <ShoppingCart className="mr-2 h-4 w-4" />
            Add All to Cart
          </Button>
        )}
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Heart className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 font-semibold">Your wishlist is empty</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Save items you love by clicking the heart icon
            </p>
            <Button asChild className="mt-4">
              <Link href="/products">Start Shopping</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <WishlistCard
              key={item.id}
              item={item}
              onRemove={() => handleRemove(item.id)}
              onAddToCart={() => handleAddToCart(item)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface WishlistCardProps {
  item: WishlistItem;
  onRemove: () => void;
  onAddToCart: () => void;
}

function WishlistCard({ item, onRemove, onAddToCart }: WishlistCardProps) {
  const hasDiscount = item.compareAtPrice && item.compareAtPrice > item.price;
  const discountPercent = hasDiscount
    ? Math.round(((item.compareAtPrice! - item.price) / item.compareAtPrice!) * 100)
    : 0;

  return (
    <Card className="overflow-hidden">
      <div className="relative">
        <Link href={`/products/${item.handle}`}>
          <div className="relative aspect-square bg-muted">
            {item.image ? (
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <Heart className="h-12 w-12 text-muted-foreground" />
              </div>
            )}
          </div>
        </Link>

        {/* Remove Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 h-8 w-8 bg-background/80 hover:bg-background"
          onClick={onRemove}
        >
          <X className="h-4 w-4" />
        </Button>

        {/* Badges */}
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {hasDiscount && (
            <Badge variant="destructive">-{discountPercent}%</Badge>
          )}
          {!item.inStock && (
            <Badge variant="secondary">Out of Stock</Badge>
          )}
        </div>
      </div>

      <CardContent className="p-4">
        <Link href={`/products/${item.handle}`}>
          <h3 className="font-semibold hover:underline">{item.title}</h3>
        </Link>
        <p className="text-sm text-muted-foreground">{item.variantTitle}</p>

        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-lg font-bold">{formatCurrency(item.price)}</span>
          {hasDiscount && (
            <span className="text-sm text-muted-foreground line-through">
              {formatCurrency(item.compareAtPrice!)}
            </span>
          )}
        </div>

        <Button
          className="mt-4 w-full"
          onClick={onAddToCart}
          disabled={!item.inStock}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          {item.inStock ? 'Add to Cart' : 'Out of Stock'}
        </Button>
      </CardContent>
    </Card>
  );
}
