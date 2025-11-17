import { Injectable, OnModuleInit } from '@nestjs/common';
import { Client } from '@elastic/elasticsearch';

/**
 * Strategy Pattern - Elasticsearch implementation of search strategy
 * Can be swapped with other search implementations (Algolia, Typesense, etc.)
 */
@Injectable()
export class ElasticsearchService implements OnModuleInit {
  private client: Client | null = null;
  private readonly indexName = 'products';

  async onModuleInit() {
    try {
      await this.connect();
      await this.createIndex();
    } catch (error) {
      console.error('Failed to initialize Elasticsearch:', error);
      // Service can still function without search
    }
  }

  private async connect() {
    const node = process.env.ELASTICSEARCH_NODE || 'http://localhost:9200';

    this.client = new Client({
      node,
      auth:
        process.env.ELASTICSEARCH_USERNAME && process.env.ELASTICSEARCH_PASSWORD
          ? {
              username: process.env.ELASTICSEARCH_USERNAME,
              password: process.env.ELASTICSEARCH_PASSWORD,
            }
          : undefined,
    });

    // Test connection
    await this.client.ping();
    console.log('🔍 Elasticsearch connected successfully');
  }

  private async createIndex() {
    if (!this.client) return;

    const exists = await this.client.indices.exists({ index: this.indexName });

    if (!exists) {
      await this.client.indices.create({
        index: this.indexName,
        body: {
          settings: {
            number_of_shards: 1,
            number_of_replicas: 1,
            analysis: {
              analyzer: {
                product_analyzer: {
                  type: 'custom',
                  tokenizer: 'standard',
                  filter: ['lowercase', 'asciifolding'],
                },
              },
            },
          },
          mappings: {
            properties: {
              id: { type: 'keyword' },
              storeId: { type: 'keyword' },
              title: {
                type: 'text',
                analyzer: 'product_analyzer',
                fields: {
                  keyword: { type: 'keyword' },
                },
              },
              description: {
                type: 'text',
                analyzer: 'product_analyzer',
              },
              handle: { type: 'keyword' },
              vendor: {
                type: 'text',
                fields: {
                  keyword: { type: 'keyword' },
                },
              },
              productType: {
                type: 'text',
                fields: {
                  keyword: { type: 'keyword' },
                },
              },
              tags: { type: 'keyword' },
              status: { type: 'keyword' },
              price: { type: 'float' },
              compareAtPrice: { type: 'float' },
              inStock: { type: 'boolean' },
              inventoryQty: { type: 'integer' },
              images: {
                type: 'nested',
                properties: {
                  url: { type: 'keyword' },
                  altText: { type: 'text' },
                },
              },
              variants: {
                type: 'nested',
                properties: {
                  id: { type: 'keyword' },
                  title: { type: 'text' },
                  price: { type: 'float' },
                  sku: { type: 'keyword' },
                  inventoryQty: { type: 'integer' },
                },
              },
              createdAt: { type: 'date' },
              updatedAt: { type: 'date' },
              publishedAt: { type: 'date' },
            },
          },
        },
      });

      console.log('🔍 Elasticsearch index created');
    }
  }

  /**
   * Index a product
   */
  async indexProduct(product: any): Promise<boolean> {
    if (!this.client) {
      console.warn('Elasticsearch not available, skipping indexing');
      return false;
    }

    try {
      // Transform product for indexing
      const doc = this.transformProductForIndexing(product);

      await this.client.index({
        index: this.indexName,
        id: product.id,
        document: doc,
      });

      console.log(`🔍 Product indexed: ${product.id}`);
      return true;
    } catch (error) {
      console.error(`Failed to index product ${product.id}:`, error);
      return false;
    }
  }

  /**
   * Update indexed product
   */
  async updateProduct(product: any): Promise<boolean> {
    return this.indexProduct(product);
  }

  /**
   * Delete product from index
   */
  async deleteProduct(productId: string): Promise<boolean> {
    if (!this.client) return false;

    try {
      await this.client.delete({
        index: this.indexName,
        id: productId,
      });

      console.log(`🔍 Product removed from index: ${productId}`);
      return true;
    } catch (error) {
      console.error(`Failed to delete product ${productId}:`, error);
      return false;
    }
  }

  /**
   * Search products
   */
  async search(params: {
    storeId: string;
    query?: string;
    filters?: {
      priceMin?: number;
      priceMax?: number;
      tags?: string[];
      productType?: string;
      vendor?: string;
      inStock?: boolean;
    };
    page?: number;
    limit?: number;
    sort?: string;
  }) {
    if (!this.client) {
      throw new Error('Elasticsearch not available');
    }

    const { storeId, query, filters = {}, page = 1, limit = 20, sort } = params;
    const from = (page - 1) * limit;

    // Build query
    const must: any[] = [{ term: { storeId } }];

    if (query) {
      must.push({
        multi_match: {
          query,
          fields: ['title^3', 'description', 'vendor', 'tags'],
          type: 'best_fields',
          fuzziness: 'AUTO',
        },
      });
    }

    // Build filters
    const filter: any[] = [];

    if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
      filter.push({
        range: {
          price: {
            gte: filters.priceMin,
            lte: filters.priceMax,
          },
        },
      });
    }

