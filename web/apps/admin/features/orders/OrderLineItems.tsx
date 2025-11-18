'use client';

import Image from 'next/image';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@ecomify/ui';
import type { LineItem } from '@ecomify/types';

/**
 * Order Line Items Component - Presentational Pattern
 * Displays order items in a table format
 */

interface OrderLineItemsProps {
  items: LineItem[];
  currency?: string;
}

export function OrderLineItems({ items, currency = 'USD' }: OrderLineItemsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Product</TableHead>
          <TableHead>SKU</TableHead>
          <TableHead className="text-right">Price</TableHead>
          <TableHead className="text-right">Quantity</TableHead>
          <TableHead className="text-right">Total</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow key={item.id}>
            <TableCell>
              <div className="flex items-center gap-3">
                {item.image && (
                  <div className="relative w-12 h-12 rounded border overflow-hidden flex-shrink-0">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div>
                  <div className="font-medium">{item.title}</div>
                  {item.variantTitle && (
                    <div className="text-sm text-muted-foreground">
                      {item.variantTitle}
                    </div>
                  )}
                </div>
              </div>
            </TableCell>
            <TableCell>{item.sku || '-'}</TableCell>
            <TableCell className="text-right">{formatCurrency(item.price)}</TableCell>
            <TableCell className="text-right">{item.quantity}</TableCell>
            <TableCell className="text-right font-medium">
              {formatCurrency(item.totalPrice)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
