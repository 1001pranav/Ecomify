/**
 * Products Proxy Controller
 * Routes product-related requests to Product Service
 */

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Headers,
  Req,
  All,
} from '@nestjs/common';
import { ProductsProxyService } from './products-proxy.service';
import { Request } from 'express';

@Controller('api/v1')
export class ProductsProxyController {
  constructor(private readonly productsProxy: ProductsProxyService) {}

  /**
   * Products Endpoints
   */

  @Post('products')
  async createProduct(
    @Body() body: any,
    @Headers('authorization') authorization: string,
  ) {
    return this.productsProxy.forwardRequest('POST', '/products', null, body, authorization);
  }

  @Get('products')
  async getProducts(
    @Query() query: any,
    @Headers('authorization') authorization: string,
  ) {
    return this.productsProxy.forwardRequest('GET', '/products', query, null, authorization);
  }

  @Get('products/search')
  async searchProducts(
    @Query() query: any,
    @Headers('authorization') authorization: string,
  ) {
    return this.productsProxy.forwardRequest('GET', '/products/search', query, null, authorization);
  }

  @Get('products/stats/status-counts')
  async getStatusCounts(
    @Query() query: any,
    @Headers('authorization') authorization: string,
  ) {
    return this.productsProxy.forwardRequest('GET', '/products/stats/status-counts', query, null, authorization);
  }

  @Get('products/handle/:storeId/:handle')
  async getProductByHandle(
    @Param('storeId') storeId: string,
    @Param('handle') handle: string,
    @Headers('authorization') authorization: string,
  ) {
    return this.productsProxy.forwardRequest('GET', `/products/handle/${storeId}/${handle}`, null, null, authorization);
  }

  @Get('products/category/:categoryId')
  async getProductsByCategory(
    @Param('categoryId') categoryId: string,
    @Query() query: any,
    @Headers('authorization') authorization: string,
  ) {
    return this.productsProxy.forwardRequest('GET', `/products/category/${categoryId}`, query, null, authorization);
  }

  @Get('products/collection/:collectionId')
  async getProductsByCollection(
    @Param('collectionId') collectionId: string,
    @Query() query: any,
    @Headers('authorization') authorization: string,
  ) {
    return this.productsProxy.forwardRequest('GET', `/products/collection/${collectionId}`, query, null, authorization);
  }

  @Get('products/:id')
  async getProduct(
    @Param('id') id: string,
    @Headers('authorization') authorization: string,
  ) {
    return this.productsProxy.forwardRequest('GET', `/products/${id}`, null, null, authorization);
  }

  @Patch('products/:id')
  async updateProduct(
    @Param('id') id: string,
    @Body() body: any,
    @Headers('authorization') authorization: string,
  ) {
    return this.productsProxy.forwardRequest('PATCH', `/products/${id}`, null, body, authorization);
  }

  @Delete('products/:id')
  async deleteProduct(
    @Param('id') id: string,
    @Headers('authorization') authorization: string,
  ) {
    return this.productsProxy.forwardRequest('DELETE', `/products/${id}`, null, null, authorization);
  }

  /**
   * Bulk Operations Endpoints
   */

  @Post('products/bulk/update')
  async bulkUpdateProducts(
    @Body() body: any,
    @Headers('authorization') authorization: string,
  ) {
    return this.productsProxy.forwardRequest('POST', '/products/bulk/update', null, body, authorization);
  }

  @Post('products/bulk/delete')
  async bulkDeleteProducts(
    @Body() body: any,
    @Headers('authorization') authorization: string,
  ) {
    return this.productsProxy.forwardRequest('POST', '/products/bulk/delete', null, body, authorization);
  }

  @Post('products/bulk/import')
  async importProducts(
    @Body() body: any,
    @Headers('authorization') authorization: string,
  ) {
    return this.productsProxy.forwardRequest('POST', '/products/bulk/import', null, body, authorization);
  }

  @Get('products/bulk/export')
  async exportProducts(
    @Query() query: any,
    @Headers('authorization') authorization: string,
  ) {
    return this.productsProxy.forwardRequest('GET', '/products/bulk/export', query, null, authorization);
  }

  @Get('products/bulk/template')
  async getImportTemplate() {
    return this.productsProxy.forwardRequest('GET', '/products/bulk/template', null, null);
  }

  /**
   * Categories Endpoints
   */

  @Post('categories')
  async createCategory(
    @Body() body: any,
    @Headers('authorization') authorization: string,
  ) {
    return this.productsProxy.forwardRequest('POST', '/categories', null, body, authorization);
  }

  @Get('categories')
  async getCategories(
    @Query() query: any,
    @Headers('authorization') authorization: string,
  ) {
    return this.productsProxy.forwardRequest('GET', '/categories', query, null, authorization);
  }

  @Get('categories/tree')
  async getCategoryTree(
    @Query() query: any,
    @Headers('authorization') authorization: string,
  ) {
    return this.productsProxy.forwardRequest('GET', '/categories/tree', query, null, authorization);
  }

  @Get('categories/slug/:storeId/:slug')
  async getCategoryBySlug(
    @Param('storeId') storeId: string,
    @Param('slug') slug: string,
    @Headers('authorization') authorization: string,
  ) {
    return this.productsProxy.forwardRequest('GET', `/categories/slug/${storeId}/${slug}`, null, null, authorization);
  }

