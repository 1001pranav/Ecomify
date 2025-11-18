import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useCallback } from 'react';

/**
 * useQueryParams Hook
 *
 * Manage URL query parameters with type safety
 * Observer Pattern for URL state
 */
export function useQueryParams<T extends Record<string, any>>(): [
  T,
  (updates: Partial<T>) => void
] {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  // Parse current params
  const params = Object.fromEntries(searchParams.entries()) as T;

  // Update params
  const setParams = useCallback(
    (updates: Partial<T>) => {
      const newParams = new URLSearchParams(searchParams);

      // Update or remove parameters
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === undefined || value === '') {
          newParams.delete(key);
        } else {
          newParams.set(key, String(value));
        }
      });

      router.push(`${pathname}?${newParams.toString()}`);
    },
    [searchParams, pathname, router]
  );

  return [params, setParams];
}
