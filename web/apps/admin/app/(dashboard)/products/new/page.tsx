import { ProductForm } from '@/features/products';

/**
 * New Product Page
 *
 * Page for creating a new product.
 * Uses the ProductForm component without a productId.
 */

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create Product</h1>
        <p className="text-muted-foreground">
          Add a new product to your catalog
        </p>
      </div>

      {/* Product Form */}
      <ProductForm />
    </div>
  );
}
