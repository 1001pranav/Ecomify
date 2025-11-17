import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';

@Controller('products/search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  /**
   * Search products
   * GET /api/v1/products/search?storeId=xxx&q=shirt&priceMin=10&priceMax=100
   */
  @Get()
  search(
    @Query('storeId') storeId: string,
    @Query('q') query?: string,
    @Query('priceMin') priceMin?: string,
    @Query('priceMax') priceMax?: string,
    @Query('tags') tags?: string,
    @Query('productType') productType?: string,
    @Query('vendor') vendor?: string,
    @Query('inStock') inStock?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sort') sort?: string,
  ) {
    return this.searchService.searchProducts({
      storeId,
      query,
      priceMin: priceMin ? parseFloat(priceMin) : undefined,
      priceMax: priceMax ? parseFloat(priceMax) : undefined,
      tags: tags ? tags.split(',') : undefined,
      productType,
      vendor,
      inStock: inStock === 'true' ? true : inStock === 'false' ? false : undefined,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
      sort,
    });
  }
}
