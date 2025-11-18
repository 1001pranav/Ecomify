import { Address } from './common';

export interface Customer {
  id: string;
  storeId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  addresses: Address[];
  defaultAddress?: Address;
  tags: string[];
  ordersCount: number;
  totalSpent: number;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerFilters {
  search?: string;
  tags?: string[];
  minSpent?: number;
  maxSpent?: number;
  page?: number;
  limit?: number;
}
