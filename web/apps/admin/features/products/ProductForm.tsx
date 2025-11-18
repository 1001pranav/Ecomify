'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Button,
  Input,
  Label,
  Textarea,
  Card,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@ecomify/ui';
import { useToast } from '@ecomify/ui';
import {
  useProduct,
  useCreateProduct,
  useUpdateProduct,
  useCategories,
} from '@ecomify/api-client';
import type {
  ProductFormValues,
  ProductVariantInput,
  ProductOption,
  Status,
} from '@ecomify/types';
import { ImageUpload } from './ImageUpload';
import { VariantBuilder } from './VariantBuilder';
import { X } from 'lucide-react';

/**
 * ProductForm Component
 *
 * Main form component for creating and editing products.
 * Features Builder Pattern for form construction.
 *
 * Features:
 * - Create new product or edit existing product
 * - Form validation with Zod
 * - Image upload and management
 * - Variant builder with options
 * - Category selection
 * - Tag management
 * - Status selection
 * - Responsive grid layout (2/3 main, 1/3 sidebar)
 * - Fixed bottom action bar
 * - Toast notifications
 */

interface ProductFormProps {
  productId?: string;
}

// Zod validation schema
const productSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  status: z.enum(['draft', 'active', 'archived']),
  variants: z
    .array(
      z.object({
        title: z.string().min(1, 'Variant title is required'),
        price: z.number().positive('Price must be greater than 0'),
        compareAtPrice: z.number().positive().optional(),
        cost: z.number().positive().optional(),
        sku: z.string().optional(),
        barcode: z.string().optional(),
        inventoryQty: z.number().min(0, 'Inventory cannot be negative'),
        inventoryPolicy: z.enum(['deny', 'continue']),
        weight: z.number().positive().optional(),
        weightUnit: z.enum(['kg', 'lb', 'oz', 'g']).optional(),
        options: z.record(z.string()),
      })
    )
    .min(1, 'At least one variant is required'),
  images: z.array(
    z.object({
      id: z.string(),
      url: z.string().url(),
      altText: z.string().optional(),
      width: z.number().optional(),
      height: z.number().optional(),
    })
  ),
  categoryId: z.string().optional(),
  tags: z.array(z.string()),
  vendor: z.string().optional(),
  productType: z.string().optional(),
  options: z.array(
    z.object({
      name: z.string(),
      values: z.array(z.string()),
    })
  ),
});

type ProductFormData = z.infer<typeof productSchema>;

