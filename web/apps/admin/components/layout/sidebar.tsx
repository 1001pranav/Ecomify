'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@ecomify/utils';
import { useUIStore } from '@/stores/ui-store';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  LucideIcon,
} from 'lucide-react';

/**
 * Sidebar Component - Compound Component Pattern
 *
 * Main navigation sidebar for the admin dashboard.
 * Uses the Observer pattern via Zustand store for state management.
 */

interface MenuItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

const menuItems: MenuItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Products',
    href: '/products',
    icon: Package,
  },
  {
    label: 'Orders',
    href: '/orders',
    icon: ShoppingCart,
  },
  {
    label: 'Customers',
    href: '/customers',
    icon: Users,
  },
  {
    label: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

export function Sidebar() {
  const sidebarOpen = useUIStore((state) => state.sidebarOpen);
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-background transition-transform duration-300 ease-in-out lg:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <SidebarHeader />

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {menuItems.map((item) => (
            <SidebarItem
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.label}
              active={pathname === item.href || pathname.startsWith(item.href + '/')}
            />
          ))}
        </nav>

        {/* Footer */}
        <SidebarFooter />
      </div>
    </aside>
  );
}

/**
 * SidebarHeader - Compound Component
 */
function SidebarHeader() {
  return (
    <div className="flex h-16 items-center border-b border-border px-6">
      <Link href="/dashboard" className="flex items-center space-x-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <span className="text-lg font-bold text-primary-foreground">E</span>
        </div>
        <span className="text-xl font-bold">Ecomify</span>
      </Link>
    </div>
  );
}

/**
 * SidebarItem - Compound Component
 */
interface SidebarItemProps {
  href: string;
  icon: LucideIcon;
  label: string;
  active: boolean;
}

function SidebarItem({ href, icon: Icon, label, active }: SidebarItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        'flex items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
        active
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
      )}
    >
      <Icon className="h-5 w-5" />
      <span>{label}</span>
    </Link>
  );
}

/**
 * SidebarFooter - Compound Component
 */
function SidebarFooter() {
  return (
    <div className="border-t border-border px-3 py-4">
      <div className="rounded-lg bg-muted px-3 py-4">
        <p className="text-xs font-medium text-muted-foreground">
          Ecomify Admin v1.0
        </p>
      </div>
    </div>
  );
}
