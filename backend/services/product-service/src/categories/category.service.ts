import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import slugify from 'slugify';
import { CategoryRepository } from './category.repository';
import { EventPublisherService } from '../events/event-publisher.service';
import { CreateCategoryDto } from './dto/category.dto';
import { UpdateCategoryDto } from './dto/category.dto';

/**
 * Category Service - Business logic for hierarchical categories
 */
@Injectable()
export class CategoryService {
  constructor(
    private readonly categoryRepository: CategoryRepository,
    private readonly eventPublisher: EventPublisherService,
  ) {}

  /**
   * Create a new category
   */
  async create(createCategoryDto: CreateCategoryDto) {
    // Generate slug if not provided
    const slug =
      createCategoryDto.slug ||
      slugify(createCategoryDto.name, { lower: true, strict: true });

    // Check if slug already exists
    const existing = await this.categoryRepository.findBySlug(
      createCategoryDto.storeId,
      slug,
    );

    if (existing) {
      throw new ConflictException(
        `Category with slug "${slug}" already exists in this store`,
      );
    }

    // Validate parent category if provided
    if (createCategoryDto.parentId) {
      const parent = await this.categoryRepository.findById(createCategoryDto.parentId);
      if (!parent) {
        throw new NotFoundException(
          `Parent category with ID ${createCategoryDto.parentId} not found`,
        );
      }

      // Ensure parent belongs to same store
      if (parent.storeId !== createCategoryDto.storeId) {
        throw new BadRequestException('Parent category belongs to a different store');
      }
    }

    // Create category
    const category = await this.categoryRepository.create({
      ...createCategoryDto,
      slug,
    });

    // Publish event
    await this.eventPublisher.publishCategoryCreated(category);

    return category;
  }

  /**
   * Find all categories for a store
   */
  async findByStore(storeId: string, includeProducts: boolean = false) {
    return this.categoryRepository.findByStore(storeId, includeProducts);
  }

  /**
   * Find root categories (tree structure)
   */
  async findRootCategories(storeId: string) {
    return this.categoryRepository.findRootCategories(storeId);
  }

  /**
   * Find category by ID
   */
  async findOne(id: string) {
    const category = await this.categoryRepository.findWithHierarchy(id);

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return category;
  }

  /**
   * Find category by slug
   */
  async findBySlug(storeId: string, slug: string) {
    const category = await this.categoryRepository.findBySlug(storeId, slug);

    if (!category) {
      throw new NotFoundException(`Category with slug "${slug}" not found in this store`);
    }

    return category;
  }

  /**
   * Get category breadcrumb path
   */
  async getCategoryPath(categoryId: string) {
    return this.categoryRepository.getCategoryPath(categoryId);
  }

  /**
   * Update category
   */
  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.findOne(id);

    // If slug is being updated, check for conflicts
    if (updateCategoryDto.slug && updateCategoryDto.slug !== category.slug) {
      const existing = await this.categoryRepository.findBySlug(
        category.storeId,
        updateCategoryDto.slug,
      );

      if (existing) {
        throw new ConflictException(
          `Category with slug "${updateCategoryDto.slug}" already exists in this store`,
        );
      }
    }

    // If parent is being updated, validate
    if (updateCategoryDto.parentId) {
      // Cannot be its own parent
      if (updateCategoryDto.parentId === id) {
        throw new BadRequestException('Category cannot be its own parent');
      }

      // Check if new parent would create a circular reference
      const newParent = await this.categoryRepository.findById(updateCategoryDto.parentId);
      if (!newParent) {
        throw new NotFoundException(
          `Parent category with ID ${updateCategoryDto.parentId} not found`,
        );
      }

      // Get all descendants to check for circular reference
      const descendantIds = await this.categoryRepository.getDescendantIds(id);
      if (descendantIds.includes(updateCategoryDto.parentId)) {
        throw new BadRequestException(
          'Cannot set a descendant category as parent (circular reference)',
        );
      }

      // Ensure parent belongs to same store
      if (newParent.storeId !== category.storeId) {
        throw new BadRequestException('Parent category belongs to a different store');
      }
    }

    // Update category
    const updatedCategory = await this.categoryRepository.update(id, updateCategoryDto);

    // Publish event
    await this.eventPublisher.publishCategoryUpdated(updatedCategory);

    return updatedCategory;
  }

  /**
   * Delete category
   */
  async remove(id: string) {
    const category = await this.findOne(id);

    // Check if category has children
    const hasChildren = await this.categoryRepository.hasChildren(id);
    if (hasChildren) {
      throw new BadRequestException(
        'Cannot delete category with sub-categories. Delete or move sub-categories first.',
      );
    }

    await this.categoryRepository.delete(id);

    // Publish event
    await this.eventPublisher.publishCategoryDeleted(id, category.storeId);

    return { message: 'Category deleted successfully' };
  }

  /**
   * Add product to category
   */
  async addProduct(categoryId: string, productId: string, position?: number) {
    const category = await this.findOne(categoryId);

    return this.categoryRepository.addProduct(categoryId, productId, position);
  }

  /**
   * Remove product from category
   */
  async removeProduct(categoryId: string, productId: string) {
    return this.categoryRepository.removeProduct(categoryId, productId);
  }
}
