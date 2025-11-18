'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@ecomify/ui';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Users, UserPlus, UserCheck, UserX } from 'lucide-react';

/**
 * CustomerAnalytics Component
 *
 * Displays customer-related analytics including:
 * - Customer segments
 * - New vs returning customers
 * - Customer growth metrics
 */

interface CustomerMetrics {
  totalCustomers: number;
  newCustomers: number;
  returningCustomers: number;
  customerRetentionRate: number;
  segments: {
    name: string;
    value: number;
    color: string;
  }[];
}

interface CustomerAnalyticsProps {
  data: CustomerMetrics;
}

const COLORS = ['hsl(var(--primary))', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export function CustomerAnalytics({ data }: CustomerAnalyticsProps) {
  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Customer Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No customer data available</p>
        </CardContent>
      </Card>
    );
  }

  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Analytics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Customer Metrics Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 rounded-lg border p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="text-lg font-bold">{data.totalCustomers.toLocaleString()}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg border p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                <UserPlus className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">New</p>
                <p className="text-lg font-bold">{data.newCustomers.toLocaleString()}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg border p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                <UserCheck className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Returning</p>
                <p className="text-lg font-bold">{data.returningCustomers.toLocaleString()}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg border p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                <UserX className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Retention</p>
                <p className="text-lg font-bold">
                  {formatPercentage(data.customerRetentionRate)}
                </p>
              </div>
            </div>
          </div>

          {/* Customer Segments Pie Chart */}
          {data.segments && data.segments.length > 0 && (
            <div>
              <h4 className="mb-3 text-sm font-semibold">Customer Segments</h4>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={data.segments}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {data.segments.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => value.toLocaleString()}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
