/**
 * StatusBadge Component
 * Order/fulfillment status badges
 */

import React from 'react';
import { Badge } from './Badge';
import { STATUS_COLORS } from '@ecomify/core';

type StatusType = keyof typeof STATUS_COLORS;

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

const statusLabels: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
  unfulfilled: 'Unfulfilled',
  partial: 'Partial',
  fulfilled: 'Fulfilled',
  restocked: 'Restocked',
  paid: 'Paid',
  partially_refunded: 'Partially Refunded',
};

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const normalizedStatus = status.toLowerCase().replace(/\s+/g, '_') as StatusType;
  const color = STATUS_COLORS[normalizedStatus] || '#6b7280';
  const label = statusLabels[normalizedStatus] || status;

  // Determine variant based on color
  const getVariant = () => {
    if (color === '#10b981') return 'success';
    if (color === '#f59e0b') return 'warning';
    if (color === '#ef4444') return 'error';
    if (color === '#3b82f6' || color === '#2563eb') return 'primary';
    if (color === '#8b5cf6') return 'secondary';
    return 'default';
  };

  return (
    <Badge variant={getVariant()} size={size}>
      {label}
    </Badge>
  );
}