  @Get('categories/:id')
  async getCategory(
    @Param('id') id: string,
    @Headers('authorization') authorization: string,
  ) {
    return this.productsProxy.forwardRequest('GET', `/categories/${id}`, null, null, authorization);
  }

  @Get('categories/:id/path')
  async getCategoryPath(
    @Param('id') id: string,
    @Headers('authorization') authorization: string,
  ) {
    return this.productsProxy.forwardRequest('GET', `/categories/${id}/path`, null, null, authorization);
  }

  @Patch('categories/:id')
  async updateCategory(
    @Param('id') id: string,
    @Body() body: any,
    @Headers('authorization') authorization: string,
  ) {
    return this.productsProxy.forwardRequest('PATCH', `/categories/${id}`, null, body, authorization);
  }

  @Delete('categories/:id')
  async deleteCategory(
    @Param('id') id: string,
    @Headers('authorization') authorization: string,
  ) {
    return this.productsProxy.forwardRequest('DELETE', `/categories/${id}`, null, null, authorization);
  }

  @Post('categories/:categoryId/products/:productId')
  async addProductToCategory(
    @Param('categoryId') categoryId: string,
    @Param('productId') productId: string,
    @Body() body: any,
    @Headers('authorization') authorization: string,
  ) {
    return this.productsProxy.forwardRequest('POST', `/categories/${categoryId}/products/${productId}`, null, body, authorization);
  }

  @Delete('categories/:categoryId/products/:productId')
  async removeProductFromCategory(
    @Param('categoryId') categoryId: string,
    @Param('productId') productId: string,
    @Headers('authorization') authorization: string,
  ) {
    return this.productsProxy.forwardRequest('DELETE', `/categories/${categoryId}/products/${productId}`, null, null, authorization);
  }

  /**
   * Collections Endpoints
   */

  @Post('collections')
  async createCollection(
    @Body() body: any,
    @Headers('authorization') authorization: string,
  ) {
    return this.productsProxy.forwardRequest('POST', '/collections', null, body, authorization);
  }

  @Get('collections')
  async getCollections(
    @Query() query: any,
    @Headers('authorization') authorization: string,
  ) {
    return this.productsProxy.forwardRequest('GET', '/collections', query, null, authorization);
  }

  @Get('collections/handle/:storeId/:handle')
  async getCollectionByHandle(
    @Param('storeId') storeId: string,
    @Param('handle') handle: string,
    @Headers('authorization') authorization: string,
  ) {
    return this.productsProxy.forwardRequest('GET', `/collections/handle/${storeId}/${handle}`, null, null, authorization);
  }

  @Get('collections/:id')
  async getCollection(
    @Param('id') id: string,
    @Headers('authorization') authorization: string,
  ) {
    return this.productsProxy.forwardRequest('GET', `/collections/${id}`, null, null, authorization);
  }

  @Patch('collections/:id')
  async updateCollection(
    @Param('id') id: string,
    @Body() body: any,
    @Headers('authorization') authorization: string,
  ) {
    return this.productsProxy.forwardRequest('PATCH', `/collections/${id}`, null, body, authorization);
  }

  @Delete('collections/:id')
  async deleteCollection(
    @Param('id') id: string,
    @Headers('authorization') authorization: string,
  ) {
    return this.productsProxy.forwardRequest('DELETE', `/collections/${id}`, null, null, authorization);
  }

  @Post('collections/:collectionId/products/:productId')
  async addProductToCollection(
    @Param('collectionId') collectionId: string,
    @Param('productId') productId: string,
    @Body() body: any,
    @Headers('authorization') authorization: string,
  ) {
    return this.productsProxy.forwardRequest('POST', `/collections/${collectionId}/products/${productId}`, null, body, authorization);
  }

  @Delete('collections/:collectionId/products/:productId')
  async removeProductFromCollection(
    @Param('collectionId') collectionId: string,
    @Param('productId') productId: string,
    @Headers('authorization') authorization: string,
  ) {
    return this.productsProxy.forwardRequest('DELETE', `/collections/${collectionId}/products/${productId}`, null, null, authorization);
  }

  @Patch('collections/:collectionId/products/:productId/position')
  async updateProductPositionInCollection(
    @Param('collectionId') collectionId: string,
    @Param('productId') productId: string,
    @Body() body: any,
    @Headers('authorization') authorization: string,
  ) {
    return this.productsProxy.forwardRequest('PATCH', `/collections/${collectionId}/products/${productId}/position`, null, body, authorization);
  }

  @Post('collections/:id/refresh')
  async refreshAutomatedCollection(
    @Param('id') id: string,
    @Headers('authorization') authorization: string,
  ) {
    return this.productsProxy.forwardRequest('POST', `/collections/${id}/refresh`, null, null, authorization);
  }

  @Post('collections/refresh-all')
  async refreshAllAutomatedCollections(
    @Query() query: any,
    @Headers('authorization') authorization: string,
  ) {
    return this.productsProxy.forwardRequest('POST', '/collections/refresh-all', query, null, authorization);
  }
}
