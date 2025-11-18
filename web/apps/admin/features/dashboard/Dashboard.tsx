'use client';

import { DollarSign, ShoppingCart, Users, TrendingUp } from 'lucide-react';
import { useDashboardMetrics } from '@ecomify/api-client';
import { MetricCard } from './MetricCard';
import { SalesChart } from './SalesChart';
import { RecentOrders } from './RecentOrders';
import { TopProducts } from './TopProducts';

/**
 * Dashboard Component
 *
 * Main dashboard container that orchestrates all dashboard widgets and metrics.
 * Uses the useDashboardMetrics hook to fetch data and displays:
 * - Key metrics (revenue, orders, customers, AOV)
 * - Sales chart
 * - Recent orders
 * - Top products
 *
 * Following the Container/Presentational Pattern
 */

interface DashboardProps {
  storeId?: string;
}

export function Dashboard({ storeId = 'default' }: DashboardProps) {
  // TODO: Implement proper store selection/context
  // For now, using default storeId or from props
  const { data, isLoading, error } = useDashboardMetrics(storeId);

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to your Ecomify admin dashboard
          </p>
        </div>

        {/* Loading skeleton for metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-32 bg-muted animate-pulse rounded-lg"
            />
          ))}
        </div>

        {/* Loading skeleton for chart */}
        <div className="h-[400px] bg-muted animate-pulse rounded-lg" />

        {/* Loading skeleton for widgets */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="h-[400px] bg-muted animate-pulse rounded-lg" />
          <div className="h-[400px] bg-muted animate-pulse rounded-lg" />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to your Ecomify admin dashboard
          </p>
        </div>
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
          <p className="text-sm text-destructive">
            Failed to load dashboard data. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  // No data state
  if (!data) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to your Ecomify admin dashboard
          </p>
        </div>
        <div className="rounded-lg border bg-muted/50 p-8 text-center">
          <p className="text-sm text-muted-foreground">
            No dashboard data available
          </p>
        </div>
      </div>
    );
  }

  const metrics = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your Ecomify admin dashboard
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Revenue"
          value={metrics.revenue}
          change={metrics.revenueChange}
          icon={DollarSign}
          trend={metrics.revenueChange >= 0 ? 'up' : 'down'}
          type="currency"
        />
        <MetricCard
          title="Orders"
          value={metrics.orders}
          change={metrics.ordersChange}
          icon={ShoppingCart}
          trend={metrics.ordersChange >= 0 ? 'up' : 'down'}
          type="number"
        />
        <MetricCard
          title="Customers"
          value={metrics.customers}
          change={metrics.customersChange}
          icon={Users}
          trend={metrics.customersChange >= 0 ? 'up' : 'down'}
          type="number"
        />
        <MetricCard
          title="Avg. Order Value"
          value={metrics.averageOrderValue}
          change={metrics.averageOrderValueChange}
          icon={TrendingUp}
          trend={metrics.averageOrderValueChange >= 0 ? 'up' : 'down'}
          type="currency"
        />
      </div>

      {/* Sales Chart */}
      <SalesChart data={metrics.salesData} />

      {/* Widgets Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        <RecentOrders />
        <TopProducts />
      </div>
    </div>
  );
}