export function ProductForm({ productId }: ProductFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [tagInput, setTagInput] = useState('');
  const [options, setOptions] = useState<ProductOption[]>([]);

  // Fetch product if editing
  const { data: product, isLoading: isLoadingProduct } = useProduct(productId);

  // Fetch categories
  const { data: categoriesData } = useCategories();
  const categories = categoriesData || [];

  // Mutations
  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();

  // Form setup
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: '',
      description: '',
      status: 'draft',
      variants: [],
      images: [],
      categoryId: undefined,
      tags: [],
      vendor: '',
      productType: '',
      options: [],
    },
  });

  const watchedTags = watch('tags');
  const watchedStatus = watch('status');

  // Load product data when editing
  useEffect(() => {
    if (product) {
      reset({
        title: product.title,
        description: product.description || '',
        status: product.status,
        variants: product.variants.map((v) => ({
          title: v.title,
          price: v.price,
          compareAtPrice: v.compareAtPrice,
          cost: v.cost,
          sku: v.sku || '',
          barcode: v.barcode || '',
          inventoryQty: v.inventoryQty,
          inventoryPolicy: v.inventoryPolicy,
          weight: v.weight,
          weightUnit: v.weightUnit,
          options: v.options,
        })),
        images: product.images,
        categoryId: product.categoryId,
        tags: product.tags,
        vendor: product.vendor || '',
        productType: product.productType || '',
        options: extractOptionsFromVariants(product.variants),
      });

      // Set options state
      setOptions(extractOptionsFromVariants(product.variants));
    }
  }, [product, reset]);

  // Extract options from variants (for edit mode)
  const extractOptionsFromVariants = (
    variants: any[]
  ): ProductOption[] => {
    if (variants.length === 0) return [];

    const optionsMap = new Map<string, Set<string>>();

    variants.forEach((variant) => {
      Object.entries(variant.options || {}).forEach(([key, value]) => {
        if (!optionsMap.has(key)) {
          optionsMap.set(key, new Set());
        }
        optionsMap.get(key)?.add(value as string);
      });
    });

    return Array.from(optionsMap.entries()).map(([name, values]) => ({
      name,
      values: Array.from(values),
    }));
  };

  // Handle form submission
  const onSubmit = async (data: ProductFormData) => {
    try {
      if (productId) {
        // Update existing product
        await updateProductMutation.mutateAsync({
          id: productId,
          data,
        });

        toast({
          title: 'Product updated',
          description: 'Your product has been updated successfully.',
        });
      } else {
        // Create new product
        await createProductMutation.mutateAsync(data);

        toast({
          title: 'Product created',
          description: 'Your product has been created successfully.',
        });
      }

      router.push('/dashboard/products');
    } catch (error: any) {
      toast({
        title: 'Error',
        description:
          error?.response?.data?.message || 'Failed to save product. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Tag management
  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !watchedTags.includes(tag)) {
      setValue('tags', [...watchedTags, tag]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setValue(
      'tags',
      watchedTags.filter((tag) => tag !== tagToRemove)
    );
  };

  // Handle cancel
  const handleCancel = () => {
    router.push('/dashboard/products');
  };

  if (isLoadingProduct) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading product...</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="pb-24">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          {/* Product Details */}
          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold">Product Details</h2>
              </div>

              <div>
                <Label htmlFor="title">
                  Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  {...register('title')}
                  placeholder="Product title"
                />
                {errors.title && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.title.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  placeholder="Product description"
                  rows={5}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="vendor">Vendor</Label>
                  <Input
                    id="vendor"
                    {...register('vendor')}
                    placeholder="Brand or vendor"
                  />
                </div>

                <div>
                  <Label htmlFor="productType">Product Type</Label>
                  <Input
                    id="productType"
                    {...register('productType')}
                    placeholder="e.g., Clothing, Electronics"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Images */}
          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold">Product Images</h2>
                <p className="text-sm text-muted-foreground">
                  Add images to showcase your product
                </p>
              </div>

              <Controller
                name="images"
                control={control}
                render={({ field }) => (
                  <ImageUpload
                    value={field.value}
                    onChange={field.onChange}
                    maxFiles={10}
                  />
                )}
              />
              {errors.images && (
                <p className="text-sm text-destructive">
                  {errors.images.message}
                </p>
              )}
            </div>
          </Card>

          {/* Variants */}
          <div>
            <Controller
              name="variants"
              control={control}
              render={({ field }) => (
                <VariantBuilder
                  value={field.value}
                  onChange={field.onChange}
                  options={options}
                  onOptionsChange={(newOptions) => {
                    setOptions(newOptions);
                    setValue('options', newOptions);
                  }}
                />
              )}
            />
            {errors.variants && (
              <p className="text-sm text-destructive mt-2">
                {errors.variants.message}
              </p>
            )}
          </div>
        </div>

        {/* Sidebar - 1/3 width */}
        <div className="space-y-6">
          {/* Status */}
          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold">Status</h2>
              </div>

              <div>
                <Label htmlFor="status">Product Status</Label>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>
          </Card>

          {/* Category */}
          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold">Category</h2>
              </div>

              <div>
                <Label htmlFor="category">Product Category</Label>
                <Controller
                  name="categoryId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value || ''}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>
          </Card>

          {/* Tags */}
          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold">Tags</h2>
                <p className="text-sm text-muted-foreground">
                  Add tags to help organize your products
                </p>
              </div>

              <div>
                <div className="flex gap-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Add a tag"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                  />
                  <Button type="button" onClick={addTag} variant="outline">
                    Add
                  </Button>
                </div>

                {watchedTags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {watchedTags.map((tag) => (
                      <div
                        key={tag}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-accent rounded-full text-sm"
                      >
                        <span>{tag}</span>
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Fixed Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? 'Saving...'
                : productId
                ? 'Update Product'
                : 'Create Product'}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
