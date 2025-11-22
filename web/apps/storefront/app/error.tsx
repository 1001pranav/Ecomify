'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Home, RefreshCw, AlertTriangle, Mail } from 'lucide-react';
import { Button, Card, CardContent } from '@ecomify/ui';

/**
 * Error Page
 * Global error boundary for handling runtime errors
 */

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log error to error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg text-center">
        <CardContent className="pt-8 pb-8">
          {/* Error Icon */}
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-10 w-10 text-destructive" />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold tracking-tight">
            Something went wrong
          </h1>

          {/* Description */}
          <p className="mt-2 text-muted-foreground">
            We're sorry, but something unexpected happened. Our team has been
            notified and we're working to fix it.
          </p>

          {/* Error Details (for development) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 rounded-md bg-muted p-4 text-left">
              <p className="text-sm font-medium">Error Details:</p>
              <pre className="mt-2 overflow-auto text-xs text-muted-foreground">
                {error.message}
              </pre>
              {error.digest && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Error ID: {error.digest}
                </p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button onClick={reset}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
            <Button asChild variant="outline">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Go Home
              </Link>
            </Button>
          </div>

          {/* Support Link */}
          <div className="mt-6 border-t pt-6">
            <p className="text-sm text-muted-foreground">
              If this problem persists, please{' '}
              <Link
                href="/contact"
                className="inline-flex items-center text-primary hover:underline"
              >
                <Mail className="mr-1 h-3 w-3" />
                contact support
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
