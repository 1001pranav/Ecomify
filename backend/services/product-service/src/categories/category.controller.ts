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
import { CategoryService } from './category.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  /**
   * Create a new category
   * POST /api/v1/categories
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.create(createCategoryDto);
  }

  /**
   * Get all categories for a store
   * GET /api/v1/categories?storeId=xxx&includeProducts=true
   */
  @Get()
  findAll(
    @Query('storeId') storeId: string,
    @Query('includeProducts') includeProducts?: string,
  ) {
    return this.categoryService.findByStore(storeId, includeProducts === 'true');
  }

  /**
   * Get root categories (tree structure)
   * GET /api/v1/categories/tree?storeId=xxx
   */
  @Get('tree')
  getRootCategories(@Query('storeId') storeId: string) {
    return this.categoryService.findRootCategories(storeId);
  }

  /**
   * Get category by ID
   * GET /api/v1/categories/:id
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoryService.findOne(id);
  }

  /**
   * Get category by slug
   * GET /api/v1/categories/slug/:storeId/:slug
   */
  @Get('slug/:storeId/:slug')
  findBySlug(@Param('storeId') storeId: string, @Param('slug') slug: string) {
    return this.categoryService.findBySlug(storeId, slug);
  }

  /**
   * Get category breadcrumb path
   * GET /api/v1/categories/:id/path
   */
  @Get(':id/path')
  getCategoryPath(@Param('id') id: string) {
    return this.categoryService.getCategoryPath(id);
  }

  /**
   * Update category
   * PATCH /api/v1/categories/:id
   */
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
    return this.categoryService.update(id, updateCategoryDto);
  }

  /**
   * Delete category
   * DELETE /api/v1/categories/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string) {
    return this.categoryService.remove(id);
  }

  /**
   * Add product to category
   * POST /api/v1/categories/:categoryId/products/:productId
   */
  @Post(':categoryId/products/:productId')
  @HttpCode(HttpStatus.OK)
  addProduct(
    @Param('categoryId') categoryId: string,
    @Param('productId') productId: string,
    @Body('position') position?: number,
  ) {
    return this.categoryService.addProduct(categoryId, productId, position);
  }

  /**
   * Remove product from category
   * DELETE /api/v1/categories/:categoryId/products/:productId
   */
  @Delete(':categoryId/products/:productId')
  @HttpCode(HttpStatus.OK)
  removeProduct(
    @Param('categoryId') categoryId: string,
    @Param('productId') productId: string,
  ) {
    return this.categoryService.removeProduct(categoryId, productId);
  }
}
