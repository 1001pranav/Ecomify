import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { Granularity } from './dto/sales-report.dto';
import {
  startOfWeek,
  startOfMonth,
  endOfWeek,
  endOfMonth,
  eachDayOfInterval,
  eachWeekOfInterval,
  eachMonthOfInterval,
  format,
} from 'date-fns';

/**
 * Reports Service: Generates analytics reports from aggregated data
 * Implements caching for frequently accessed reports
 */
@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get sales overview report
   */
  async getSalesReport(
    storeId: string,
    dateFrom: Date,
    dateTo: Date,
    granularity: Granularity = Granularity.DAY,
  ) {
    // Fetch daily metrics
    const dailyMetrics = await this.prisma.dailySalesMetrics.findMany({
      where: {
        storeId,
        date: {
          gte: dateFrom,
          lte: dateTo,
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    // Calculate totals
    const totalRevenue = dailyMetrics.reduce(
      (sum, m) => sum + Number(m.revenue),
      0,
    );
    const totalOrders = dailyMetrics.reduce((sum, m) => sum + m.orders, 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Build time series based on granularity
    const timeSeries = this.buildTimeSeries(
      dailyMetrics,
      dateFrom,
      dateTo,
      granularity,
    );

    return {
      revenue: totalRevenue,
      orders: totalOrders,
      avgOrderValue,
      timeSeries,
    };
  }

  /**
   * Get top performing products
   */
  async getTopProducts(
    storeId: string,
    metric: 'revenue' | 'units',
    limit: number = 10,
    dateFrom?: Date,
    dateTo?: Date,
  ) {
    const where: any = { storeId };

    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) where.date.gte = dateFrom;
      if (dateTo) where.date.lte = dateTo;
    }

    // Aggregate by product
    const productMetrics = await this.prisma.productPerformanceMetrics.groupBy({
      by: ['productId'],
      where,
      _sum: {
        revenue: true,
        unitsSold: true,
      },
      orderBy: {
        _sum: metric === 'revenue' ? { revenue: 'desc' } : { unitsSold: 'desc' },
      },
      take: limit,
    });

    // Fetch product details
    const productsWithMetrics = await Promise.all(
      productMetrics.map(async (pm) => {
        const product = await this.prisma.product.findUnique({
          where: { id: pm.productId },
          select: {
            id: true,
            title: true,
            handle: true,
          },
        });

        return {
          ...product,
          revenue: Number(pm._sum.revenue) || 0,
          unitsSold: pm._sum.unitsSold || 0,
        };
      }),
    );

    return productsWithMetrics;
  }

  /**
   * Get customer analytics
   */
  async getCustomerAnalytics(storeId: string, dateFrom?: Date, dateTo?: Date) {
    const where: any = { storeId };

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = dateFrom;
      if (dateTo) where.createdAt.lte = dateTo;
    }

    const [totalCustomers, newCustomers, customerStats] = await Promise.all([
      this.prisma.customer.count({ where: { storeId } }),
      this.prisma.customer.count({ where }),
      this.prisma.customer.aggregate({
        where: { storeId },
        _avg: {
          totalSpent: true,
        },
        _sum: {
          ordersCount: true,
        },
      }),
    ]);

    // Calculate returning customers (those with more than 1 order)
    const returningCustomers = await this.prisma.customer.count({
      where: {
        storeId,
        ordersCount: {
          gt: 1,
        },
      },
    });

    return {
      total: totalCustomers,
      new: newCustomers,
      returning: returningCustomers,
      avgLifetimeValue: Number(customerStats._avg.totalSpent) || 0,
      totalOrders: customerStats._sum.ordersCount || 0,
    };
  }

  /**
   * Build time series data based on granularity
   */
  private buildTimeSeries(
    dailyMetrics: any[],
    dateFrom: Date,
    dateTo: Date,
    granularity: Granularity,
  ) {
    switch (granularity) {
      case Granularity.DAY:
        return this.buildDailyTimeSeries(dailyMetrics, dateFrom, dateTo);
      case Granularity.WEEK:
        return this.buildWeeklyTimeSeries(dailyMetrics, dateFrom, dateTo);
      case Granularity.MONTH:
        return this.buildMonthlyTimeSeries(dailyMetrics, dateFrom, dateTo);
      default:
        return this.buildDailyTimeSeries(dailyMetrics, dateFrom, dateTo);
    }
  }

  private buildDailyTimeSeries(dailyMetrics: any[], dateFrom: Date, dateTo: Date) {
    const days = eachDayOfInterval({ start: dateFrom, end: dateTo });
    const metricsMap = new Map(
      dailyMetrics.map((m) => [format(m.date, 'yyyy-MM-dd'), m]),
    );

    return days.map((day) => {
      const key = format(day, 'yyyy-MM-dd');
      const metric = metricsMap.get(key);

      return {
        date: key,
        revenue: metric ? Number(metric.revenue) : 0,
        orders: metric ? metric.orders : 0,
      };
    });
  }

  private buildWeeklyTimeSeries(dailyMetrics: any[], dateFrom: Date, dateTo: Date) {
    const weeks = eachWeekOfInterval({ start: dateFrom, end: dateTo });

    return weeks.map((weekStart) => {
      const weekEnd = endOfWeek(weekStart);

      const weekMetrics = dailyMetrics.filter((m) => {
        const date = new Date(m.date);
        return date >= weekStart && date <= weekEnd;
      });

      const revenue = weekMetrics.reduce((sum, m) => sum + Number(m.revenue), 0);
      const orders = weekMetrics.reduce((sum, m) => sum + m.orders, 0);

      return {
        date: format(weekStart, 'yyyy-MM-dd'),
        revenue,
        orders,
      };
    });
  }

  private buildMonthlyTimeSeries(dailyMetrics: any[], dateFrom: Date, dateTo: Date) {
    const months = eachMonthOfInterval({ start: dateFrom, end: dateTo });

    return months.map((monthStart) => {
      const monthEnd = endOfMonth(monthStart);

      const monthMetrics = dailyMetrics.filter((m) => {
        const date = new Date(m.date);
        return date >= monthStart && date <= monthEnd;
      });

      const revenue = monthMetrics.reduce((sum, m) => sum + Number(m.revenue), 0);
      const orders = monthMetrics.reduce((sum, m) => sum + m.orders, 0);

      return {
        date: format(monthStart, 'yyyy-MM'),
        revenue,
        orders,
      };
    });
  }
}
