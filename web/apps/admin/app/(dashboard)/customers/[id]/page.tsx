'use client';

import { CustomerDetail } from '@/features/customers';

export default function CustomerDetailPage({ params }: { params: { id: string } }) {
  return <CustomerDetail customerId={params.id} />;
}
