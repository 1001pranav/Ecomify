'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@ecomify/ui';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
} from 'recharts';
import { formatCurrency, formatDate } from '@ecomify/utils';
import type { SalesDataPoint } from '@ecomify/types';

/**
 * SalesChart Component
 *
 * Displays a line chart showing revenue and orders over time using Recharts.
 *
 * Following the Container/Presentational Pattern
 */

interface SalesChartProps {
  data: SalesDataPoint[];
}

export function SalesChart({ data }: SalesChartProps) {
  // Format data for the chart
  const chartData = data.map((point) => ({
    ...point,
    formattedDate: formatDate(point.date, 'MMM dd'),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="formattedDate"
              className="text-xs"
              stroke="hsl(var(--muted-foreground))"
            />
            <YAxis
              className="text-xs"
              stroke="hsl(var(--muted-foreground))"
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--primary))' }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="orders"
              stroke="hsl(var(--secondary))"
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--secondary))' }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
        <div className="flex items-center justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-sm text-muted-foreground">Revenue</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-secondary" />
            <span className="text-sm text-muted-foreground">Orders</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CustomTooltip({ active, payload }: TooltipProps<number, string>) {
  if (!active || !payload || !payload.length) {
    return null;
  }

  return (
    <div className="rounded-lg border bg-background p-3 shadow-md">
      <div className="space-y-1">
        <p className="text-sm font-medium">
          {payload[0]?.payload?.formattedDate}
        </p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center justify-between gap-4">
            <span className="text-sm text-muted-foreground capitalize">
              {entry.name}:
            </span>
            <span className="text-sm font-medium">
              {entry.name === 'revenue'
                ? formatCurrency(entry.value as number)
                : entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
