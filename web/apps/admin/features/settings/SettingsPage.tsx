'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@ecomify/ui';
import { Store, CreditCard, Truck, Receipt, ShoppingCart, Palette } from 'lucide-react';
import { GeneralSettings } from './sections/GeneralSettings';
import { PaymentSettings } from './sections/PaymentSettings';
import { ShippingSettings } from './sections/ShippingSettings';
import { TaxSettings } from './sections/TaxSettings';
import { CheckoutSettings } from './sections/CheckoutSettings';
import { ThemeSettings } from './sections/ThemeSettings';

/**
 * SettingsPage Component
 *
 * Main settings page with tabbed navigation
 * Implements the Tabs Pattern for organizing different settings sections
 * Uses Strategy Pattern for rendering different settings sections
 *
 * Design Patterns:
 * - Tabs Pattern: Different settings sections in tabs
 * - Strategy Pattern: Each tab renders using a different settings strategy
 */

export type SettingsTab =
  | 'general'
  | 'payment'
  | 'shipping'
  | 'tax'
  | 'checkout'
  | 'theme';

/**
 * Settings Section Strategy Interface
 * Defines how each settings section should be structured
 */
interface SettingsSection {
  id: SettingsTab;
  label: string;
  icon: React.ReactNode;
  component: React.ReactNode;
}

/**
 * Settings Sections using Strategy Pattern
 * Each section implements a different strategy for managing settings
 */
const settingsSections: SettingsSection[] = [
  {
    id: 'general',
    label: 'General',
    icon: <Store className="h-4 w-4" />,
    component: <GeneralSettings />,
  },
  {
    id: 'payment',
    label: 'Payment',
    icon: <CreditCard className="h-4 w-4" />,
    component: <PaymentSettings />,
  },
  {
    id: 'shipping',
    label: 'Shipping',
    icon: <Truck className="h-4 w-4" />,
    component: <ShippingSettings />,
  },
  {
    id: 'tax',
    label: 'Tax',
    icon: <Receipt className="h-4 w-4" />,
    component: <TaxSettings />,
  },
  {
    id: 'checkout',
    label: 'Checkout',
    icon: <ShoppingCart className="h-4 w-4" />,
    component: <CheckoutSettings />,
  },
  {
    id: 'theme',
    label: 'Theme',
    icon: <Palette className="h-4 w-4" />,
    component: <ThemeSettings />,
  },
];

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your store settings and preferences
        </p>
      </div>

      {/* Tabs Pattern Implementation */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as SettingsTab)}>
        <TabsList className="grid w-full grid-cols-6">
          {settingsSections.map((section) => (
            <TabsTrigger
              key={section.id}
              value={section.id}
              className="flex items-center gap-2"
            >
              {section.icon}
              <span className="hidden sm:inline">{section.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Strategy Pattern: Render appropriate settings section based on selected tab */}
        {settingsSections.map((section) => (
          <TabsContent key={section.id} value={section.id} className="mt-6">
            {section.component}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
