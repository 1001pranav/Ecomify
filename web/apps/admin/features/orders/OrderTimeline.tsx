'use client';

import { CheckCircle, Clock, Package, XCircle } from 'lucide-react';
import type { Order } from '@ecomify/types';

/**
 * Order Timeline Component
 * Displays order events in chronological order
 */

interface OrderTimelineProps {
  order: Order;
}

interface TimelineEvent {
  id: string;
  type: 'created' | 'paid' | 'fulfilled' | 'cancelled';
  title: string;
  description: string;
  timestamp: string;
  icon: React.ReactNode;
}

export function OrderTimeline({ order }: OrderTimelineProps) {
  const events: TimelineEvent[] = [];

  // Order created
  events.push({
    id: 'created',
    type: 'created',
    title: 'Order Created',
    description: `Order ${order.orderNumber} was placed`,
    timestamp: order.createdAt,
    icon: <Clock className="h-4 w-4" />,
  });

  // Payment status
  if (order.financialStatus === 'paid') {
    events.push({
      id: 'paid',
      type: 'paid',
      title: 'Payment Received',
      description: 'Payment was successfully processed',
      timestamp: order.updatedAt, // In real app, this would be a separate timestamp
      icon: <CheckCircle className="h-4 w-4 text-green-600" />,
    });
  }

  // Fulfillment status
  if (order.fulfillmentStatus === 'fulfilled') {
    events.push({
      id: 'fulfilled',
      type: 'fulfilled',
      title: 'Order Fulfilled',
      description: 'All items have been shipped',
      timestamp: order.updatedAt, // In real app, this would be a separate timestamp
      icon: <Package className="h-4 w-4 text-blue-600" />,
    });
  }

  // Cancellation
  if (order.fulfillmentStatus === 'cancelled') {
    events.push({
      id: 'cancelled',
      type: 'cancelled',
      title: 'Order Cancelled',
      description: 'Order was cancelled',
      timestamp: order.updatedAt, // In real app, this would be a separate timestamp
      icon: <XCircle className="h-4 w-4 text-red-600" />,
    });
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-4">
      {events.map((event, index) => (
        <div key={event.id} className="flex gap-3">
          <div className="flex flex-col items-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 bg-white">
              {event.icon}
            </div>
            {index < events.length - 1 && (
              <div className="h-full w-px bg-gray-300 my-1" />
            )}
          </div>
          <div className="flex-1 pb-4">
            <div className="font-medium">{event.title}</div>
            <div className="text-sm text-muted-foreground">{event.description}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {formatDate(event.timestamp)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
