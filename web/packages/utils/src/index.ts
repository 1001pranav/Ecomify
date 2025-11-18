import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, parseISO } from 'date-fns';

// Utility function to merge Tailwind CSS classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Currency formatting
export function formatCurrency(
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
}

// Number formatting
export function formatNumber(value: number, decimals: number = 0): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

// Percentage formatting
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${formatNumber(value, decimals)}%`;
}

// Date formatting
export function formatDate(
  date: string | Date,
  formatStr: string = 'MMM d, yyyy'
): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatStr);
}

export function formatDateTime(
  date: string | Date,
  formatStr: string = 'MMM d, yyyy h:mm a'
): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatStr);
}

export function formatRelativeTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(dateObj, { addSuffix: true });
}

// String utilities
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function truncate(text: string, length: number = 100): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
}

export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

export function titleCase(text: string): string {
  return text
    .split(' ')
    .map((word) => capitalize(word))
    .join(' ');
}

// Array utilities
export function unique<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

export function chunk<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

export function groupBy<T>(
  arr: T[],
  key: keyof T | ((item: T) => string)
): Record<string, T[]> {
  return arr.reduce((groups, item) => {
    const groupKey =
      typeof key === 'function' ? key(item) : String(item[key]);
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(item);
    return groups;
  }, {} as Record<string, T[]>);
}

// Object utilities
export function omit<T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const result = { ...obj };
  keys.forEach((key) => delete result[key]);
  return result;
}

export function pick<T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>;
  keys.forEach((key) => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  return result;
}

// Validation utilities
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Storage utilities
export const storage = {
  get<T>(key: string, defaultValue?: T): T | null {
    if (typeof window === 'undefined') return defaultValue ?? null;
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue ?? null;
    } catch (error) {
      console.error(`Error reading from localStorage:`, error);
      return defaultValue ?? null;
    }
  },

  set<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing to localStorage:`, error);
    }
  },

  remove(key: string): void {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing from localStorage:`, error);
    }
  },

  clear(): void {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.clear();
    } catch (error) {
      console.error(`Error clearing localStorage:`, error);
    }
  },
};

// Debounce utility
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

// Throttle utility
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Sleep utility
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Random utilities
export function randomId(length: number = 8): string {
  return Math.random()
    .toString(36)
    .substring(2, 2 + length);
}

export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Query string utilities
export function parseQueryString(queryString: string): Record<string, string> {
  const params = new URLSearchParams(queryString);
  const result: Record<string, string> = {};
  params.forEach((value, key) => {
    result[key] = value;
  });
  return result;
}

export function buildQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });
  return searchParams.toString();
}

// Error handling
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'An unknown error occurred';
}

// Type guards
export function isNonNullable<T>(value: T): value is NonNullable<T> {
  return value !== null && value !== undefined;
}

export function isDefined<T>(value: T | undefined): value is T {
  return value !== undefined;
}

export function isNotEmpty(value: string | null | undefined): value is string {
  return Boolean(value && value.trim().length > 0);
}
