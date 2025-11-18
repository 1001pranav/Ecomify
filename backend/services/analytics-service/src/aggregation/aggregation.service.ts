import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DailySalesAggregator } from './strategies/daily-sales.aggregator';
import { ProductPerformanceAggregator } from './strategies/product-performance.aggregator';
import { AggregationStrategy } from './strategies/aggregation-strategy.interface';
import { PrismaService } from '../database/prisma.service';
import { subDays } from 'date-fns';

/**
 * Strategy Pattern Context: Manages and executes different aggregation strategies
 * This service coordinates the execution of various aggregation strategies
 */
@Injectable()
export class AggregationService {
  private strategies: Map<string, AggregationStrategy>;

  constructor(
    private readonly prisma: PrismaService,
    private readonly dailySalesAggregator: DailySalesAggregator,
    private readonly productPerformanceAggregator: ProductPerformanceAggregator,
  ) {
    // Initialize strategy map
    this.strategies = new Map([
      ['dailySales', dailySalesAggregator],
      ['productPerformance', productPerformanceAggregator],
    ]);
  }

  /**
   * Run a specific aggregation strategy
   */
  async runStrategy(
    strategyName: string,
    storeId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<void> {
    const strategy = this.strategies.get(strategyName);

    if (!strategy) {
      throw new Error(`Unknown aggregation strategy: ${strategyName}`);
    }

    console.log(`Running ${strategy.getName()} for store ${storeId}`);
    await strategy.aggregate(storeId, startDate, endDate);
    console.log(`Completed ${strategy.getName()} for store ${storeId}`);
  }

  /**
   * Run all aggregation strategies for a store
   */
  async runAllStrategies(
    storeId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<void> {
    for (const [name, strategy] of this.strategies) {
      try {
        await this.runStrategy(name, storeId, startDate, endDate);
      } catch (error) {
        console.error(`Error running ${name} strategy:`, error);
      }
    }
  }

  /**
   * Scheduled job: Aggregate yesterday's data for all stores
   * Runs daily at 2 AM
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async scheduledDailyAggregation() {
    console.log('🔄 Starting scheduled daily aggregation');

    const yesterday = subDays(new Date(), 1);

    // Get all active stores
    const stores = await this.prisma.store.findMany({
      where: {
        status: 'ACTIVE',
      },
      select: {
        id: true,
        name: true,
      },
    });

    console.log(`Processing ${stores.length} stores`);

    for (const store of stores) {
      try {
        await this.runAllStrategies(store.id, yesterday, yesterday);
        console.log(`✅ Completed aggregation for ${store.name}`);
      } catch (error) {
        console.error(`❌ Error aggregating ${store.name}:`, error);
      }
    }

    console.log('✅ Scheduled daily aggregation completed');
  }

  /**
   * Manually trigger aggregation for a specific store
   */
  async aggregateStore(
    storeId: string,
    daysBack: number = 7,
  ): Promise<void> {
    const endDate = new Date();
    const startDate = subDays(endDate, daysBack);

    await this.runAllStrategies(storeId, startDate, endDate);
  }

  /**
   * Get available aggregation strategies
   */
  getAvailableStrategies(): string[] {
    return Array.from(this.strategies.keys());
  }
}
