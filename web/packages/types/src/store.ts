export interface Store {
  id: string;
  name: string;
  domain: string;
  email: string;
  phone?: string;
  currency: string;
  timezone: string;
  logo?: string;
  settings: StoreSettings;
  createdAt: string;
  updatedAt: string;
}

export interface StoreSettings {
  general: {
    storeName: string;
    storeEmail: string;
    storePhone?: string;
  };
  theme: {
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
  };
  checkout: {
    requiresShipping: boolean;
    requiresAccount: boolean;
    enableGuestCheckout: boolean;
  };
  shipping: ShippingZone[];
  payments: PaymentGateway[];
  taxes: TaxSettings;
}

export interface ShippingZone {
  id: string;
  name: string;
  countries: string[];
  rates: ShippingRate[];
}

export interface ShippingRate {
  id: string;
  name: string;
  price: number;
  minOrderValue?: number;
  maxOrderValue?: number;
}

export interface PaymentGateway {
  id: string;
  provider: 'stripe' | 'paypal' | 'square';
  enabled: boolean;
  credentials: Record<string, string>;
}

export interface TaxSettings {
  enabled: boolean;
  inclusive: boolean;
  rate: number;
}
