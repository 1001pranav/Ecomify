'use client';

import { Header } from './header';
import { Footer } from './footer';

/**
 * Storefront Layout - Layout Pattern
 * Main layout wrapper for all storefront pages
 */

interface StorefrontLayoutProps {
  children: React.ReactNode;
}

export function StorefrontLayout({ children }: StorefrontLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
