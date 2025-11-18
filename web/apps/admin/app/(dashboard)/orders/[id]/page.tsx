'use client';

import { OrderDetail } from '@/features/orders/OrderDetail';

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  return <OrderDetail orderId={params.id} />;
}
