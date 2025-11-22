'use client';

import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';
import { useUIStore } from '@/stores/ui-store';
import { cn } from '@ecomify/utils';

/**
 * Dashboard Layout - Container/Presentational Pattern
 *
 * Main layout for the dashboard pages.
 * Combines Sidebar and Topbar components with the page content.
 *
 * Features:
 * - Responsive design (mobile and desktop)
 * - Sidebar toggle functionality
 * - Consistent spacing and layout
 */

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sidebarOpen = useUIStore((state) => state.sidebarOpen);
  const setSidebarOpen = useUIStore((state) => state.setSidebarOpen);

  return (
    <div className="relative min-h-screen">
      {/* Sidebar */}
      <Sidebar />

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Main content area */}
      <div
        className={cn(
          'min-h-screen transition-all duration-300 ease-in-out',
          sidebarOpen ? 'lg:pl-64' : 'lg:pl-0'
        )}
      >
        <Topbar />
        <main className="container mx-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
