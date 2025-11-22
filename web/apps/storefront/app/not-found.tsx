import Link from 'next/link';
import { Home, Search, ArrowLeft, ShoppingBag } from 'lucide-react';
import { Button, Card, CardContent } from '@ecomify/ui';
import { StorefrontLayout } from '../components/layout';

/**
 * 404 Not Found Page
 * Custom 404 error page with helpful navigation
 */

export default function NotFound() {
  return (
    <StorefrontLayout>
      <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4 py-16">
        <Card className="w-full max-w-lg text-center">
          <CardContent className="pt-8 pb-8">
            {/* 404 Illustration */}
            <div className="relative mx-auto mb-8 h-40 w-40">
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-8xl font-bold text-muted-foreground/20">
                  404
                </span>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <ShoppingBag className="h-20 w-20 text-muted-foreground" />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold tracking-tight">
              Page Not Found
            </h1>

            {/* Description */}
            <p className="mt-2 text-muted-foreground">
              Oops! The page you're looking for doesn't exist or has been moved.
              Don't worry, let's get you back on track.
            </p>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button asChild>
                <Link href="/">
                  <Home className="mr-2 h-4 w-4" />
                  Go Home
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/products">
                  <Search className="mr-2 h-4 w-4" />
                  Browse Products
                </Link>
              </Button>
            </div>

            {/* Back Link */}
            <div className="mt-6">
              <button
                onClick={() => window.history.back()}
                className="inline-flex items-center text-sm text-muted-foreground hover:text-primary"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go back to previous page
              </button>
            </div>

            {/* Popular Categories */}
            <div className="mt-8 border-t pt-6">
              <p className="text-sm font-medium text-muted-foreground">
                Popular Categories
              </p>
              <div className="mt-3 flex flex-wrap justify-center gap-2">
                {['Electronics', 'Clothing', 'Home', 'Sports', 'Beauty'].map(
                  (category) => (
                    <Link
                      key={category}
                      href={`/products?category=${category.toLowerCase()}`}
                      className="rounded-full bg-muted px-3 py-1 text-sm hover:bg-muted/80"
                    >
                      {category}
                    </Link>
                  )
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </StorefrontLayout>
  );
}
