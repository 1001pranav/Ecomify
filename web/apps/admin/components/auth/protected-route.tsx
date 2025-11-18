'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../stores/auth-store';

/**
 * withAuth - Higher-Order Component (HOC) Pattern
 * Protects routes by requiring authentication
 * Redirects to login if user is not authenticated
 */
export function withAuth<P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> {
  return function ProtectedRoute(props: P) {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        router.push('/login');
      }
    }, [isAuthenticated, isLoading, router]);

    // Show loading state while checking auth
    if (isLoading) {
      return (
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
            <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
          </div>
        </div>
      );
    }

    // Don't render protected content if not authenticated
    if (!isAuthenticated) {
      return null;
    }

    // Render protected component
    return <Component {...props} />;
  };
}

/**
 * withGuest - HOC for guest-only routes (login, register)
 * Redirects to dashboard if user is already authenticated
 */
export function withGuest<P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> {
  return function GuestRoute(props: P) {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading && isAuthenticated) {
        router.push('/dashboard');
      }
    }, [isAuthenticated, isLoading, router]);

    // Show loading state
    if (isLoading) {
      return (
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
            <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
          </div>
        </div>
      );
    }

    // Don't render if authenticated
    if (isAuthenticated) {
      return null;
    }

    // Render guest component
    return <Component {...props} />;
  };
}
