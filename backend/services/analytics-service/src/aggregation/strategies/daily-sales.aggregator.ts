import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AggregationStrategy } from './aggregation-strategy.interface';
import { startOfDay, endOfDay } from 'date-fns';

/**
 * Strategy Pattern Implementation: Daily Sales Aggregation
 * Aggregates order data into daily sales metrics
 */
@Injectable()
export class DailySalesAggregator implements AggregationStrategy {
  constructor(private readonly prisma: PrismaService) {}

  getName(): string {
    return 'DailySalesAggregator';
  }

  async aggregate(storeId: string, startDate: Date, endDate: Date): Promise<void> {
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      await this.aggregateForDate(storeId, currentDate);
      currentDate.setDate(currentDate.getDate() + 1);
    }
  }

  private async aggregateForDate(storeId: string, date: Date): Promise<void> {
    const dayStart = startOfDay(date);
    const dayEnd = endOfDay(date);

    // Fetch all paid orders for the day
    const orders = await this.prisma.order.findMany({
      where: {
        storeId,
        financialStatus: 'PAID',
        createdAt: {
          gte: dayStart,
          lte: dayEnd,
        },
      },
      include: {
        lineItems: true,
      },
    });

    // Calculate metrics
    const revenue = orders.reduce(
      (sum, order) => sum + Number(order.totalPrice),
      0,
    );
    const ordersCount = orders.length;
    const units = orders.reduce(
      (sum, order) => sum + order.lineItems.reduce((s, item) => s + item.quantity, 0),
      0,
    );
    const avgOrder = ordersCount > 0 ? revenue / ordersCount : 0;

    // Upsert daily metrics
    await this.prisma.dailySalesMetrics.upsert({
      where: {
        storeId_date: {
          storeId,
          date: dayStart,
        },
      },
      update: {
        revenue,
        orders: ordersCount,
        units,
        avgOrder,
      },
      create: {
        storeId,
        date: dayStart,
        revenue,
        orders: ordersCount,
        units,
        avgOrder,
      },
    });
  }
}
