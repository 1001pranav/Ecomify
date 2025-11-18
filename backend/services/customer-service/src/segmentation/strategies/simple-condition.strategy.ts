import { Injectable } from '@nestjs/common';
import { Customer } from '@prisma/client';
import {
  SegmentationStrategy,
  SegmentRules,
  SegmentCondition,
} from './segmentation-strategy.interface';

/**
 * Strategy Pattern Implementation: Simple Condition-based Segmentation
 * Evaluates customers based on simple field conditions with AND/OR logic
 */
@Injectable()
export class SimpleConditionStrategy implements SegmentationStrategy {
  getName(): string {
    return 'SimpleConditionStrategy';
  }

  evaluate(customer: Customer, conditions: SegmentRules): boolean {
    if (!conditions || !conditions.rules || conditions.rules.length === 0) {
      return false;
    }

    const results = conditions.rules.map((rule) =>
      this.evaluateCondition(customer, rule),
    );

    if (conditions.logic === 'OR') {
      return results.some((r) => r === true);
    } else {
      // Default to AND
      return results.every((r) => r === true);
    }
  }

  private evaluateCondition(
    customer: Customer,
    condition: SegmentCondition,
  ): boolean {
    const fieldValue = this.getFieldValue(customer, condition.field);

    switch (condition.operator) {
      case 'greaterThan':
        return Number(fieldValue) > Number(condition.value);

      case 'lessThan':
        return Number(fieldValue) < Number(condition.value);

      case 'equals':
        return fieldValue === condition.value;

      case 'contains':
        if (typeof fieldValue === 'string') {
          return fieldValue.includes(condition.value);
        }
        if (Array.isArray(fieldValue)) {
          return fieldValue.includes(condition.value);
        }
        return false;

      case 'in':
        if (Array.isArray(condition.value)) {
          return condition.value.includes(fieldValue);
        }
        return false;

      default:
        return false;
    }
  }

  private getFieldValue(customer: Customer, field: string): any {
    // Support nested field access with dot notation
    const parts = field.split('.');
    let value: any = customer;

    for (const part of parts) {
      if (value && typeof value === 'object' && part in value) {
        value = value[part];
      } else {
        return undefined;
      }
    }

    return value;
  }
}
