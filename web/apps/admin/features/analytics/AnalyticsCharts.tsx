'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ecomify/ui';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Button } from '@ecomify/ui';
import { LineChartIcon, BarChart3, AreaChartIcon } from 'lucide-react';
import { cn } from '@ecomify/utils';

/**
 * AnalyticsCharts Component
 *
 * Displays sales data using different chart types
 * Implements the Strategy Pattern for chart rendering
 *
 * Strategy Pattern:
 * - Different chart strategies (Line, Bar, Area) can be selected
 * - Each strategy renders the same data differently
 * - Chart type can be switched dynamically
 */

interface TimeSeriesData {
  date: string;
  revenue: number;
  orders: number;
}

interface AnalyticsChartsProps {
  data: TimeSeriesData[];
}

type ChartType = 'line' | 'bar' | 'area';

/**
 * Chart Strategy Interface
 * Defines how different chart types should render data
 */
interface ChartStrategy {
  type: ChartType;
  label: string;
  icon: React.ReactNode;
  render: (data: TimeSeriesData[]) => React.ReactNode;
}

/**
 * Chart Strategies
 * Each strategy implements a different way to visualize the data
 */
const chartStrategies: Record<ChartType, ChartStrategy> = {
  line: {
    type: 'line',
    label: 'Line Chart',
    icon: <LineChartIcon className="h-4 w-4" />,
    render: (data) => (
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `$${value.toLocaleString()}`}
          />
          <Tooltip
            formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
            labelFormatter={(label) => `Date: ${label}`}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    ),
  },
  bar: {
    type: 'bar',
    label: 'Bar Chart',
    icon: <BarChart3 className="h-4 w-4" />,
    render: (data) => (
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `$${value.toLocaleString()}`}
          />
          <Tooltip
            formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
            labelFormatter={(label) => `Date: ${label}`}
          />
          <Legend />
          <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    ),
  },
  area: {
    type: 'area',
    label: 'Area Chart',
    icon: <AreaChartIcon className="h-4 w-4" />,
    render: (data) => (
      <ResponsiveContainer width="100%" height={350}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `$${value.toLocaleString()}`}
          />
          <Tooltip
            formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
            labelFormatter={(label) => `Date: ${label}`}
          />
          <Legend />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="hsl(var(--primary))"
            fillOpacity={1}
            fill="url(#colorRevenue)"
          />
        </AreaChart>
      </ResponsiveContainer>
    ),
  },
};

export function AnalyticsCharts({ data }: AnalyticsChartsProps) {
  const [selectedChartType, setSelectedChartType] = useState<ChartType>('line');

  // Get the current chart strategy
  const currentStrategy = chartStrategies[selectedChartType];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Sales Over Time</CardTitle>
          <div className="flex gap-1 rounded-lg border p-1">
            {Object.values(chartStrategies).map((strategy) => (
              <Button
                key={strategy.type}
                variant="ghost"
                size="sm"
                onClick={() => setSelectedChartType(strategy.type)}
                className={cn(
                  'gap-2',
                  selectedChartType === strategy.type &&
                    'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground'
                )}
              >
                {strategy.icon}
                <span className="hidden sm:inline">{strategy.label}</span>
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Render using the selected strategy */}
        {currentStrategy.render(data)}
      </CardContent>
    </Card>
  );
}
