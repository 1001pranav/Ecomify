'use client';

import { useState } from 'react';
import { subDays, format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@ecomify/ui';
import { DollarSign, ShoppingCart, Users, TrendingUp, Download } from 'lucide-react';
import { MetricCard } from './MetricCard';
import { AnalyticsCharts } from './AnalyticsCharts';
import { ProductPerformanceTable } from './ProductPerformanceTable';
import { CustomerAnalytics } from './CustomerAnalytics';
import { DateRangePicker } from './DateRangePicker';
import { ExportButton } from './ExportButton';
import { useSalesAnalytics } from './hooks/useSalesAnalytics';

/**
 * Analytics Page Component
 *
 * Main analytics page that displays comprehensive analytics data including:
 * - Sales metrics
 * - Sales charts with date filtering
 * - Product performance data
 * - Customer analytics
 *
 * Design Patterns Used:
 * - Custom Hooks Pattern: useSalesAnalytics for data fetching
 * - Strategy Pattern: Different chart types via AnalyticsCharts component
 * - Container/Presentational Pattern: Container handles logic, presentational components handle UI
 */

export interface DateRange {
  from: Date;
  to: Date;
}

export function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  const { data: salesData, isLoading, error } = useSalesAnalytics(dateRange);

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <div className="h-10 w-64 bg-muted animate-pulse rounded-md" />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>

        <div className="h-[400px] bg-muted animate-pulse rounded-lg" />

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
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
          <p className="text-sm text-destructive">
            Failed to load analytics data. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  // No data state
  if (!salesData) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <div className="rounded-lg border bg-muted/50 p-8 text-center">
          <p className="text-sm text-muted-foreground">
            No analytics data available for the selected date range
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Date Range Picker and Export */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            {format(dateRange.from, 'MMM d, yyyy')} - {format(dateRange.to, 'MMM d, yyyy')}
          </p>
        </div>
        <div className="flex gap-2">
          <DateRangePicker value={dateRange} onChange={setDateRange} />
          <ExportButton
            data={salesData}
            dateRange={dateRange}
            filename={`analytics-${format(new Date(), 'yyyy-MM-dd')}`}
          />
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Sales"
          value={salesData.metrics.totalRevenue}
          change={salesData.metrics.revenueChange}
          icon={DollarSign}
          trend={salesData.metrics.revenueChange >= 0 ? 'up' : 'down'}
          type="currency"
        />
        <MetricCard
          title="Orders"
          value={salesData.metrics.totalOrders}
          change={salesData.metrics.ordersChange}
          icon={ShoppingCart}
          trend={salesData.metrics.ordersChange >= 0 ? 'up' : 'down'}
          type="number"
        />
        <MetricCard
          title="Customers"
          value={salesData.metrics.totalCustomers}
          change={salesData.metrics.customersChange}
          icon={Users}
          trend={salesData.metrics.customersChange >= 0 ? 'up' : 'down'}
          type="number"
        />
        <MetricCard
          title="Avg. Order Value"
          value={salesData.metrics.averageOrderValue}
          change={salesData.metrics.averageOrderValueChange}
          icon={TrendingUp}
          trend={salesData.metrics.averageOrderValueChange >= 0 ? 'up' : 'down'}
          type="currency"
        />
      </div>

      {/* Sales Charts - Strategy Pattern for different chart types */}
      <AnalyticsCharts data={salesData.timeSeries} />

      {/* Product Performance & Customer Analytics */}
      <div className="grid gap-4 md:grid-cols-2">
        <ProductPerformanceTable products={salesData.topProducts} />
        <CustomerAnalytics data={salesData.customerMetrics} />
      </div>
    </div>
  );
}
