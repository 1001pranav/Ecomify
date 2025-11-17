import { Injectable } from '@nestjs/common';
import { parse } from 'csv-parse/sync';
import { ProductBuilderFactory } from '../product.builder';
import { ProductRepository } from '../product.repository';
import { EventPublisherService } from '../../events/event-publisher.service';

/**
 * Command Pattern - CSV Import Command
 * Encapsulates the CSV import operation as a command object
 */
@Injectable()
export class CSVImportCommand {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly eventPublisher: EventPublisherService,
  ) {}

  /**
   * Execute CSV import
   */
  async execute(storeId: string, csvContent: string): Promise<{
    success: number;
    failed: number;
    errors: Array<{ row: number; error: string }>;
  }> {
    const results = {
      success: 0,
      failed: 0,
      errors: [] as Array<{ row: number; error: string }>,
    };

    try {
      // Parse CSV
      const records = parse(csvContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });

      // Process each record
      for (let i = 0; i < records.length; i++) {
        const record = records[i];
        try {
          await this.importProduct(storeId, record);
          results.success++;
        } catch (error: any) {
          results.failed++;
          results.errors.push({
            row: i + 2, // +2 because: +1 for header, +1 for 0-index
            error: error.message,
          });
        }
      }

      return results;
    } catch (error: any) {
      throw new Error(`Failed to parse CSV: ${error.message}`);
    }
  }

  /**
   * Import a single product from CSV record
   */
  private async importProduct(storeId: string, record: any) {
    // Use Builder Factory to create product from CSV
    const builder = ProductBuilderFactory.createFromCSV(storeId, record);

    // Check if product already exists by handle
    const handle = record.handle || record.title;
    const existing = await this.productRepository.findByHandle(storeId, handle);

    if (existing) {
      // Update existing product
      await this.productRepository.update(existing.id, {
        title: record.title,
        description: record.description,
        vendor: record.vendor,
        productType: record.productType,
      });

      await this.eventPublisher.publishProductUpdated(existing);
    } else {
      // Create new product
      const productData = builder.build();
      const product = await this.productRepository.createWithRelations(productData);

      await this.eventPublisher.publishProductCreated(product);
    }
  }

  /**
   * Get CSV template
   */
  getTemplate(): string {
    return [
      'title,description,handle,vendor,productType,tags,price,sku,barcode,inventoryQty,variantTitle',
      'Example Product,Product description,example-product,Vendor Name,Clothing,"tag1,tag2",29.99,SKU123,123456789,100,Default',
    ].join('\n');
  }
}
