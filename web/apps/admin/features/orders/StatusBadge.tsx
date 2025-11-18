'use client';

import { Badge } from '@ecomify/ui';
import type { OrderFinancialStatus, OrderFulfillmentStatus } from '@ecomify/types';

/**
 * Status Badge Component - Factory Pattern
 * Creates appropriate badge variants based on status type
 */

interface StatusBadgeProps {
  status: OrderFinancialStatus | OrderFulfillmentStatus;
  type: 'financial' | 'fulfillment';
}

export function StatusBadge({ status, type }: StatusBadgeProps) {
  const getVariant = () => {
    if (type === 'financial') {
      const financialVariants: Record<OrderFinancialStatus, string> = {
        paid: 'default',
        pending: 'secondary',
        partially_paid: 'secondary',
        refunded: 'destructive',
        voided: 'outline',
      };
      return financialVariants[status as OrderFinancialStatus] || 'outline';
    } else {
      const fulfillmentVariants: Record<OrderFulfillmentStatus, string> = {
        fulfilled: 'default',
        unfulfilled: 'secondary',
        partially_fulfilled: 'secondary',
        cancelled: 'destructive',
      };
      return fulfillmentVariants[status as OrderFulfillmentStatus] || 'outline';
    }
  };

  const getLabel = () => {
    return status
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <Badge variant={getVariant() as any}>
      {getLabel()}
    </Badge>
  );
}
