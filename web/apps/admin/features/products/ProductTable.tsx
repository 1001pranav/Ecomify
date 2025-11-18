'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@ecomify/ui';
import { useDeleteProduct } from '@ecomify/api-client';
import type { Product, Status } from '@ecomify/types';
import { Edit, Trash2 } from 'lucide-react';
import { useToast } from '@ecomify/ui';

/**
 * ProductTable Component
 *
 * Displays products in a table format with columns:
 * - Image
 * - Title
 * - Status
 * - Price
 * - Inventory
 * - Actions (Edit/Delete)
 *
 * Includes delete confirmation dialog and loading skeleton.
 */

interface ProductTableProps {
  products: Product[];
  isLoading: boolean;
}

export function ProductTable({ products, isLoading }: ProductTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const deleteProduct = useDeleteProduct();
  const { toast } = useToast();

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;

    try {
      await deleteProduct.mutateAsync(productToDelete.id);
      toast({
        title: 'Product deleted',
        description: `${productToDelete.title} has been deleted successfully.`,
      });
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete product. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: Status) => {
    const variants: Record<Status, 'default' | 'secondary' | 'outline'> = {
      active: 'default',
      draft: 'secondary',
      archived: 'outline',
    };

    return (
      <Badge variant={variants[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const getTotalInventory = (product: Product) => {
    return product.variants.reduce((sum, variant) => sum + variant.inventoryQty, 0);
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Image</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Inventory</TableHead>
              <TableHead className="w-[120px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <div className="h-12 w-12 bg-muted animate-pulse rounded" />
                </TableCell>
                <TableCell>
                  <div className="h-4 w-48 bg-muted animate-pulse rounded" />
                </TableCell>
                <TableCell>
                  <div className="h-6 w-16 bg-muted animate-pulse rounded-full" />
                </TableCell>
                <TableCell>
                  <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                </TableCell>
                <TableCell>
                  <div className="h-4 w-12 bg-muted animate-pulse rounded" />
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <div className="h-9 w-9 bg-muted animate-pulse rounded" />
                    <div className="h-9 w-9 bg-muted animate-pulse rounded" />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  // Empty state
  if (products.length === 0) {
    return (
      <div className="rounded-md border">
        <div className="p-12 text-center">
          <p className="text-muted-foreground">
            No products found. Try adjusting your filters or create a new product.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Image</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Inventory</TableHead>
              <TableHead className="w-[120px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => {
              const primaryImage = product.images[0];
              const lowestPrice = Math.min(...product.variants.map((v) => v.price));

              return (
                <TableRow key={product.id}>
                  <TableCell>
                    {primaryImage ? (
                      <div className="relative h-12 w-12 rounded overflow-hidden bg-muted">
                        <Image
                          src={primaryImage.url}
                          alt={primaryImage.altText || product.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-12 w-12 rounded bg-muted flex items-center justify-center">
                        <span className="text-xs text-muted-foreground">No image</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">
                    <Link
                      href={`/dashboard/products/${product.id}/edit`}
                      className="hover:underline"
                    >
                      {product.title}
                    </Link>
                  </TableCell>
                  <TableCell>{getStatusBadge(product.status)}</TableCell>
                  <TableCell>{formatPrice(lowestPrice)}</TableCell>
                  <TableCell>
                    <span
                      className={
                        getTotalInventory(product) === 0
                          ? 'text-destructive font-medium'
                          : ''
                      }
                    >
                      {getTotalInventory(product)} in stock
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        asChild
                        title="Edit product"
                      >
                        <Link href={`/dashboard/products/${product.id}/edit`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteClick(product)}
                        title="Delete product"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{productToDelete?.title}"? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleteProduct.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteProduct.isPending}
            >
              {deleteProduct.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
