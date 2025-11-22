'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Truck, ShieldCheck, RotateCcw, CreditCard } from 'lucide-react';
import { Button, Card, CardContent, Badge, Skeleton } from '@ecomify/ui';
import { formatCurrency } from '@ecomify/utils';
import { StorefrontLayout } from '../components/layout';
import { ProductGrid, ProductGridSkeleton } from '../components/products';
import { useProducts } from '../hooks/use-products';

/**
 * Home Page - Storefront Landing Page
 * Hero section, featured products, categories, and promotional content
 */

export default function HomePage() {
  // Fetch featured products
  const { data: featuredData, isLoading: featuredLoading } = useProducts({
    sort: 'best-selling',
    limit: 4,
  });

  // Fetch new arrivals
  const { data: newData, isLoading: newLoading } = useProducts({
    sort: 'newest',
    limit: 4,
  });

  return (
    <StorefrontLayout>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary/10 via-primary/5 to-background">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="grid gap-8 md:grid-cols-2 items-center">
            <div className="space-y-6">
              <Badge variant="secondary" className="mb-2">
                New Collection 2024
              </Badge>
              <h1 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
                Discover Your Perfect Style
              </h1>
              <p className="text-lg text-muted-foreground max-w-lg">
                Shop our curated collection of premium products. Quality meets affordability with free shipping on orders over $50.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" asChild>
                  <Link href="/products">
                    Shop Now <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/collections">View Collections</Link>
                </Button>
              </div>
            </div>
            <div className="relative aspect-square md:aspect-[4/3]">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent rounded-2xl" />
              <div className="relative h-full w-full rounded-2xl bg-muted flex items-center justify-center">
                <span className="text-4xl">🛍️</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Bar */}
      <section className="border-y bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x">
            {[
              { icon: Truck, title: 'Free Shipping', desc: 'On orders $50+' },
              { icon: ShieldCheck, title: 'Secure Payment', desc: '256-bit encryption' },
              { icon: RotateCcw, title: 'Easy Returns', desc: '30-day policy' },
              { icon: CreditCard, title: 'Flexible Payment', desc: 'Multiple options' },
            ].map((feature) => (
              <div key={feature.title} className="flex items-center gap-3 py-4 px-4">
                <feature.icon className="h-8 w-8 text-primary flex-shrink-0" />
                <div>
                  <p className="font-semibold text-sm">{feature.title}</p>
                  <p className="text-xs text-muted-foreground">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold">Featured Products</h2>
            <p className="text-muted-foreground">Our most popular items</p>
          </div>
          <Button variant="ghost" asChild>
            <Link href="/products?sort=best-selling">
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        {featuredLoading ? (
          <ProductGridSkeleton count={4} />
        ) : (
          <ProductGrid products={featuredData?.data || []} columns={4} />
        )}
      </section>

      {/* Categories Grid */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold">Shop by Category</h2>
            <p className="text-muted-foreground">Browse our collections</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'Electronics', slug: 'electronics', emoji: '📱' },
              { name: 'Clothing', slug: 'clothing', emoji: '👕' },
              { name: 'Home & Garden', slug: 'home-garden', emoji: '🏡' },
              { name: 'Sports', slug: 'sports', emoji: '⚽' },
            ].map((category) => (
              <Link
                key={category.slug}
                href={`/products?category=${category.slug}`}
                className="group"
              >
                <Card className="overflow-hidden transition-all hover:shadow-lg">
                  <CardContent className="p-6 text-center">
                    <div className="mb-3 text-4xl">{category.emoji}</div>
                    <h3 className="font-semibold group-hover:text-primary transition-colors">
                      {category.name}
                    </h3>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold">New Arrivals</h2>
            <p className="text-muted-foreground">Just dropped this week</p>
          </div>
          <Button variant="ghost" asChild>
            <Link href="/products?sort=newest">
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        {newLoading ? (
          <ProductGridSkeleton count={4} />
        ) : (
          <ProductGrid products={newData?.data || []} columns={4} />
        )}
      </section>

      {/* Promotional Banner */}
      <section className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-bold">Get 20% Off Your First Order</h2>
              <p className="text-primary-foreground/80">
                Sign up for our newsletter and receive exclusive deals
              </p>
            </div>
            <Button variant="secondary" size="lg" asChild>
              <Link href="/signup">Sign Up Now</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold">Why Shop With Us</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <span className="text-2xl">⭐</span>
            </div>
            <h3 className="font-semibold mb-2">Premium Quality</h3>
            <p className="text-sm text-muted-foreground">
              All products are carefully selected and quality tested
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <span className="text-2xl">🚀</span>
            </div>
            <h3 className="font-semibold mb-2">Fast Delivery</h3>
            <p className="text-sm text-muted-foreground">
              Quick and reliable shipping to your doorstep
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <span className="text-2xl">💬</span>
            </div>
            <h3 className="font-semibold mb-2">24/7 Support</h3>
            <p className="text-sm text-muted-foreground">
              Our team is here to help you anytime
            </p>
          </div>
        </div>
      </section>
    </StorefrontLayout>
  );
}
