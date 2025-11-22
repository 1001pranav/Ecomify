'use client';

import Link from 'next/link';
import { Package, MapPin, Heart, CreditCard, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '@ecomify/ui';
import { formatCurrency } from '@ecomify/utils';
import { useAuth } from '../../stores/auth-store';

/**
 * Account Overview Page
 * Dashboard showing recent orders, quick links, and account summary
 */

// Mock data for demo
const recentOrders = [
  {
    id: 'ORD-001',
    date: '2024-11-20',
    status: 'delivered',
    total: 129.99,
    items: 3,
  },
  {
    id: 'ORD-002',
    date: '2024-11-15',
    status: 'shipped',
    total: 79.50,
    items: 2,
  },
  {
    id: 'ORD-003',
    date: '2024-11-10',
    status: 'processing',
    total: 249.00,
    items: 5,
  },
];

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default function AccountOverviewPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <QuickActionCard
          icon={Package}
          title="Orders"
          description="View order history"
          href="/account/orders"
          count={12}
        />
        <QuickActionCard
          icon={MapPin}
          title="Addresses"
          description="Manage addresses"
          href="/account/addresses"
          count={2}
        />
        <QuickActionCard
          icon={Heart}
          title="Wishlist"
          description="Saved items"
          href="/account/wishlist"
          count={5}
        />
        <QuickActionCard
          icon={CreditCard}
          title="Payment"
          description="Payment methods"
          href="/account/settings#payment"
        />
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Orders</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/account/orders">
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <Package className="mx-auto h-12 w-12 opacity-50" />
              <p className="mt-2">No orders yet</p>
              <Button asChild className="mt-4">
                <Link href="/products">Start Shopping</Link>
              </Button>
            </div>
          ) : (
            <div className="divide-y">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between py-4"
                >
                  <div>
                    <p className="font-medium">{order.id}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.date).toLocaleDateString()} • {order.items} items
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge
                      className={statusColors[order.status as keyof typeof statusColors]}
                    >
                      {order.status}
                    </Badge>
                    <p className="font-medium">{formatCurrency(order.total)}</p>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/account/orders/${order.id}`}>View</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Account Info */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Account Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p>{user?.firstName} {user?.lastName || 'Not set'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p>{user?.email}</p>
            </div>
            <Button variant="outline" size="sm" asChild className="mt-4">
              <Link href="/account/settings">Edit Profile</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Default Address</CardTitle>
          </CardHeader>
          <CardContent>
            <p>John Doe</p>
            <p className="text-sm text-muted-foreground">
              123 Main Street<br />
              Apt 4B<br />
              New York, NY 10001<br />
              United States
            </p>
            <Button variant="outline" size="sm" asChild className="mt-4">
              <Link href="/account/addresses">Manage Addresses</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface QuickActionCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  href: string;
  count?: number;
}

function QuickActionCard({
  icon: Icon,
  title,
  description,
  href,
  count,
}: QuickActionCardProps) {
  return (
    <Link href={href}>
      <Card className="transition-colors hover:bg-muted/50">
        <CardContent className="flex items-center gap-4 p-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="font-medium">{title}</p>
              {count !== undefined && (
                <Badge variant="secondary" className="text-xs">
                  {count}
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
