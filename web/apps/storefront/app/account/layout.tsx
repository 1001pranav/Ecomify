'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  User,
  Package,
  MapPin,
  Heart,
  Settings,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { Button, Card, CardContent, Separator } from '@ecomify/ui';
import { cn } from '@ecomify/utils';
import { StorefrontLayout } from '../../components/layout';
import { useAuth } from '../../stores/auth-store';

/**
 * Account Layout
 * Wrapper layout for all account pages with sidebar navigation
 */

const accountNavItems = [
  { href: '/account', label: 'Account Overview', icon: User },
  { href: '/account/orders', label: 'Order History', icon: Package },
  { href: '/account/addresses', label: 'Address Book', icon: MapPin },
  { href: '/account/wishlist', label: 'Wishlist', icon: Heart },
  { href: '/account/settings', label: 'Account Settings', icon: Settings },
];

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, logout, isAuthenticated } = useAuth();

  // Show loading or redirect if not authenticated
  if (!isAuthenticated) {
    return (
      <StorefrontLayout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold">Please sign in</h1>
          <p className="mt-2 text-muted-foreground">
            You need to be signed in to access your account
          </p>
          <Button asChild className="mt-6">
            <Link href="/login">Sign In</Link>
          </Button>
        </div>
      </StorefrontLayout>
    );
  }

  return (
    <StorefrontLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">My Account</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.firstName || user?.email}
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-4">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-4">
                <nav className="space-y-1">
                  {accountNavItems.map((item) => {
                    const isActive =
                      pathname === item.href ||
                      (item.href !== '/account' && pathname.startsWith(item.href));

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                          isActive
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    );
                  })}

                  <Separator className="my-2" />

                  <button
                    onClick={() => logout()}
                    className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">{children}</div>
        </div>
      </div>
    </StorefrontLayout>
  );
}
