import { Module } from '@nestjs/common';
import { AggregationService } from './aggregation.service';
import { DailySalesAggregator } from './strategies/daily-sales.aggregator';
import { ProductPerformanceAggregator } from './strategies/product-performance.aggregator';

@Module({
  providers: [
    AggregationService,
    DailySalesAggregator,
    ProductPerformanceAggregator,
  ],
  exports: [AggregationService],
})
export class AggregationModule {}
