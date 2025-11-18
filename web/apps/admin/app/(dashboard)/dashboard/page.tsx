import { Dashboard } from '@/features/dashboard';

/**
 * Dashboard Page
 *
 * Main dashboard overview page showing key metrics and statistics.
 * Uses the Dashboard component from features/dashboard.
 */

export default function DashboardPage() {
  // TODO: Get storeId from auth context or user session
  // For now, using default storeId from environment or 'default'
  const storeId = process.env.NEXT_PUBLIC_STORE_ID || 'default';

  return <Dashboard storeId={storeId} />;
}
