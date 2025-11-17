import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { CollectionType } from '@prisma/client';
import slugify from 'slugify';
import { CollectionRepository } from './collection.repository';
import { ProductRepository } from '../products/product.repository';
import { EventPublisherService } from '../events/event-publisher.service';
import { CreateCollectionDto, UpdateCollectionDto, CollectionConditionsDto } from './dto/collection.dto';

/**
 * Collection Service - Manages manual and automated product collections
 * Implements Strategy Pattern for condition evaluation
 */
@Injectable()
export class CollectionService {
  constructor(
    private readonly collectionRepository: CollectionRepository,
    private readonly productRepository: ProductRepository,
    private readonly eventPublisher: EventPublisherService,
  ) {}

  /**
   * Create a new collection
   */
  async create(createCollectionDto: CreateCollectionDto) {
    // Generate handle if not provided
    const handle =
      createCollectionDto.handle ||
      slugify(createCollectionDto.title, { lower: true, strict: true });

    // Check if handle already exists
    const existing = await this.collectionRepository.findByHandle(
      createCollectionDto.storeId,
      handle,
    );

    if (existing) {
      throw new ConflictException(
        `Collection with handle "${handle}" already exists in this store`,
      );
    }

    // Validate conditions for automated collections
    if (createCollectionDto.type === CollectionType.AUTOMATED) {
      if (!createCollectionDto.conditions) {
        throw new BadRequestException('Automated collections must have conditions');
      }
    }

    // Create collection
    const collection = await this.collectionRepository.create({
      ...createCollectionDto,
      handle,
    });

    // If automated, populate with matching products
    if (collection.type === CollectionType.AUTOMATED && collection.conditions) {
      await this.updateAutomatedCollection(collection.id);
    }

    // Publish event
    await this.eventPublisher.publishCollectionCreated(collection);

    return collection;
  }

  /**
   * Find all collections for a store
   */
  async findByStore(storeId: string, type?: CollectionType) {
    return this.collectionRepository.findByStore(storeId, type);
  }

  /**
   * Find collection by ID
   */
  async findOne(id: string) {
    const collection = await this.collectionRepository.findWithProducts(id);

    if (!collection) {
      throw new NotFoundException(`Collection with ID ${id} not found`);
    }

    return collection;
  }

  /**
   * Find collection by handle
   */
  async findByHandle(storeId: string, handle: string) {
    const collection = await this.collectionRepository.findByHandle(storeId, handle);

    if (!collection) {
      throw new NotFoundException(
        `Collection with handle "${handle}" not found in this store`,
      );
    }

    return collection;
  }

  /**
   * Update collection
   */
  async update(id: string, updateCollectionDto: UpdateCollectionDto) {
    const collection = await this.findOne(id);

    // If handle is being updated, check for conflicts
    if (updateCollectionDto.handle && updateCollectionDto.handle !== collection.handle) {
      const existing = await this.collectionRepository.findByHandle(
        collection.storeId,
        updateCollectionDto.handle,
      );

      if (existing) {
        throw new ConflictException(
          `Collection with handle "${updateCollectionDto.handle}" already exists in this store`,
        );
      }
    }

    // Update collection
    const updatedCollection = await this.collectionRepository.update(id, updateCollectionDto);

    // If automated and conditions changed, re-populate
    if (
      updatedCollection.type === CollectionType.AUTOMATED &&
      updateCollectionDto.conditions
    ) {
      await this.updateAutomatedCollection(id);
    }

    // Publish event
    await this.eventPublisher.publishCollectionUpdated(updatedCollection);

    return updatedCollection;
  }

  /**
   * Delete collection
   */
  async remove(id: string) {
    const collection = await this.findOne(id);

    await this.collectionRepository.delete(id);

    // Publish event
    await this.eventPublisher.publishCollectionDeleted(id, collection.storeId);

    return { message: 'Collection deleted successfully' };
  }

  /**
   * Add product to manual collection
   */
  async addProduct(collectionId: string, productId: string, position?: number) {
    const collection = await this.findOne(collectionId);

    if (collection.type === CollectionType.AUTOMATED) {
      throw new BadRequestException(
        'Cannot manually add products to automated collections',
      );
    }

    // Validate product exists
    const product = await this.productRepository.findById(productId);
    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    return this.collectionRepository.addProduct(collectionId, productId, position);
  }

