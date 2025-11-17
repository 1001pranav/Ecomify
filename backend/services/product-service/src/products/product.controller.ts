import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { BulkUpdateProductDto, BulkDeleteProductDto } from './dto/bulk-operations.dto';
import { ProductStatus } from '@prisma/client';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  /**
   * Create a new product
   * POST /api/v1/products
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createProductDto: CreateProductDto) {
    return this.productService.create(createProductDto);
  }

  /**
   * Get all products for a store
   * GET /api/v1/products?storeId=xxx&status=ACTIVE&page=1&limit=20
   */
  @Get()
  findAll(
    @Query('storeId') storeId: string,
    @Query('status') status?: ProductStatus,
    @Query('productType') productType?: string,
    @Query('tags') tags?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const filters: any = {};

    if (status) filters.status = status;
    if (productType) filters.productType = productType;
    if (tags) filters.tags = tags.split(',');
    if (search) filters.search = search;
    if (page) filters.page = parseInt(page, 10);
    if (limit) filters.limit = parseInt(limit, 10);

    return this.productService.findByStore(storeId, filters);
  }

  /**
   * Get product by ID
   * GET /api/v1/products/:id
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productService.findOne(id);
  }

  /**
   * Get product by handle
   * GET /api/v1/products/handle/:storeId/:handle
   */
  @Get('handle/:storeId/:handle')
  findByHandle(@Param('storeId') storeId: string, @Param('handle') handle: string) {
    return this.productService.findByHandle(storeId, handle);
  }

  /**
   * Update product
   * PATCH /api/v1/products/:id
   */
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productService.update(id, updateProductDto);
  }

  /**
   * Delete product
   * DELETE /api/v1/products/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string) {
    return this.productService.remove(id);
  }

  /**
   * Get product status counts
   * GET /api/v1/products/stats/status-counts?storeId=xxx
   */
  @Get('stats/status-counts')
  getStatusCounts(@Query('storeId') storeId: string) {
    return this.productService.getStatusCounts(storeId);
  }

  /**
   * Bulk update products
   * POST /api/v1/products/bulk/update
   */
  @Post('bulk/update')
  @HttpCode(HttpStatus.OK)
  bulkUpdate(@Body() bulkUpdateDto: BulkUpdateProductDto) {
    return this.productService.bulkUpdate(bulkUpdateDto);
  }

  /**
   * Bulk delete products
   * POST /api/v1/products/bulk/delete
   */
  @Post('bulk/delete')
  @HttpCode(HttpStatus.OK)
  bulkDelete(@Body() bulkDeleteDto: BulkDeleteProductDto) {
    return this.productService.bulkDelete(bulkDeleteDto);
  }

  /**
   * Get products by category
   * GET /api/v1/products/category/:categoryId
   */
  @Get('category/:categoryId')
  findByCategory(
    @Param('categoryId') categoryId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : undefined;
    const limitNum = limit ? parseInt(limit, 10) : undefined;
    return this.productService.findByCategory(categoryId, pageNum, limitNum);
  }

  /**
   * Get products by collection
   * GET /api/v1/products/collection/:collectionId
   */
  @Get('collection/:collectionId')
  findByCollection(
    @Param('collectionId') collectionId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : undefined;
    const limitNum = limit ? parseInt(limit, 10) : undefined;
    return this.productService.findByCollection(collectionId, pageNum, limitNum);
  }
}
