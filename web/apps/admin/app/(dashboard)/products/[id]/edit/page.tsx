import { ProductForm } from '@/features/products';

/**
 * Edit Product Page
 *
 * Page for editing an existing product.
 * Uses the ProductForm component with a productId from route params.
 */

interface EditProductPageProps {
  params: {
    id: string;
  };
}

export default function EditProductPage({ params }: EditProductPageProps) {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Product</h1>
        <p className="text-muted-foreground">
          Update product information and settings
        </p>
      </div>

      {/* Product Form */}
      <ProductForm productId={params.id} />
    </div>
  );
}