  /**
   * Remove product from manual collection
   */
  async removeProduct(collectionId: string, productId: string) {
    const collection = await this.findOne(collectionId);

    if (collection.type === CollectionType.AUTOMATED) {
      throw new BadRequestException(
        'Cannot manually remove products from automated collections',
      );
    }

    return this.collectionRepository.removeProduct(collectionId, productId);
  }

  /**
   * Update product position in collection
   */
  async updateProductPosition(collectionId: string, productId: string, position: number) {
    return this.collectionRepository.updateProductPosition(collectionId, productId, position);
  }

  /**
   * Update automated collection - Strategy Pattern for condition evaluation
   */
  async updateAutomatedCollection(collectionId: string) {
    const collection = await this.collectionRepository.findById(collectionId);

    if (!collection || collection.type !== CollectionType.AUTOMATED) {
      return;
    }

    if (!collection.conditions) {
      return;
    }

    const conditions = collection.conditions as CollectionConditionsDto;

    // Find all products that match conditions
    const matchingProducts = await this.findProductsByConditions(
      collection.storeId,
      conditions,
    );

    // Remove all existing products
    await this.collectionRepository.removeAllProducts(collectionId);

    // Add matching products
    for (let i = 0; i < matchingProducts.length; i++) {
      await this.collectionRepository.addProduct(collectionId, matchingProducts[i].id, i);
    }

    console.log(
      `✅ Updated automated collection ${collectionId} with ${matchingProducts.length} products`,
    );
  }

  /**
   * Find products matching collection conditions - Strategy Pattern
   */
  private async findProductsByConditions(storeId: string, conditions: CollectionConditionsDto) {
    const { rules, logic } = conditions;

    // Get all products for the store
    const allProducts = await this.productRepository.findByStore(storeId, {}, undefined, {
      createdAt: 'desc',
    });

    // Filter products based on conditions
    const matchingProducts = allProducts.filter((product: any) => {
      if (logic === 'AND') {
        return rules.every((rule) => this.evaluateRule(product, rule));
      } else {
        return rules.some((rule) => this.evaluateRule(product, rule));
      }
    });

    return matchingProducts;
  }

  /**
   * Evaluate a single rule against a product - Strategy Pattern
   */
  private evaluateRule(product: any, rule: any): boolean {
    const { field, operator, value } = rule;
    let productValue: any;

    // Extract field value from product
    switch (field) {
      case 'price':
        productValue = product.variants?.[0]?.price || 0;
        break;
      case 'tags':
        productValue = product.tags || [];
        break;
      case 'productType':
        productValue = product.productType;
        break;
      case 'vendor':
        productValue = product.vendor;
        break;
      case 'inventoryQty':
        productValue = product.variants?.[0]?.inventoryQty || 0;
        break;
      case 'status':
        productValue = product.status;
        break;
      default:
        return false;
    }

    // Evaluate operator
    switch (operator) {
      case 'equals':
        return productValue === value;
      case 'notEquals':
        return productValue !== value;
      case 'greaterThan':
        return Number(productValue) > Number(value);
      case 'lessThan':
        return Number(productValue) < Number(value);
      case 'greaterThanOrEqual':
        return Number(productValue) >= Number(value);
      case 'lessThanOrEqual':
        return Number(productValue) <= Number(value);
      case 'contains':
        if (Array.isArray(productValue)) {
          return productValue.includes(value);
        }
        return String(productValue).includes(String(value));
      case 'notContains':
        if (Array.isArray(productValue)) {
          return !productValue.includes(value);
        }
        return !String(productValue).includes(String(value));
      case 'in':
        return Array.isArray(value) && value.includes(productValue);
      case 'notIn':
        return Array.isArray(value) && !value.includes(productValue);
      case 'isEmpty':
        return !productValue || (Array.isArray(productValue) && productValue.length === 0);
      case 'isNotEmpty':
        return productValue && (!Array.isArray(productValue) || productValue.length > 0);
      default:
        return false;
    }
  }

  /**
   * Refresh all automated collections for a store
   * Should be called when products are created/updated
   */
  async refreshAutomatedCollections(storeId: string) {
    const automatedCollections = await this.collectionRepository.getAutomatedCollections(
      storeId,
    );

    for (const collection of automatedCollections) {
      await this.updateAutomatedCollection(collection.id);
    }
  }
}
