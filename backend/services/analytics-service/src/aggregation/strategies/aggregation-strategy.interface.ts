/**
 * Strategy Pattern: Interface for different aggregation strategies
 * Each strategy implements a different way to aggregate analytics data
 */
export interface AggregationStrategy {
  /**
   * Aggregate data for a specific store and date range
   */
  aggregate(storeId: string, startDate: Date, endDate: Date): Promise<void>;

  /**
   * Get the name of this aggregation strategy
   */
  getName(): string;
}
