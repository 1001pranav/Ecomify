'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Package, Search, Filter, Eye, ChevronRight } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
} from '@ecomify/ui';
import { formatCurrency } from '@ecomify/utils';

/**
 * Order History Page
 * List of all customer orders with filtering
 */

// Mock orders data
const mockOrders = [
  {
    id: 'ORD-2024-001',
    date: '2024-11-20T10:30:00',
    status: 'delivered',
    financialStatus: 'paid',
    total: 129.99,
    items: [
      { title: 'Classic T-Shirt', quantity: 2, price: 29.99 },
      { title: 'Denim Jeans', quantity: 1, price: 69.99 },
    ],
  },
  {
    id: 'ORD-2024-002',
    date: '2024-11-15T14:20:00',
    status: 'shipped',
    financialStatus: 'paid',
    total: 79.50,
    items: [
      { title: 'Running Shoes', quantity: 1, price: 79.50 },
    ],
  },
  {
    id: 'ORD-2024-003',
    date: '2024-11-10T09:15:00',
    status: 'processing',
    financialStatus: 'paid',
    total: 249.00,
    items: [
      { title: 'Winter Jacket', quantity: 1, price: 199.00 },
      { title: 'Wool Scarf', quantity: 2, price: 25.00 },
    ],
  },
  {
    id: 'ORD-2024-004',
    date: '2024-10-28T16:45:00',
    status: 'cancelled',
    financialStatus: 'refunded',
    total: 59.99,
    items: [
      { title: 'Casual Sneakers', quantity: 1, price: 59.99 },
    ],
  },
];

const statusConfig = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  processing: { label: 'Processing', color: 'bg-blue-100 text-blue-800' },
  shipped: { label: 'Shipped', color: 'bg-purple-100 text-purple-800' },
  delivered: { label: 'Delivered', color: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800' },
};

export default function OrdersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredOrders = mockOrders.filter((order) => {
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Order History</h2>
        <p className="text-muted-foreground">
          View and track all your orders
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Package className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 font-semibold">No orders found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your filters'
                : "You haven't placed any orders yet"}
            </p>
            {!searchQuery && statusFilter === 'all' && (
              <Button asChild className="mt-4">
                <Link href="/products">Start Shopping</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}

interface Order {
  id: string;
  date: string;
  status: string;
  financialStatus: string;
  total: number;
  items: Array<{ title: string; quantity: number; price: number }>;
}

function OrderCard({ order }: { order: Order }) {
  const config = statusConfig[order.status as keyof typeof statusConfig];

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-base">{order.id}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {new Date(order.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={config.color}>{config.label}</Badge>
            <span className="font-semibold">{formatCurrency(order.total)}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {order.items.map((item, index) => (
            <div key={index} className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {item.title} × {item.quantity}
              </span>
              <span>{formatCurrency(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>
        <Separator className="my-4" />
        <div className="flex justify-between">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/account/orders/${order.id}`}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </Link>
          </Button>
          {order.status === 'delivered' && (
            <Button variant="ghost" size="sm">
              Buy Again
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
