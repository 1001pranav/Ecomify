import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from './elasticsearch.service';

/**
 * Search Service - Facade for search operations
 * Abstracts search implementation details
 */
@Injectable()
export class SearchService {
  constructor(private readonly elasticsearch: ElasticsearchService) {}

  /**
   * Search products with filters
   */
  async searchProducts(params: {
    storeId: string;
    query?: string;
    priceMin?: number;
    priceMax?: number;
    tags?: string[];
    productType?: string;
    vendor?: string;
    inStock?: boolean;
    page?: number;
    limit?: number;
    sort?: string;
  }) {
    return this.elasticsearch.search({
      storeId: params.storeId,
      query: params.query,
      filters: {
        priceMin: params.priceMin,
        priceMax: params.priceMax,
        tags: params.tags,
        productType: params.productType,
        vendor: params.vendor,
        inStock: params.inStock,
      },
      page: params.page,
      limit: params.limit,
      sort: params.sort,
    });
  }

  /**
   * Index a product
   */
  async indexProduct(product: any) {
    return this.elasticsearch.indexProduct(product);
  }

  /**
   * Update indexed product
   */
  async updateProduct(product: any) {
    return this.elasticsearch.updateProduct(product);
  }

  /**
   * Delete product from index
   */
  async deleteProduct(productId: string) {
    return this.elasticsearch.deleteProduct(productId);
  }

  /**
   * Bulk index products
   */
  async bulkIndexProducts(products: any[]) {
    return this.elasticsearch.bulkIndex(products);
  }
}
