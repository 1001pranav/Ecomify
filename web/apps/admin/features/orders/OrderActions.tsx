'use client';

import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Button,
} from '@ecomify/ui';
import { MoreVertical, Package, XCircle, RefreshCw } from 'lucide-react';
import type { Order } from '@ecomify/types';

/**
 * Order Actions Component
 * Provides quick actions for orders in list view
 */

interface OrderActionsProps {
  order: Order;
  onFulfill?: (order: Order) => void;
  onRefund?: (order: Order) => void;
  onCancel?: (order: Order) => void;
}

export function OrderActions({
  order,
  onFulfill,
  onRefund,
  onCancel,
}: OrderActionsProps) {
  const canFulfill = order.fulfillmentStatus === 'unfulfilled' ||
                     order.fulfillmentStatus === 'partially_fulfilled';
  const canRefund = order.financialStatus === 'paid';
  const canCancel = order.fulfillmentStatus !== 'fulfilled' &&
                    order.financialStatus !== 'refunded';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {canFulfill && onFulfill && (
          <DropdownMenuItem onClick={() => onFulfill(order)}>
            <Package className="mr-2 h-4 w-4" />
            Fulfill Order
          </DropdownMenuItem>
        )}
        {canRefund && onRefund && (
          <DropdownMenuItem onClick={() => onRefund(order)}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refund
          </DropdownMenuItem>
        )}
        {canCancel && onCancel && (
          <DropdownMenuItem onClick={() => onCancel(order)}>
            <XCircle className="mr-2 h-4 w-4" />
            Cancel Order
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
