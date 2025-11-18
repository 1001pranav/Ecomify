export interface DashboardMetrics {
  revenue: number;
  revenueChange: number;
  orders: number;
  ordersChange: number;
  customers: number;
  customersChange: number;
  averageOrderValue: number;
  averageOrderValueChange: number;
  salesData: SalesDataPoint[];
}

export interface SalesDataPoint {
  date: string;
  revenue: number;
  orders: number;
}

export interface TopProduct {
  id: string;
  title: string;
  image?: string;
  revenue: number;
  unitsSold: number;
  ordersCount: number;
}

export interface AnalyticsFilters {
  dateFrom: string;
  dateTo: string;
  storeId?: string;
}
