import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AggregationStrategy } from './aggregation-strategy.interface';
import { startOfDay, endOfDay } from 'date-fns';

/**
 * Strategy Pattern Implementation: Product Performance Aggregation
 * Aggregates product-related events and sales data
 */
@Injectable()
export class ProductPerformanceAggregator implements AggregationStrategy {
  constructor(private readonly prisma: PrismaService) {}

  getName(): string {
    return 'ProductPerformanceAggregator';
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

    // Get all products for this store
    const products = await this.prisma.product.findMany({
      where: { storeId },
      select: { id: true },
    });

    for (const product of products) {
      await this.aggregateProductForDate(storeId, product.id, dayStart, dayEnd);
    }
  }

  private async aggregateProductForDate(
    storeId: string,
    productId: string,
    dayStart: Date,
    dayEnd: Date,
  ): Promise<void> {
    // Get sales data
    const lineItems = await this.prisma.orderLineItem.findMany({
      where: {
        order: {
          storeId,
          financialStatus: 'PAID',
          createdAt: {
            gte: dayStart,
            lte: dayEnd,
          },
        },
        variant: {
          productId,
        },
      },
      include: {
        variant: true,
      },
    });

    const revenue = lineItems.reduce(
      (sum, item) => sum + Number(item.totalPrice),
      0,
    );
    const unitsSold = lineItems.reduce((sum, item) => sum + item.quantity, 0);

    // Get view events
    const viewEvents = await this.prisma.analyticsEvent.count({
      where: {
        storeId,
        eventType: 'product.viewed',
        timestamp: {
          gte: dayStart,
          lte: dayEnd,
        },
        eventData: {
          path: ['productId'],
          equals: productId,
        },
      },
    });

    // Get add to cart events
    const addToCartEvents = await this.prisma.analyticsEvent.count({
      where: {
        storeId,
        eventType: 'product.added_to_cart',
        timestamp: {
          gte: dayStart,
          lte: dayEnd,
        },
        eventData: {
          path: ['productId'],
          equals: productId,
        },
      },
    });

    // Only create metrics if there's any activity
    if (revenue > 0 || unitsSold > 0 || viewEvents > 0 || addToCartEvents > 0) {
      await this.prisma.productPerformanceMetrics.upsert({
        where: {
          storeId_productId_date: {
            storeId,
            productId,
            date: dayStart,
          },
        },
        update: {
          revenue,
          unitsSold,
          views: viewEvents,
          addToCarts: addToCartEvents,
        },
        create: {
          storeId,
          productId,
          date: dayStart,
          revenue,
          unitsSold,
          views: viewEvents,
          addToCarts: addToCartEvents,
        },
      });
    }
  }
}
