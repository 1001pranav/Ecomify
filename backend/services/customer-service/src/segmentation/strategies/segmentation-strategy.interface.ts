import { Customer } from '@prisma/client';

/**
 * Strategy Pattern: Interface for customer segmentation strategies
 * Each strategy implements a different way to evaluate segment conditions
 */
export interface SegmentationStrategy {
  /**
   * Evaluate if a customer matches the segment conditions
   */
  evaluate(customer: Customer, conditions: any): boolean;

  /**
   * Get the name of this segmentation strategy
   */
  getName(): string;
}

/**
 * Segment condition types
 */
export interface SegmentCondition {
  field: string;
  operator: 'greaterThan' | 'lessThan' | 'equals' | 'contains' | 'in';
  value: any;
}

export interface SegmentRules {
  rules: SegmentCondition[];
  logic: 'AND' | 'OR';
}
