import { Controller, Get, Query, Post, Param, Body } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { SalesReportQueryDto, TopProductsQueryDto } from './dto/sales-report.dto';
import { AggregationService } from '../aggregation/aggregation.service';

/**
 * Analytics Reports Controller
 * Exposes REST API endpoints for analytics reports
 */
@Controller('analytics')
export class ReportsController {
  constructor(
    private readonly reportsService: ReportsService,
    private readonly aggregationService: AggregationService,
  ) {}

  /**
   * GET /api/v1/analytics/sales
   * Get sales overview report
   */
  @Get('sales')
  async getSalesReport(@Query() query: SalesReportQueryDto) {
    const dateFrom = new Date(query.dateFrom);
    const dateTo = new Date(query.dateTo);

    return this.reportsService.getSalesReport(
      query.storeId,
      dateFrom,
      dateTo,
      query.granularity,
    );
  }

  /**
   * GET /api/v1/analytics/products/top
   * Get top performing products
   */
  @Get('products/top')
  async getTopProducts(@Query() query: TopProductsQueryDto) {
    const dateFrom = query.dateFrom ? new Date(query.dateFrom) : undefined;
    const dateTo = query.dateTo ? new Date(query.dateTo) : undefined;

    return this.reportsService.getTopProducts(
      query.storeId,
      query.metric,
      query.limit,
      dateFrom,
      dateTo,
    );
  }

  /**
   * GET /api/v1/analytics/customers
   * Get customer analytics
   */
  @Get('customers')
  async getCustomerAnalytics(
    @Query('storeId') storeId: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    const from = dateFrom ? new Date(dateFrom) : undefined;
    const to = dateTo ? new Date(dateTo) : undefined;

    return this.reportsService.getCustomerAnalytics(storeId, from, to);
  }

  /**
   * POST /api/v1/analytics/aggregate/:storeId
   * Manually trigger aggregation for a store
   */
  @Post('aggregate/:storeId')
  async aggregateStore(
    @Param('storeId') storeId: string,
    @Body('daysBack') daysBack: number = 7,
  ) {
    await this.aggregationService.aggregateStore(storeId, daysBack);

    return {
      message: `Aggregation triggered for store ${storeId}`,
      daysBack,
    };
  }

  /**
   * GET /api/v1/analytics/strategies
   * Get available aggregation strategies
   */
  @Get('strategies')
  async getStrategies() {
    return {
      strategies: this.aggregationService.getAvailableStrategies(),
    };
  }
}
