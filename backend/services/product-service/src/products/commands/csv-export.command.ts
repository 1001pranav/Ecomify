import { Injectable } from '@nestjs/common';
import { stringify } from 'csv-stringify/sync';
import { ProductRepository } from '../product.repository';

/**
 * Command Pattern - CSV Export Command
 * Encapsulates the CSV export operation as a command object
 */
@Injectable()
export class CSVExportCommand {
  constructor(private readonly productRepository: ProductRepository) {}

  /**
   * Execute CSV export
   */
  async execute(storeId: string, productIds?: string[]): Promise<string> {
    // Fetch products
    let products: any[];

    if (productIds && productIds.length > 0) {
      // Export specific products
      products = await Promise.all(
        productIds.map((id) => this.productRepository.findByIdWithRelations(id)),
      );
      products = products.filter((p) => p !== null && p.storeId === storeId);
    } else {
      // Export all products for the store
      products = await this.productRepository.findByStore(storeId, {}, undefined, {
        createdAt: 'asc',
      });
    }

    // Transform products to CSV records
    const records = this.transformProductsToRecords(products);

    // Generate CSV
    const csv = stringify(records, {
      header: true,
      columns: [
        { key: 'id', header: 'Product ID' },
        { key: 'title', header: 'Title' },
        { key: 'description', header: 'Description' },
        { key: 'handle', header: 'Handle' },
        { key: 'vendor', header: 'Vendor' },
        { key: 'productType', header: 'Product Type' },
        { key: 'tags', header: 'Tags' },
        { key: 'status', header: 'Status' },
        { key: 'variantId', header: 'Variant ID' },
        { key: 'variantTitle', header: 'Variant Title' },
        { key: 'sku', header: 'SKU' },
        { key: 'barcode', header: 'Barcode' },
        { key: 'price', header: 'Price' },
        { key: 'compareAtPrice', header: 'Compare At Price' },
        { key: 'costPrice', header: 'Cost Price' },
        { key: 'inventoryQty', header: 'Inventory Qty' },
        { key: 'weight', header: 'Weight' },
        { key: 'weightUnit', header: 'Weight Unit' },
        { key: 'imageUrl', header: 'Image URL' },
      ],
    });

    return csv;
  }

  /**
   * Transform products to CSV records
   * Each variant becomes a separate row
   */
  private transformProductsToRecords(products: any[]): any[] {
    const records: any[] = [];

    for (const product of products) {
      const baseRecord = {
        id: product.id,
        title: product.title,
        description: product.description || '',
        handle: product.handle,
        vendor: product.vendor || '',
        productType: product.productType || '',
        tags: product.tags ? product.tags.join(',') : '',
        status: product.status,
      };

      // If product has variants, create a row for each variant
      if (product.variants && product.variants.length > 0) {
        for (const variant of product.variants) {
          records.push({
            ...baseRecord,
            variantId: variant.id,
            variantTitle: variant.title,
            sku: variant.sku || '',
            barcode: variant.barcode || '',
            price: variant.price,
            compareAtPrice: variant.compareAtPrice || '',
            costPrice: variant.costPrice || '',
            inventoryQty: variant.inventoryQty,
            weight: variant.weight || '',
            weightUnit: variant.weightUnit || 'kg',
            imageUrl: variant.imageUrl || (product.images?.[0]?.url || ''),
          });
        }
      } else {
        // Product without variants
        records.push({
          ...baseRecord,
          variantId: '',
          variantTitle: '',
          sku: '',
          barcode: '',
          price: '',
          compareAtPrice: '',
          costPrice: '',
          inventoryQty: '',
          weight: '',
          weightUnit: '',
          imageUrl: product.images?.[0]?.url || '',
        });
      }
    }

    return records;
  }
}
