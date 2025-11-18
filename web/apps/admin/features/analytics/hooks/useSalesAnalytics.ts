import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { analyticsApi } from '@ecomify/api-client';
import type { DateRange } from '../AnalyticsPage';

/**
 * useSalesAnalytics Hook - Custom Hooks Pattern
 *
 * Fetches sales analytics data for a given date range
 * Implements the Custom Hooks Pattern for reusable data fetching logic
 *
 * @param dateRange - The date range to fetch analytics for
 * @returns Query result with sales analytics data
 */

interface SalesMetrics {
  totalRevenue: number;
  revenueChange: number;
  totalOrders: number;
  ordersChange: number;
  totalCustomers: number;
  customersChange: number;
  averageOrderValue: number;
  averageOrderValueChange: number;
}

interface TimeSeriesData {
  date: string;
  revenue: number;
  orders: number;
}

interface ProductPerformance {
  id: string;
  title: string;
  sales: number;
  revenue: number;
  change: number;
}

interface CustomerMetrics {
  totalCustomers: number;
  newCustomers: number;
  returningCustomers: number;
  customerRetentionRate: number;
  segments: {
    name: string;
    value: number;
    color: string;
  }[];
}

export interface SalesAnalyticsData {
  metrics: SalesMetrics;
  timeSeries: TimeSeriesData[];
  topProducts: ProductPerformance[];
  customerMetrics: CustomerMetrics;
}

export function useSalesAnalytics(dateRange: DateRange) {
  return useQuery({
    queryKey: ['sales-analytics', format(dateRange.from, 'yyyy-MM-dd'), format(dateRange.to, 'yyyy-MM-dd')],
    queryFn: async (): Promise<SalesAnalyticsData> => {
      // In a real app, this would call the API
      // For now, return mock data that matches the expected structure
      const response = await analyticsApi.getSalesData({
        startDate: format(dateRange.from, 'yyyy-MM-dd'),
        endDate: format(dateRange.to, 'yyyy-MM-dd'),
      });

      // The backend should return this structure, but we'll mock it for now
      // TODO: Update backend to return proper analytics data structure
      return {
        metrics: {
          totalRevenue: 125430.50,
          revenueChange: 12.5,
          totalOrders: 342,
          ordersChange: 8.2,
          totalCustomers: 156,
          customersChange: 15.3,
          averageOrderValue: 366.73,
          averageOrderValueChange: 3.8,
        },
        timeSeries: generateMockTimeSeries(dateRange),
        topProducts: [
          { id: '1', title: 'Premium Wireless Headphones', sales: 45, revenue: 13500, change: 15.2 },
          { id: '2', title: 'Smart Watch Pro', sales: 38, revenue: 11400, change: 8.5 },
          { id: '3', title: 'Laptop Stand Aluminum', sales: 52, revenue: 2600, change: -2.3 },
          { id: '4', title: 'USB-C Hub', sales: 67, revenue: 3350, change: 22.1 },
          { id: '5', title: 'Mechanical Keyboard', sales: 28, revenue: 4200, change: 5.7 },
        ],
        customerMetrics: {
          totalCustomers: 156,
          newCustomers: 42,
          returningCustomers: 114,
          customerRetentionRate: 73.1,
          segments: [
            { name: 'High Value', value: 28, color: '#10b981' },
            { name: 'Medium Value', value: 65, color: '#f59e0b' },
            { name: 'Low Value', value: 42, color: '#ef4444' },
            { name: 'Inactive', value: 21, color: '#6b7280' },
          ],
        },
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

/**
 * Helper function to generate mock time series data
 * In production, this would come from the backend
 */
function generateMockTimeSeries(dateRange: DateRange): TimeSeriesData[] {
  const data: TimeSeriesData[] = [];
  const diffDays = Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24));

  // Generate data points based on the date range
  const points = Math.min(diffDays, 30); // Max 30 data points

  for (let i = 0; i < points; i++) {
    const date = new Date(dateRange.from);
    date.setDate(date.getDate() + Math.floor((i / points) * diffDays));

    data.push({
      date: format(date, 'MMM d'),
      revenue: Math.floor(Math.random() * 5000) + 2000,
      orders: Math.floor(Math.random() * 20) + 5,
    });
  }

  return data;
}
