'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Input,
  Label,
  Button,
} from '@ecomify/ui';
import { useCategories } from '@ecomify/api-client';
import type { Status } from '@ecomify/types';
import { X } from 'lucide-react';

/**
 * ProductFilters Component
 *
 * Sidebar filters for the product list including:
 * - Status filter (draft/active/archived)
 * - Category filter
 * - Price range
 * - Tags filter
 * - Clear filters button
 */

interface ProductFiltersProps {
  status?: Status;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  tags?: string[];
  onStatusChange: (status?: Status) => void;
  onCategoryChange: (categoryId?: string) => void;
  onPriceRangeChange: (min?: number, max?: number) => void;
  onTagsChange: (tags: string[]) => void;
  onClearFilters: () => void;
}

export function ProductFilters({
  status,
  categoryId,
  minPrice,
  maxPrice,
  tags = [],
  onStatusChange,
  onCategoryChange,
  onPriceRangeChange,
  onTagsChange,
  onClearFilters,
}: ProductFiltersProps) {
  const { data: categoriesData, isLoading: categoriesLoading } = useCategories();
  const [tagInput, setTagInput] = useState('');

  const categories = categoriesData?.data || [];

  const hasActiveFilters = status || categoryId || minPrice || maxPrice || tags.length > 0;

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      onTagsChange([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onTagsChange(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Refine your product search</CardDescription>
          </div>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="h-8 px-2"
            >
              Clear all
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status Filter */}
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={status || 'all'}
            onValueChange={(value) =>
              onStatusChange(value === 'all' ? undefined : (value as Status))
            }
          >
            <SelectTrigger id="status">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Category Filter */}
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select
            value={categoryId || 'all'}
            onValueChange={(value) =>
              onCategoryChange(value === 'all' ? undefined : value)
            }
          >
            <SelectTrigger id="category">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categoriesLoading ? (
                <SelectItem value="loading" disabled>
                  Loading...
                </SelectItem>
              ) : (
                categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Price Range */}
        <div className="space-y-2">
          <Label>Price Range</Label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Input
                type="number"
                placeholder="Min"
                value={minPrice || ''}
                onChange={(e) => {
                  const value = e.target.value ? parseFloat(e.target.value) : undefined;
                  onPriceRangeChange(value, maxPrice);
                }}
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <Input
                type="number"
                placeholder="Max"
                value={maxPrice || ''}
                onChange={(e) => {
                  const value = e.target.value ? parseFloat(e.target.value) : undefined;
                  onPriceRangeChange(minPrice, value);
                }}
                min="0"
                step="0.01"
              />
            </div>
          </div>
        </div>

        {/* Tags Filter */}
        <div className="space-y-2">
          <Label htmlFor="tags">Tags</Label>
          <div className="flex gap-2">
            <Input
              id="tags"
              placeholder="Add tag..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleAddTag}
              disabled={!tagInput.trim()}
            >
              Add
            </Button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((tag) => (
                <div
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-sm"
                >
                  {tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
