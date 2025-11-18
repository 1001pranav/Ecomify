'use client';

import { useState, useEffect } from 'react';
import { Plus, X, Trash2 } from 'lucide-react';
import { Button, Input, Label, Card } from '@ecomify/ui';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@ecomify/ui';
import type { ProductVariantInput, ProductOption } from '@ecomify/types';

/**
 * VariantBuilder Component
 *
 * Allows users to define product options (like Size, Color) and automatically
 * generates all possible variant combinations.
 * Features:
 * - Add/remove options
 * - Define option values (comma-separated)
 * - Auto-generate variant combinations
 * - Edit variant fields (price, SKU, inventory, etc.)
 * - Delete individual variants
 * - Add manual variants
 */

interface VariantBuilderProps {
  value: ProductVariantInput[];
  onChange: (variants: ProductVariantInput[]) => void;
  options: ProductOption[];
  onOptionsChange: (options: ProductOption[]) => void;
}

export function VariantBuilder({
  value,
  onChange,
  options,
  onOptionsChange,
}: VariantBuilderProps) {
  const [newOptionName, setNewOptionName] = useState('');

  // Generate all variant combinations when options change
  useEffect(() => {
    if (options.length > 0 && options.every((opt) => opt.values.length > 0)) {
      generateVariants();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(options)]);

  const addOption = () => {
    if (!newOptionName.trim()) return;

    const newOption: ProductOption = {
      name: newOptionName.trim(),
      values: [],
    };

    onOptionsChange([...options, newOption]);
    setNewOptionName('');
  };

  const removeOption = (index: number) => {
    const newOptions = options.filter((_, i) => i !== index);
    onOptionsChange(newOptions);

    // Clear variants when removing options
    if (newOptions.length === 0) {
      onChange([]);
    }
  };

  const updateOptionName = (index: number, name: string) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], name };
    onOptionsChange(newOptions);
  };

  const updateOptionValues = (index: number, valuesString: string) => {
    const values = valuesString
      .split(',')
      .map((v) => v.trim())
      .filter((v) => v.length > 0);

    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], values };
    onOptionsChange(newOptions);
  };

  // Generate all possible variant combinations
  const generateVariants = () => {
    if (options.length === 0) {
      onChange([]);
      return;
    }

    const combinations = cartesianProduct(
      options.map((opt) => opt.values)
    );

    const newVariants: ProductVariantInput[] = combinations.map((combo) => {
      const optionsMap: Record<string, string> = {};
      options.forEach((opt, i) => {
        optionsMap[opt.name] = combo[i];
      });

      // Check if variant already exists
      const existingVariant = value.find((v) =>
        Object.keys(optionsMap).every((key) => v.options[key] === optionsMap[key])
      );

      return (
        existingVariant || {
          title: combo.join(' / '),
          price: 0,
          compareAtPrice: undefined,
          cost: undefined,
          sku: '',
          barcode: '',
          inventoryQty: 0,
          inventoryPolicy: 'deny' as const,
          weight: undefined,
          weightUnit: 'kg' as const,
          options: optionsMap,
        }
      );
    });

    onChange(newVariants);
  };

  // Cartesian product helper
  const cartesianProduct = (arrays: string[][]): string[][] => {
    if (arrays.length === 0) return [[]];
    if (arrays.length === 1) return arrays[0].map((v) => [v]);

    const [first, ...rest] = arrays;
    const restProduct = cartesianProduct(rest);

    return first.flatMap((value) =>
      restProduct.map((combination) => [value, ...combination])
    );
  };

  const updateVariant = (
    index: number,
    field: keyof ProductVariantInput,
    value: any
  ) => {
    const newVariants = [...value];
    newVariants[index] = { ...newVariants[index], [field]: value };
    onChange(newVariants);
  };

  const deleteVariant = (index: number) => {
    const newVariants = value.filter((_, i) => i !== index);
    onChange(newVariants);
  };

  const addManualVariant = () => {
    const newVariant: ProductVariantInput = {
      title: 'Manual Variant',
      price: 0,
      sku: '',
      inventoryQty: 0,
      inventoryPolicy: 'deny',
      weightUnit: 'kg',
      options: {},
    };

    onChange([...value, newVariant]);
  };

  return (
    <div className="space-y-6">
      {/* Options Section */}
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Product Options</h3>
            <p className="text-sm text-muted-foreground">
              Define options like Size or Color to create product variants
            </p>
          </div>

          {/* Existing Options */}
          {options.map((option, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <Label>Option Name</Label>
                  <Input
                    value={option.name}
                    onChange={(e) => updateOptionName(index, e.target.value)}
                    placeholder="e.g., Size, Color"
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeOption(index)}
                  className="mt-6"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div>
                <Label>Option Values (comma-separated)</Label>
                <Input
                  value={option.values.join(', ')}
                  onChange={(e) => updateOptionValues(index, e.target.value)}
                  placeholder="e.g., Small, Medium, Large"
                />
              </div>
            </div>
          ))}

          {/* Add New Option */}
          <div className="flex gap-2">
            <Input
              value={newOptionName}
              onChange={(e) => setNewOptionName(e.target.value)}
              placeholder="Option name (e.g., Size)"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addOption();
                }
              }}
            />
            <Button type="button" onClick={addOption} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Option
            </Button>
          </div>
        </div>
      </Card>

      {/* Variants Table */}
      {value.length > 0 && (
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Variants</h3>
                <p className="text-sm text-muted-foreground">
                  {value.length} variant{value.length !== 1 ? 's' : ''}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addManualVariant}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Manual Variant
              </Button>
            </div>

            <div className="border rounded-lg overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Variant</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Compare Price</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Inventory</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {value.map((variant, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Input
                          value={variant.title}
                          onChange={(e) =>
                            updateVariant(index, 'title', e.target.value)
                          }
                          className="min-w-[150px]"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={variant.price || ''}
                          onChange={(e) =>
                            updateVariant(
                              index,
                              'price',
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="min-w-[100px]"
                          placeholder="0.00"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={variant.compareAtPrice || ''}
                          onChange={(e) =>
                            updateVariant(
                              index,
                              'compareAtPrice',
                              e.target.value
                                ? parseFloat(e.target.value)
                                : undefined
                            )
                          }
                          className="min-w-[100px]"
                          placeholder="0.00"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={variant.sku || ''}
                          onChange={(e) =>
                            updateVariant(index, 'sku', e.target.value)
                          }
                          className="min-w-[120px]"
                          placeholder="SKU"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          value={variant.inventoryQty || ''}
                          onChange={(e) =>
                            updateVariant(
                              index,
                              'inventoryQty',
                              parseInt(e.target.value) || 0
                            )
                          }
                          className="min-w-[100px]"
                          placeholder="0"
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteVariant(index)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
