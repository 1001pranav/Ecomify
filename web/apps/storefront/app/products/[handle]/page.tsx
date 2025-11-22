'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  Heart,
  ShoppingCart,
  Share2,
  Minus,
  Plus,
  Check,
  ChevronLeft,
  ChevronRight,
  Truck,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import {
  Button,
  Badge,
  Separator,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Skeleton,
  Card,
  CardContent,
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@ecomify/ui';
import { formatCurrency, cn } from '@ecomify/utils';
import { StorefrontLayout } from '../../../components/layout';
import { ProductGrid, ProductGridSkeleton } from '../../../components/products';
import { useProduct, useRelatedProducts } from '../../../hooks/use-products';
import { useCart } from '../../../stores/cart-store';
import type { ProductVariant, Product } from '@ecomify/types';

/**
 * Product Detail Page - Compound Component Pattern
 * Displays complete product information with variant selection
 */

export default function ProductDetailPage() {
  const params = useParams();
  const handle = params.handle as string;

  const { data: product, isLoading, error } = useProduct(handle);
  const { data: relatedProducts, isLoading: relatedLoading } = useRelatedProducts(
    product?.id || '',
    { enabled: !!product?.id }
  );

  if (isLoading) {
    return (
      <StorefrontLayout>
        <ProductDetailSkeleton />
      </StorefrontLayout>
    );
  }

  if (error || !product) {
    return (
      <StorefrontLayout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold">Product Not Found</h1>
          <p className="mt-2 text-muted-foreground">
            The product you're looking for doesn't exist or has been removed.
          </p>
          <Button asChild className="mt-6">
            <Link href="/products">Continue Shopping</Link>
          </Button>
        </div>
      </StorefrontLayout>
    );
  }

  return (
    <StorefrontLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm">
          <ol className="flex items-center gap-2">
            <li>
              <Link href="/" className="text-muted-foreground hover:text-foreground">
                Home
              </Link>
            </li>
            <li className="text-muted-foreground">/</li>
            <li>
              <Link href="/products" className="text-muted-foreground hover:text-foreground">
                Products
              </Link>
            </li>
            <li className="text-muted-foreground">/</li>
            <li className="font-medium">{product.title}</li>
          </ol>
        </nav>

        {/* Product Content */}
        <ProductContent product={product} />

        {/* Product Details Tabs */}
        <ProductTabs product={product} />

        {/* Related Products */}
        <section className="mt-16">
          <h2 className="mb-6 text-2xl font-bold">You May Also Like</h2>
          {relatedLoading ? (
            <ProductGridSkeleton count={4} columns={4} />
          ) : relatedProducts && relatedProducts.length > 0 ? (
            <ProductGrid products={relatedProducts} columns={4} />
          ) : (
            <p className="text-muted-foreground">No related products found.</p>
          )}
        </section>
      </div>
    </StorefrontLayout>
  );
}

/**
 * Main Product Content
 */
function ProductContent({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    product.variants[0] || null
  );
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  // Get unique options for variant selection
  const options = useMemo(() => {
    const optionMap = new Map<string, Set<string>>();
    product.variants.forEach((variant) => {
      Object.entries(variant.options || {}).forEach(([key, value]) => {
        if (!optionMap.has(key)) {
          optionMap.set(key, new Set());
        }
        optionMap.get(key)!.add(value);
      });
    });
    return Array.from(optionMap.entries()).map(([name, values]) => ({
      name,
      values: Array.from(values),
    }));
  }, [product.variants]);

  // Selected options state
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
    return selectedVariant?.options || {};
  });

  // Find variant based on selected options
  useEffect(() => {
    const variant = product.variants.find((v) =>
      Object.entries(selectedOptions).every(
        ([key, value]) => v.options?.[key] === value
      )
    );
    if (variant) {
      setSelectedVariant(variant);
    }
  }, [selectedOptions, product.variants]);

  const handleOptionChange = (optionName: string, value: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [optionName]: value,
    }));
  };

  const handleAddToCart = () => {
    if (selectedVariant) {
      for (let i = 0; i < quantity; i++) {
        addItem({
          variantId: selectedVariant.id,
          productId: product.id,
          title: product.title,
          variantTitle: selectedVariant.title,
          price: selectedVariant.price,
          image: product.images[0]?.url || '',
        });
      }
    }
  };

  const hasDiscount =
    selectedVariant?.compareAtPrice &&
    selectedVariant.compareAtPrice > selectedVariant.price;
  const discountPercent = hasDiscount
    ? Math.round(
        ((selectedVariant!.compareAtPrice! - selectedVariant!.price) /
          selectedVariant!.compareAtPrice!) *
          100
      )
    : 0;

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* Image Gallery */}
      <ImageGallery
        images={product.images}
        selectedIndex={selectedImage}
        onSelect={setSelectedImage}
      />

      {/* Product Info */}
      <div className="space-y-6">
        {/* Title and Vendor */}
        <div>
          {product.vendor && (
            <p className="text-sm text-muted-foreground">{product.vendor}</p>
          )}
          <h1 className="text-3xl font-bold">{product.title}</h1>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-bold">
            {formatCurrency(selectedVariant?.price || 0)}
          </span>
          {hasDiscount && (
            <>
              <span className="text-xl text-muted-foreground line-through">
                {formatCurrency(selectedVariant?.compareAtPrice || 0)}
              </span>
              <Badge variant="destructive">-{discountPercent}%</Badge>
            </>
          )}
        </div>

        {/* Stock Status */}
        <div className="flex items-center gap-2">
          {selectedVariant && selectedVariant.inventoryQty > 0 ? (
            <>
              <Check className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-600">
                In Stock ({selectedVariant.inventoryQty} available)
              </span>
            </>
          ) : (
            <span className="text-sm text-red-600">Out of Stock</span>
          )}
        </div>

        <Separator />

        {/* Variant Options */}
        {options.length > 0 && (
          <div className="space-y-4">
            {options.map((option) => (
              <VariantOption
                key={option.name}
                name={option.name}
                values={option.values}
                selected={selectedOptions[option.name] || ''}
                onChange={(value) => handleOptionChange(option.name, value)}
              />
            ))}
          </div>
        )}

        {/* Quantity */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Quantity</label>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-12 text-center">{quantity}</span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setQuantity((q) => q + 1)}
              disabled={selectedVariant && quantity >= selectedVariant.inventoryQty}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <Button
            size="lg"
            className="flex-1"
            onClick={handleAddToCart}
            disabled={!selectedVariant || selectedVariant.inventoryQty === 0}
          >
            <ShoppingCart className="mr-2 h-5 w-5" />
            Add to Cart
          </Button>
          <Button variant="outline" size="lg">
            <Heart className="h-5 w-5" />
          </Button>
          <Button variant="outline" size="lg">
            <Share2 className="h-5 w-5" />
          </Button>
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-4 rounded-lg border p-4">
          <div className="flex flex-col items-center text-center">
            <Truck className="mb-2 h-6 w-6 text-muted-foreground" />
            <span className="text-xs font-medium">Free Shipping</span>
            <span className="text-xs text-muted-foreground">Orders $50+</span>
          </div>
          <div className="flex flex-col items-center text-center">
            <ShieldCheck className="mb-2 h-6 w-6 text-muted-foreground" />
            <span className="text-xs font-medium">Secure Payment</span>
            <span className="text-xs text-muted-foreground">256-bit SSL</span>
          </div>
          <div className="flex flex-col items-center text-center">
            <RotateCcw className="mb-2 h-6 w-6 text-muted-foreground" />
            <span className="text-xs font-medium">Easy Returns</span>
            <span className="text-xs text-muted-foreground">30 Days</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Image Gallery Component
 */
interface ImageGalleryProps {
  images: Product['images'];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

function ImageGallery({ images, selectedIndex, onSelect }: ImageGalleryProps) {
  if (images.length === 0) {
    return (
      <div className="aspect-square rounded-lg border bg-muted flex items-center justify-center">
        <ShoppingCart className="h-24 w-24 text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative aspect-square overflow-hidden rounded-lg border">
        <Image
          src={images[selectedIndex].url}
          alt={images[selectedIndex].altText || 'Product image'}
          fill
          className="object-cover"
          priority
        />

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <Button
              variant="secondary"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2"
              onClick={() =>
                onSelect((selectedIndex - 1 + images.length) % images.length)
              }
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2"
              onClick={() => onSelect((selectedIndex + 1) % images.length)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {images.map((image, index) => (
            <button
              key={index}
              className={cn(
                'relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border-2',
                selectedIndex === index
                  ? 'border-primary'
                  : 'border-transparent'
              )}
              onClick={() => onSelect(index)}
            >
              <Image
                src={image.url}
                alt={image.altText || `Product image ${index + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Variant Option Selector
 */
interface VariantOptionProps {
  name: string;
  values: string[];
  selected: string;
  onChange: (value: string) => void;
}

function VariantOption({ name, values, selected, onChange }: VariantOptionProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">
        {name}: <span className="font-normal text-muted-foreground">{selected}</span>
      </label>
      <div className="flex flex-wrap gap-2">
        {values.map((value) => (
          <Button
            key={value}
            variant={selected === value ? 'default' : 'outline'}
            size="sm"
            onClick={() => onChange(value)}
          >
            {value}
          </Button>
        ))}
      </div>
    </div>
  );
}

/**
 * Product Details Tabs
 */
function ProductTabs({ product }: { product: Product }) {
  return (
    <Tabs defaultValue="description" className="mt-12">
      <TabsList className="w-full justify-start">
        <TabsTrigger value="description">Description</TabsTrigger>
        <TabsTrigger value="specifications">Specifications</TabsTrigger>
        <TabsTrigger value="reviews">Reviews</TabsTrigger>
        <TabsTrigger value="shipping">Shipping & Returns</TabsTrigger>
      </TabsList>

      <TabsContent value="description" className="mt-6">
        <div className="prose max-w-none">
          {product.description ? (
            <div dangerouslySetInnerHTML={{ __html: product.description }} />
          ) : (
            <p className="text-muted-foreground">No description available.</p>
          )}
        </div>
      </TabsContent>

      <TabsContent value="specifications" className="mt-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold">Product Details</h3>
              <dl className="mt-4 space-y-2 text-sm">
                {product.productType && (
                  <>
                    <dt className="text-muted-foreground">Type</dt>
                    <dd>{product.productType}</dd>
                  </>
                )}
                {product.vendor && (
                  <>
                    <dt className="text-muted-foreground">Vendor</dt>
                    <dd>{product.vendor}</dd>
                  </>
                )}
                {product.tags.length > 0 && (
                  <>
                    <dt className="text-muted-foreground">Tags</dt>
                    <dd className="flex flex-wrap gap-1">
                      {product.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </dd>
                  </>
                )}
              </dl>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="reviews" className="mt-6">
        <p className="text-muted-foreground">Reviews coming soon...</p>
      </TabsContent>

      <TabsContent value="shipping" className="mt-6">
        <Accordion type="single" collapsible>
          <AccordionItem value="shipping">
            <AccordionTrigger>Shipping Information</AccordionTrigger>
            <AccordionContent>
              <ul className="list-disc pl-4 space-y-2 text-sm">
                <li>Free standard shipping on orders over $50</li>
                <li>Express shipping available at checkout</li>
                <li>Estimated delivery: 3-7 business days</li>
              </ul>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="returns">
            <AccordionTrigger>Return Policy</AccordionTrigger>
            <AccordionContent>
              <ul className="list-disc pl-4 space-y-2 text-sm">
                <li>30-day return policy</li>
                <li>Items must be unused and in original packaging</li>
                <li>Free returns for defective items</li>
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </TabsContent>
    </Tabs>
  );
}

/**
 * Product Detail Skeleton
 */
function ProductDetailSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Skeleton className="mb-6 h-4 w-48" />
      <div className="grid gap-8 lg:grid-cols-2">
        <Skeleton className="aspect-square w-full" />
        <div className="space-y-6">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-px w-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <div className="flex gap-2">
              <Skeleton className="h-9 w-16" />
              <Skeleton className="h-9 w-16" />
              <Skeleton className="h-9 w-16" />
            </div>
          </div>
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </div>
  );
}
