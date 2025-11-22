/**
 * Deep Linking Configuration and Utilities
 * Handles deep linking for both merchant and customer apps
 */

// Deep link configuration types
export interface DeepLinkConfig {
  prefixes: string[];
  screens: Record<string, DeepLinkScreen>;
}

export interface DeepLinkScreen {
  path: string;
  parse?: Record<string, (value: string) => unknown>;
  exact?: boolean;
}

// Customer app deep link configuration
export const customerDeepLinkConfig: DeepLinkConfig = {
  prefixes: [
    'ecomify-customer://',
    'https://shop.ecomify.com',
    'https://www.ecomify.com',
  ],
  screens: {
    // Main tabs
    Shop: {
      path: '',
    },
    Cart: {
      path: 'cart',
    },
    Account: {
      path: 'account',
    },

    // Shop stack
    ProductDetail: {
      path: 'product/:productId',
      parse: {
        productId: (id: string) => id,
      },
    },
    Category: {
      path: 'category/:categoryId',
      parse: {
        categoryId: (id: string) => id,
      },
    },
    Search: {
      path: 'search',
    },
    SearchResults: {
      path: 'search/:query',
      parse: {
        query: (q: string) => decodeURIComponent(q),
      },
    },

    // Checkout
    Checkout: {
      path: 'checkout',
    },
    OrderConfirmation: {
      path: 'order/:orderId/confirmation',
      parse: {
        orderId: (id: string) => id,
      },
    },

    // Account stack
    Orders: {
      path: 'orders',
    },
    OrderDetail: {
      path: 'order/:orderId',
      parse: {
        orderId: (id: string) => id,
      },
    },
    Addresses: {
      path: 'addresses',
    },
    Wishlist: {
      path: 'wishlist',
    },
    Settings: {
      path: 'settings',
    },

    // Auth
    Login: {
      path: 'login',
    },
    Register: {
      path: 'register',
    },
    ForgotPassword: {
      path: 'forgot-password',
    },
    ResetPassword: {
      path: 'reset-password/:token',
      parse: {
        token: (t: string) => t,
      },
    },
  },
};

// Merchant app deep link configuration
export const merchantDeepLinkConfig: DeepLinkConfig = {
  prefixes: [
    'ecomify-merchant://',
    'https://merchant.ecomify.com',
  ],
  screens: {
    // Main tabs
    Dashboard: {
      path: '',
    },
    Orders: {
      path: 'orders',
    },
    Products: {
      path: 'products',
    },
    More: {
      path: 'more',
    },

    // Orders stack
    OrderDetail: {
      path: 'order/:orderId',
      parse: {
        orderId: (id: string) => id,
      },
    },

    // Products stack
    ProductDetail: {
      path: 'product/:productId',
      parse: {
        productId: (id: string) => id,
      },
    },
    ProductForm: {
      path: 'product/:productId/edit',
      parse: {
        productId: (id: string) => id,
      },
    },
    NewProduct: {
      path: 'products/new',
    },

    // Settings
    Profile: {
      path: 'profile',
    },
    Settings: {
      path: 'settings',
    },

    // Auth
    Login: {
      path: 'login',
    },
    Register: {
      path: 'register',
    },
    ForgotPassword: {
      path: 'forgot-password',
    },
  },
};

// Convert config to React Navigation linking config
export function getNavigationLinkingConfig(config: DeepLinkConfig) {
  return {
    prefixes: config.prefixes,
    config: {
      screens: Object.entries(config.screens).reduce((acc, [name, screen]) => {
        acc[name] = {
          path: screen.path,
          parse: screen.parse,
          exact: screen.exact,
        };
        return acc;
      }, {} as Record<string, unknown>),
    },
  };
}

// Deep link builder utilities
export class DeepLinkBuilder {
  constructor(private baseUrl: string) {}

  product(productId: string): string {
    return `${this.baseUrl}/product/${productId}`;
  }

  category(categoryId: string): string {
    return `${this.baseUrl}/category/${categoryId}`;
  }

  order(orderId: string): string {
    return `${this.baseUrl}/order/${orderId}`;
  }

  search(query: string): string {
    return `${this.baseUrl}/search/${encodeURIComponent(query)}`;
  }

  cart(): string {
    return `${this.baseUrl}/cart`;
  }

  checkout(): string {
    return `${this.baseUrl}/checkout`;
  }

  account(): string {
    return `${this.baseUrl}/account`;
  }

  orders(): string {
    return `${this.baseUrl}/orders`;
  }

  wishlist(): string {
    return `${this.baseUrl}/wishlist`;
  }

  resetPassword(token: string): string {
    return `${this.baseUrl}/reset-password/${token}`;
  }
}

// Pre-configured builders
export const customerLinks = new DeepLinkBuilder('https://shop.ecomify.com');
export const merchantLinks = new DeepLinkBuilder('https://merchant.ecomify.com');

// Parse deep link URL
export function parseDeepLink(url: string): { screen: string; params: Record<string, string> } | null {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/').filter(Boolean);

    // Match against known patterns
    if (pathParts[0] === 'product' && pathParts[1]) {
      return { screen: 'ProductDetail', params: { productId: pathParts[1] } };
    }

    if (pathParts[0] === 'category' && pathParts[1]) {
      return { screen: 'Category', params: { categoryId: pathParts[1] } };
    }

    if (pathParts[0] === 'order' && pathParts[1]) {
      if (pathParts[2] === 'confirmation') {
        return { screen: 'OrderConfirmation', params: { orderId: pathParts[1] } };
      }
      return { screen: 'OrderDetail', params: { orderId: pathParts[1] } };
    }

    if (pathParts[0] === 'search') {
      if (pathParts[1]) {
        return { screen: 'SearchResults', params: { query: decodeURIComponent(pathParts[1]) } };
      }
      return { screen: 'Search', params: {} };
    }

    if (pathParts[0] === 'reset-password' && pathParts[1]) {
      return { screen: 'ResetPassword', params: { token: pathParts[1] } };
    }

    // Simple screen mappings
    const screenMap: Record<string, string> = {
      cart: 'Cart',
      checkout: 'Checkout',
      account: 'Account',
      orders: 'Orders',
      wishlist: 'Wishlist',
      addresses: 'Addresses',
      settings: 'Settings',
      login: 'Login',
      register: 'Register',
      'forgot-password': 'ForgotPassword',
      products: 'Products',
      dashboard: 'Dashboard',
      profile: 'Profile',
    };

    if (screenMap[pathParts[0]]) {
      return { screen: screenMap[pathParts[0]], params: {} };
    }

    return { screen: 'Shop', params: {} };
  } catch {
    return null;
  }
}

// Generate share links for products/orders
export function generateShareLink(type: 'product' | 'order' | 'category', id: string): string {
  switch (type) {
    case 'product':
      return customerLinks.product(id);
    case 'order':
      return customerLinks.order(id);
    case 'category':
      return customerLinks.category(id);
    default:
      return customerLinks.product(id);
  }
}
