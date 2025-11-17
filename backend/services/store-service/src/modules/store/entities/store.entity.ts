/**
 * Store Entity
 * Domain model for Store aggregate
 */

export interface Store {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  domain: string | null;
  customDomain: string | null;
  email: string;
  phone: string | null;
  currency: string;
  locale: string;
  timezone: string;
  settings: any;
  theme: any;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StoreResponse {
  id: string;
  name: string;
  slug: string;
  domain: string;
  customDomain?: string;
  email: string;
  phone?: string;
  currency: string;
  locale: string;
  timezone: string;
  settings: any;
  theme: any;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
