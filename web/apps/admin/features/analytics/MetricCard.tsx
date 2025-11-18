'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@ecomify/ui';
import { ArrowUpIcon, ArrowDownIcon, LucideIcon } from 'lucide-react';
import { cn } from '@ecomify/utils';

/**
 * MetricCard Component
 *
 * Displays a single metric with value, change indicator, and icon
 * Reusable presentational component following the Container/Presentational pattern
 */

export interface MetricCardProps {
  title: string;
  value: number | string;
  change?: number;
  icon: LucideIcon;
  trend?: 'up' | 'down';
  type?: 'currency' | 'number' | 'percentage';
}

export function MetricCard({
  title,
  value,
  change,
  icon: Icon,
  trend = 'up',
  type = 'number',
}: MetricCardProps) {
  const formatValue = (val: number | string) => {
    if (typeof val === 'string') return val;

    switch (type) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(val);
      case 'percentage':
        return `${val.toFixed(1)}%`;
      default:
        return new Intl.NumberFormat('en-US').format(val);
    }
  };

  const formatChange = (val: number) => {
    const sign = val >= 0 ? '+' : '';
    return `${sign}${val.toFixed(1)}%`;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatValue(value)}</div>
        {change !== undefined && (
          <div className="flex items-center gap-1 text-xs">
            {trend === 'up' ? (
              <ArrowUpIcon className={cn('h-3 w-3', change >= 0 ? 'text-green-600' : 'text-red-600')} />
            ) : (
              <ArrowDownIcon className={cn('h-3 w-3', change >= 0 ? 'text-green-600' : 'text-red-600')} />
            )}
            <span className={cn(change >= 0 ? 'text-green-600' : 'text-red-600')}>
              {formatChange(change)}
            </span>
            <span className="text-muted-foreground">from last period</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
