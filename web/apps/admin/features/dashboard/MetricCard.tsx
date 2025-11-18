import { Card } from '@ecomify/ui';
import { ArrowDown, ArrowUp, LucideIcon } from 'lucide-react';
import { formatCurrency, formatNumber, formatPercent } from '@ecomify/utils';

/**
 * MetricCard Component
 *
 * Presentational component that displays a key metric with an icon,
 * value, and trend indicator.
 *
 * Following the Container/Presentational Pattern
 */

interface MetricCardProps {
  title: string;
  value: number;
  change: number;
  icon: LucideIcon;
  trend: 'up' | 'down';
  type?: 'currency' | 'number';
}

export function MetricCard({
  title,
  value,
  change,
  icon: Icon,
  trend,
  type = 'number',
}: MetricCardProps) {
  const isPositive = change >= 0;
  const formattedValue = type === 'currency' ? formatCurrency(value) : formatNumber(value);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between space-x-4">
        <div className="space-y-2 flex-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{formattedValue}</p>
          <div className="flex items-center space-x-1">
            {trend === 'up' ? (
              <ArrowUp
                className={`h-4 w-4 ${
                  isPositive ? 'text-green-600' : 'text-red-600'
                }`}
              />
            ) : (
              <ArrowDown
                className={`h-4 w-4 ${
                  isPositive ? 'text-green-600' : 'text-red-600'
                }`}
              />
            )}
            <span
              className={`text-xs font-medium ${
                isPositive ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {formatPercent(change)}
            </span>
            <span className="text-xs text-muted-foreground">from last month</span>
          </div>
        </div>
        <div className="rounded-full bg-primary/10 p-3">
          <Icon className="h-6 w-6 text-primary" />
        </div>
      </div>
    </Card>
  );
}
