'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Search, X, Loader2 } from 'lucide-react';
import {
  Button,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Separator,
} from '@ecomify/ui';
import { useDebounce } from '@ecomify/hooks';
import { formatCurrency } from '@ecomify/utils';
import { useProductSearch } from '../../hooks/use-products';

/**
 * Search Bar Component - Debouncing Pattern
 * Search input with autocomplete suggestions
 */

export function SearchBar() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const router = useRouter();

  // Debounce search query
  const debouncedQuery = useDebounce(query, 300);

  // Fetch search suggestions
  const { data: suggestions, isLoading } = useProductSearch(debouncedQuery, {
    enabled: debouncedQuery.length >= 2,
  });

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (query.trim()) {
        setOpen(false);
        router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      }
    },
    [query, router]
  );

  const handleClear = useCallback(() => {
    setQuery('');
  }, []);

  const handleSelect = useCallback(
    (handle: string) => {
      setOpen(false);
      setQuery('');
      router.push(`/products/${handle}`);
    },
    [router]
  );

  return (
    <Popover open={open && query.length >= 2} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <form onSubmit={handleSearch} className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search products..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            className="w-64 pl-9 pr-8"
            onFocus={() => setOpen(true)}
          />
          {query && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2"
              onClick={handleClear}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </form>
      </PopoverTrigger>

      <PopoverContent className="w-[300px] p-0" align="end">
        <SearchResults
          query={debouncedQuery}
          suggestions={suggestions || []}
          isLoading={isLoading}
          onSelect={handleSelect}
          onViewAll={() => {
            setOpen(false);
            router.push(`/search?q=${encodeURIComponent(query.trim())}`);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}

/**
 * Mobile Search Button
 */
export function MobileSearchButton() {
  const router = useRouter();

  return (
    <Button
      variant="ghost"
      size="icon"
      className="sm:hidden"
      onClick={() => router.push('/search')}
    >
      <Search className="h-5 w-5" />
      <span className="sr-only">Search</span>
    </Button>
  );
}

/**
 * Search Results Component
 */
interface SearchResultsProps {
  query: string;
  suggestions: Array<{
    id: string;
    title: string;
    handle: string;
    price: number;
    images: Array<{ url: string; altText?: string }>;
  }>;
  isLoading: boolean;
  onSelect: (handle: string) => void;
  onViewAll: () => void;
}

function SearchResults({
  query,
  suggestions,
  isLoading,
  onSelect,
  onViewAll,
}: SearchResultsProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (query.length < 2) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        Type at least 2 characters to search
      </div>
    );
  }

  if (suggestions.length === 0) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        No products found for "{query}"
      </div>
    );
  }

  return (
    <div>
      <div className="max-h-[300px] overflow-auto">
        {suggestions.map((product) => (
          <button
            key={product.id}
            className="flex w-full items-center gap-3 p-3 text-left transition-colors hover:bg-muted"
            onClick={() => onSelect(product.handle)}
          >
            <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded border bg-muted">
              {product.images[0] ? (
                <Image
                  src={product.images[0].url}
                  alt={product.images[0].altText || product.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  <Search className="h-4 w-4" />
                </div>
              )}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate font-medium">{product.title}</p>
              <p className="text-sm text-muted-foreground">
                {formatCurrency(product.price)}
              </p>
            </div>
          </button>
        ))}
      </div>

      <Separator />

      <button
        className="w-full p-3 text-center text-sm font-medium text-primary hover:bg-muted"
        onClick={onViewAll}
      >
        View all results for "{query}"
      </button>
    </div>
  );
}
