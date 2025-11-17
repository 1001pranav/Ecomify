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
import { CollectionService } from './collection.service';
import { CreateCollectionDto, UpdateCollectionDto } from './dto/collection.dto';
import { CollectionType } from '@prisma/client';

@Controller('collections')
export class CollectionController {
  constructor(private readonly collectionService: CollectionService) {}

  /**
   * Create a new collection
   * POST /api/v1/collections
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createCollectionDto: CreateCollectionDto) {
    return this.collectionService.create(createCollectionDto);
  }

  /**
   * Get all collections for a store
   * GET /api/v1/collections?storeId=xxx&type=MANUAL
   */
  @Get()
  findAll(@Query('storeId') storeId: string, @Query('type') type?: CollectionType) {
    return this.collectionService.findByStore(storeId, type);
  }

  /**
   * Get collection by ID
   * GET /api/v1/collections/:id
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.collectionService.findOne(id);
  }

  /**
   * Get collection by handle
   * GET /api/v1/collections/handle/:storeId/:handle
   */
  @Get('handle/:storeId/:handle')
  findByHandle(@Param('storeId') storeId: string, @Param('handle') handle: string) {
    return this.collectionService.findByHandle(storeId, handle);
  }

  /**
   * Update collection
   * PATCH /api/v1/collections/:id
   */
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCollectionDto: UpdateCollectionDto) {
    return this.collectionService.update(id, updateCollectionDto);
  }

  /**
   * Delete collection
   * DELETE /api/v1/collections/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string) {
    return this.collectionService.remove(id);
  }

  /**
   * Add product to manual collection
   * POST /api/v1/collections/:collectionId/products/:productId
   */
  @Post(':collectionId/products/:productId')
  @HttpCode(HttpStatus.OK)
  addProduct(
    @Param('collectionId') collectionId: string,
    @Param('productId') productId: string,
    @Body('position') position?: number,
  ) {
    return this.collectionService.addProduct(collectionId, productId, position);
  }

  /**
   * Remove product from manual collection
   * DELETE /api/v1/collections/:collectionId/products/:productId
   */
  @Delete(':collectionId/products/:productId')
  @HttpCode(HttpStatus.OK)
  removeProduct(
    @Param('collectionId') collectionId: string,
    @Param('productId') productId: string,
  ) {
    return this.collectionService.removeProduct(collectionId, productId);
  }

  /**
   * Update product position in collection
   * PATCH /api/v1/collections/:collectionId/products/:productId/position
   */
  @Patch(':collectionId/products/:productId/position')
  @HttpCode(HttpStatus.OK)
  updateProductPosition(
    @Param('collectionId') collectionId: string,
    @Param('productId') productId: string,
    @Body('position') position: number,
  ) {
    return this.collectionService.updateProductPosition(collectionId, productId, position);
  }

  /**
   * Refresh automated collection
   * POST /api/v1/collections/:id/refresh
   */
  @Post(':id/refresh')
  @HttpCode(HttpStatus.OK)
  refreshAutomatedCollection(@Param('id') id: string) {
    return this.collectionService.updateAutomatedCollection(id);
  }

  /**
   * Refresh all automated collections for a store
   * POST /api/v1/collections/refresh-all?storeId=xxx
   */
  @Post('refresh-all')
  @HttpCode(HttpStatus.OK)
  refreshAllAutomatedCollections(@Query('storeId') storeId: string) {
    return this.collectionService.refreshAutomatedCollections(storeId);
  }
}
