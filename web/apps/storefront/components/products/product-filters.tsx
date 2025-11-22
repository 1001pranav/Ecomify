'use client';

import { useState } from 'react';
import { Filter, X } from 'lucide-react';
import {
  Button,
  Input,
  Label,
  Checkbox,
  Slider,
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Badge,
  Separator,
} from '@ecomify/ui';
import { formatCurrency } from '@ecomify/utils';
import type { ProductFilters as ProductFiltersType, Category } from '@ecomify/types';

/**
 * Product Filters Component - Observer Pattern
 * Sidebar filters for product listing
 */

interface ProductFiltersProps {
  filters: ProductFiltersType;
  onChange: (filters: Partial<ProductFiltersType>) => void;
  categories?: Category[];
  tags?: string[];
  maxPrice?: number;
}

export function ProductFilters({
  filters,
  onChange,
  categories = [],
  tags = [],
  maxPrice = 1000,
}: ProductFiltersProps) {
  // Count active filters
  const activeFilterCount = [
    filters.categoryId,
    filters.tags?.length,
    filters.minPrice !== undefined || filters.maxPrice !== undefined,
    filters.status,
  ].filter(Boolean).length;

  const clearFilters = () => {
    onChange({
      categoryId: undefined,
      tags: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      status: undefined,
    });
  };

  return (
    <>
      {/* Mobile Filter Button */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" className="gap-2 lg:hidden">
            <Filter className="h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80">
          <SheetHeader>
            <SheetTitle className="flex items-center justify-between">
              Filters
              {activeFilterCount > 0 && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear all
                </Button>
              )}
            </SheetTitle>
          </SheetHeader>
          <div className="mt-4">
            <FilterContent
              filters={filters}
              onChange={onChange}
              categories={categories}
              tags={tags}
              maxPrice={maxPrice}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className="hidden w-64 flex-shrink-0 lg:block">
        <div className="sticky top-20 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Filters</h2>
            {activeFilterCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear all
              </Button>
            )}
          </div>
          <FilterContent
            filters={filters}
            onChange={onChange}
            categories={categories}
            tags={tags}
            maxPrice={maxPrice}
          />
        </div>
      </div>
    </>
  );
}

/**
 * Filter Content Component
 */
interface FilterContentProps {
  filters: ProductFiltersType;
  onChange: (filters: Partial<ProductFiltersType>) => void;
  categories: Category[];
  tags: string[];
  maxPrice: number;
}

function FilterContent({
  filters,
  onChange,
  categories,
  tags,
  maxPrice,
}: FilterContentProps) {
  const [priceRange, setPriceRange] = useState<[number, number]>([
    filters.minPrice || 0,
    filters.maxPrice || maxPrice,
  ]);

  const handlePriceChange = (value: number[]) => {
    setPriceRange([value[0], value[1]]);
  };

  const applyPriceFilter = () => {
    onChange({
      minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
      maxPrice: priceRange[1] < maxPrice ? priceRange[1] : undefined,
    });
  };

  return (
    <Accordion type="multiple" defaultValue={['categories', 'price', 'tags']} className="w-full">
      {/* Categories */}
      {categories.length > 0 && (
        <AccordionItem value="categories">
          <AccordionTrigger>Categories</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {categories.map((category) => (
                <label
                  key={category.id}
                  className="flex cursor-pointer items-center gap-2"
                >
                  <Checkbox
                    checked={filters.categoryId === category.id}
                    onCheckedChange={(checked) => {
                      onChange({
                        categoryId: checked ? category.id : undefined,
                      });
                    }}
                  />
                  <span className="text-sm">{category.name}</span>
                  {category.productsCount !== undefined && (
                    <span className="text-xs text-muted-foreground">
                      ({category.productsCount})
                    </span>
                  )}
                </label>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      )}

      {/* Price Range */}
      <AccordionItem value="price">
        <AccordionTrigger>Price Range</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4">
            <Slider
              defaultValue={priceRange}
              max={maxPrice}
              step={10}
              onValueChange={handlePriceChange}
              onValueCommit={applyPriceFilter}
            />
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={priceRange[0]}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  setPriceRange([value, priceRange[1]]);
                }}
                onBlur={applyPriceFilter}
                className="h-8"
              />
              <span className="text-muted-foreground">-</span>
              <Input
                type="number"
                value={priceRange[1]}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  setPriceRange([priceRange[0], value]);
                }}
                onBlur={applyPriceFilter}
                className="h-8"
              />
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{formatCurrency(priceRange[0])}</span>
              <span>{formatCurrency(priceRange[1])}</span>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Tags */}
      {tags.length > 0 && (
        <AccordionItem value="tags">
          <AccordionTrigger>Tags</AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => {
                const isSelected = filters.tags?.includes(tag);
                return (
                  <Badge
                    key={tag}
                    variant={isSelected ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => {
                      const currentTags = filters.tags || [];
                      const newTags = isSelected
                        ? currentTags.filter((t) => t !== tag)
                        : [...currentTags, tag];
                      onChange({
                        tags: newTags.length > 0 ? newTags : undefined,
                      });
                    }}
                  >
                    {tag}
                    {isSelected && <X className="ml-1 h-3 w-3" />}
                  </Badge>
                );
              })}
            </div>
          </AccordionContent>
        </AccordionItem>
      )}

      {/* Availability */}
      <AccordionItem value="availability">
        <AccordionTrigger>Availability</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-2">
            <label className="flex cursor-pointer items-center gap-2">
              <Checkbox
                checked={filters.status === 'active'}
                onCheckedChange={(checked) => {
                  onChange({
                    status: checked ? 'active' : undefined,
                  });
                }}
              />
              <span className="text-sm">In Stock</span>
            </label>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

/**
 * Active Filters Display
 */
interface ActiveFiltersProps {
  filters: ProductFiltersType;
  onChange: (filters: Partial<ProductFiltersType>) => void;
  categories?: Category[];
}

export function ActiveFilters({
  filters,
  onChange,
  categories = [],
}: ActiveFiltersProps) {
  const activeFilters: Array<{ key: string; label: string; onRemove: () => void }> =
    [];

  if (filters.categoryId) {
    const category = categories.find((c) => c.id === filters.categoryId);
    if (category) {
      activeFilters.push({
        key: 'category',
        label: category.name,
        onRemove: () => onChange({ categoryId: undefined }),
      });
    }
  }

  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    const min = filters.minPrice || 0;
    const max = filters.maxPrice ? formatCurrency(filters.maxPrice) : '+';
    activeFilters.push({
      key: 'price',
      label: `${formatCurrency(min)} - ${max}`,
      onRemove: () => onChange({ minPrice: undefined, maxPrice: undefined }),
    });
  }

  if (filters.tags?.length) {
    filters.tags.forEach((tag) => {
      activeFilters.push({
        key: `tag-${tag}`,
        label: tag,
        onRemove: () =>
          onChange({
            tags: filters.tags?.filter((t) => t !== tag),
          }),
      });
    });
  }

  if (activeFilters.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-muted-foreground">Active filters:</span>
      {activeFilters.map((filter) => (
        <Badge key={filter.key} variant="secondary" className="gap-1">
          {filter.label}
          <button onClick={filter.onRemove} className="ml-1 hover:text-destructive">
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
      <Button
        variant="ghost"
        size="sm"
        onClick={() =>
          onChange({
            categoryId: undefined,
            tags: undefined,
            minPrice: undefined,
            maxPrice: undefined,
            status: undefined,
          })
        }
      >
        Clear all
      </Button>
    </div>
  );
}
