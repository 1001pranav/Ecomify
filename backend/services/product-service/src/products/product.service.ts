import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { ProductStatus } from '@prisma/client';
import { ProductRepository } from './product.repository';
import { ProductBuilder, ProductBuilderFactory } from './product.builder';
import { EventPublisherService } from '../events/event-publisher.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { BulkUpdateProductDto, BulkDeleteProductDto } from './dto/bulk-operations.dto';

/**
 * Product Service - Business logic layer
 * Orchestrates repositories, builders, and event publishing
 * Implements Factory Pattern for creating products
 */
@Injectable()
export class ProductService {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly eventPublisher: EventPublisherService,
  ) {}

  /**
   * Create a new product using Builder Pattern
   */
  async create(createProductDto: CreateProductDto) {
    // Check if handle already exists
    const handle = createProductDto.handle || createProductDto.title;
    const existing = await this.productRepository.findByHandle(
      createProductDto.storeId,
      handle,
    );

    if (existing) {
      throw new ConflictException(
        `Product with handle "${handle}" already exists in this store`,
      );
    }

    // Use Builder Pattern to construct product
    const builder = new ProductBuilder(createProductDto.storeId, createProductDto.title);

    if (createProductDto.description) {
      builder.setDescription(createProductDto.description);
    }

    if (createProductDto.handle) {
      builder.setHandle(createProductDto.handle);
    }

    if (createProductDto.vendor) {
      builder.setVendor(createProductDto.vendor);
    }

    if (createProductDto.productType) {
      builder.setProductType(createProductDto.productType);
    }

    if (createProductDto.tags) {
      builder.setTags(createProductDto.tags);
    }

    if (createProductDto.status) {
      builder.setStatus(createProductDto.status);
    }

    if (createProductDto.seoTitle || createProductDto.seoDescription) {
      builder.setSEO(
        createProductDto.seoTitle || createProductDto.title,
        createProductDto.seoDescription || '',
      );
    }

    // Add options
    if (createProductDto.options) {
      createProductDto.options.forEach((option) => {
        builder.addOption(option.name, option.values, option.position);
      });
    }

    // Add variants
    createProductDto.variants.forEach((variant) => {
      builder.addVariant(variant);
    });

    // Add images
    if (createProductDto.images) {
      createProductDto.images.forEach((image) => {
        builder.addImage(image.url, image.altText, image.position);
      });
    }

    // Build and create product
    const productData = builder.build();
    const product = await this.productRepository.createWithRelations(productData);

    // Publish event
    await this.eventPublisher.publishProductCreated(product);

    return product;
  }

  /**
   * Find product by ID
   */
  async findOne(id: string) {
    const product = await this.productRepository.findByIdWithRelations(id);

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  /**
   * Find product by handle
   */
  async findByHandle(storeId: string, handle: string) {
    const product = await this.productRepository.findByHandle(storeId, handle);

    if (!product) {
      throw new NotFoundException(
        `Product with handle "${handle}" not found in this store`,
      );
    }

    return product;
  }

  /**
   * Find products by store
   */
  async findByStore(
    storeId: string,
    filters?: {
      status?: ProductStatus;
      productType?: string;
      tags?: string[];
      search?: string;
      page?: number;
      limit?: number;
    },
  ) {
    const pagination = filters?.page
      ? { page: filters.page, limit: filters.limit || 20 }
      : undefined;

    return this.productRepository.findByStore(
      storeId,
      {
        status: filters?.status,
        productType: filters?.productType,
        tags: filters?.tags,
        search: filters?.search,
      },
      pagination,
      { createdAt: 'desc' },
    );
  }

  /**
   * Update product
   */
  async update(id: string, updateProductDto: UpdateProductDto) {
    const product = await this.findOne(id);

    // If status is changing to ACTIVE, set publishedAt
    const updateData: any = { ...updateProductDto };

    if (
      updateProductDto.status === ProductStatus.ACTIVE &&
      product.status !== ProductStatus.ACTIVE
    ) {
      updateData.publishedAt = new Date();
      await this.eventPublisher.publishProductPublished({ ...product, ...updateData });
    }

    if (updateProductDto.status === ProductStatus.ARCHIVED) {
      await this.eventPublisher.publishProductArchived({ ...product, ...updateData });
    }

    const updatedProduct = await this.productRepository.updateWithRelations(id, updateData);

    // Publish event
    await this.eventPublisher.publishProductUpdated(updatedProduct);

    return updatedProduct;
  }

  /**
   * Delete product
   */
  async remove(id: string) {
    const product = await this.findOne(id);

    await this.productRepository.delete(id);

    // Publish event
    await this.eventPublisher.publishProductDeleted(id, product.storeId);

    return { message: 'Product deleted successfully' };
  }

  /**
   * Bulk update products - Command Pattern
   */
  async bulkUpdate(bulkUpdateDto: BulkUpdateProductDto) {
    const { productIds, ...updates } = bulkUpdateDto;

    // Validate all products exist
    const products = await Promise.all(
      productIds.map((id) => this.productRepository.findById(id)),
    );

    const notFound = products.filter((p) => !p);
    if (notFound.length > 0) {
      throw new NotFoundException(`Some products were not found`);
    }

    // Perform bulk update
    const count = await this.productRepository.bulkUpdate(productIds, updates);

    // Publish events for each updated product
    for (const product of products.filter((p) => p)) {
      await this.eventPublisher.publishProductUpdated({ ...product, ...updates });
    }

    return {
      message: `${count} products updated successfully`,
      count,
    };
  }

  /**
   * Bulk delete products - Command Pattern
   */
  async bulkDelete(bulkDeleteDto: BulkDeleteProductDto) {
    const { productIds } = bulkDeleteDto;

    // Validate all products exist and get store IDs for events
    const products = await Promise.all(
      productIds.map((id) => this.productRepository.findById(id)),
    );

    const notFound = products.filter((p) => !p);
    if (notFound.length > 0) {
      throw new NotFoundException(`Some products were not found`);
    }

    // Perform bulk delete
    const count = await this.productRepository.bulkDelete(productIds);

    // Publish events
    for (const product of products.filter((p) => p)) {
      await this.eventPublisher.publishProductDeleted(product!.id, product!.storeId);
    }

    return {
      message: `${count} products deleted successfully`,
      count,
    };
  }

  /**
   * Get product count by status
   */
  async getStatusCounts(storeId: string) {
    return this.productRepository.countByStatus(storeId);
  }

  /**
   * Find products by category
   */
  async findByCategory(categoryId: string, page?: number, limit?: number) {
    const pagination = page ? { page, limit: limit || 20 } : undefined;
    return this.productRepository.findByCategory(categoryId, pagination);
  }

  /**
   * Find products by collection
   */
  async findByCollection(collectionId: string, page?: number, limit?: number) {
    const pagination = page ? { page, limit: limit || 20 } : undefined;
    return this.productRepository.findByCollection(collectionId, pagination);
  }
}