    if (filters.tags && filters.tags.length > 0) {
      filter.push({
        terms: { tags: filters.tags },
      });
    }

    if (filters.productType) {
      filter.push({
        term: { 'productType.keyword': filters.productType },
      });
    }

    if (filters.vendor) {
      filter.push({
        term: { 'vendor.keyword': filters.vendor },
      });
    }

    if (filters.inStock !== undefined) {
      filter.push({
        term: { inStock: filters.inStock },
      });
    }

    // Build sort
    const sortConfig: any[] = [];
    if (sort === 'price_asc') {
      sortConfig.push({ price: 'asc' });
    } else if (sort === 'price_desc') {
      sortConfig.push({ price: 'desc' });
    } else if (sort === 'title_asc') {
      sortConfig.push({ 'title.keyword': 'asc' });
    } else if (sort === 'created_desc') {
      sortConfig.push({ createdAt: 'desc' });
    } else if (query) {
      sortConfig.push({ _score: 'desc' });
    }

    // Execute search
    const result = await this.client.search({
      index: this.indexName,
      body: {
        query: {
          bool: {
            must,
            filter,
          },
        },
        from,
        size: limit,
        sort: sortConfig.length > 0 ? sortConfig : undefined,
        aggs: {
          tags: {
            terms: { field: 'tags', size: 50 },
          },
          productTypes: {
            terms: { field: 'productType.keyword', size: 50 },
          },
          vendors: {
            terms: { field: 'vendor.keyword', size: 50 },
          },
          priceRanges: {
            range: {
              field: 'price',
              ranges: [
                { key: '0-25', to: 25 },
                { key: '25-50', from: 25, to: 50 },
                { key: '50-100', from: 50, to: 100 },
                { key: '100-200', from: 100, to: 200 },
                { key: '200+', from: 200 },
              ],
            },
          },
        },
      },
    });

    // Transform results
    const hits = result.hits.hits.map((hit: any) => ({
      ...hit._source,
      score: hit._score,
    }));

    const facets = {
      tags: result.aggregations?.tags.buckets.map((b: any) => ({
        value: b.key,
        count: b.doc_count,
      })),
      productTypes: result.aggregations?.productTypes.buckets.map((b: any) => ({
        value: b.key,
        count: b.doc_count,
      })),
      vendors: result.aggregations?.vendors.buckets.map((b: any) => ({
        value: b.key,
        count: b.doc_count,
      })),
      priceRanges: result.aggregations?.priceRanges.buckets.map((b: any) => ({
        range: b.key,
        count: b.doc_count,
      })),
    };

    return {
      products: hits,
      total: result.hits.total.value,
      page,
      limit,
      totalPages: Math.ceil(result.hits.total.value / limit),
      facets,
    };
  }

  /**
   * Transform product for indexing
   */
  private transformProductForIndexing(product: any) {
    const firstVariant = product.variants?.[0];

    return {
      id: product.id,
      storeId: product.storeId,
      title: product.title,
      description: product.description,
      handle: product.handle,
      vendor: product.vendor,
      productType: product.productType,
      tags: product.tags || [],
      status: product.status,
      price: firstVariant?.price || 0,
      compareAtPrice: firstVariant?.compareAtPrice,
      inStock: firstVariant ? firstVariant.inventoryQty > 0 : false,
      inventoryQty: firstVariant?.inventoryQty || 0,
      images: product.images?.map((img: any) => ({
        url: img.url,
        altText: img.altText,
      })),
      variants: product.variants?.map((v: any) => ({
        id: v.id,
        title: v.title,
        price: v.price,
        sku: v.sku,
        inventoryQty: v.inventoryQty,
      })),
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      publishedAt: product.publishedAt,
    };
  }

  /**
   * Bulk index products
   */
  async bulkIndex(products: any[]): Promise<boolean> {
    if (!this.client || products.length === 0) return false;

    try {
      const operations = products.flatMap((product) => [
        { index: { _index: this.indexName, _id: product.id } },
        this.transformProductForIndexing(product),
      ]);

      await this.client.bulk({
        operations,
        refresh: true,
      });

      console.log(`🔍 Bulk indexed ${products.length} products`);
      return true;
    } catch (error) {
      console.error('Failed to bulk index products:', error);
      return false;
    }
  }
}
