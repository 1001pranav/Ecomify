import { Injectable } from '@nestjs/common';
import { Product, ProductStatus, Prisma } from '@prisma/client';
import { BaseRepository } from '../database/base.repository';
import { PrismaService } from '../database/prisma.service';

/**
 * Repository Pattern - Product data access layer
 * Encapsulates all database operations for products
 */
@Injectable()
export class ProductRepository extends BaseRepository<Product> {
  constructor(prisma: PrismaService) {
    super(prisma, 'product');
  }

  /**
   * Find product by store ID and handle
   */
  async findByHandle(storeId: string, handle: string): Promise<Product | null> {
    return this.model.findUnique({
      where: {
        storeId_handle: {
          storeId,
          handle,
        },
      },
      include: {
        variants: true,
        images: {
          orderBy: { position: 'asc' },
        },
        options: {
          orderBy: { position: 'asc' },
        },
        categories: {
          include: {
            category: true,
          },
        },
        collections: {
          include: {
            collection: true,
          },
        },
      },
    });
  }

  /**
   * Find product with all relations
   */
  async findByIdWithRelations(id: string): Promise<Product | null> {
    return this.model.findUnique({
      where: { id },
      include: {
        variants: {
          orderBy: { createdAt: 'asc' },
        },
        images: {
          orderBy: { position: 'asc' },
        },
        options: {
          orderBy: { position: 'asc' },
        },
        categories: {
          include: {
            category: true,
          },
        },
        collections: {
          include: {
            collection: true,
          },
        },
      },
    });
  }

  /**
   * Find products by store with filters
   */
  async findByStore(
    storeId: string,
    filters?: {
      status?: ProductStatus;
      productType?: string;
      tags?: string[];
      search?: string;
    },
    pagination?: { page: number; limit: number },
    orderBy?: any,
  ) {
    const where: Prisma.ProductWhereInput = {
      storeId,
    };

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.productType) {
      where.productType = filters.productType;
    }

    if (filters?.tags && filters.tags.length > 0) {
      where.tags = {
        hasSome: filters.tags,
      };
    }

    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { vendor: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const include = {
      variants: {
        take: 1,
        orderBy: { createdAt: 'asc' },
      },
      images: {
        take: 1,
        orderBy: { position: 'asc' },
      },
      _count: {
        select: {
          variants: true,
          images: true,
        },
      },
    };

    if (pagination) {
      return this.paginate(where, pagination.page, pagination.limit, include, orderBy);
    }

    return this.findMany(where, include, orderBy);
  }

  /**
   * Create product with relations
   */
  async createWithRelations(data: Prisma.ProductCreateInput): Promise<Product> {
    return this.model.create({
      data,
      include: {
        variants: true,
        images: {
          orderBy: { position: 'asc' },
        },
        options: {
          orderBy: { position: 'asc' },
        },
      },
    });
  }

  /**
   * Update product with relations
   */
  async updateWithRelations(id: string, data: Prisma.ProductUpdateInput): Promise<Product> {
    return this.model.update({
      where: { id },
      data,
      include: {
        variants: true,
        images: {
          orderBy: { position: 'asc' },
        },
        options: {
          orderBy: { position: 'asc' },
        },
      },
    });
  }

  /**
   * Bulk update products
   */
  async bulkUpdate(productIds: string[], data: Prisma.ProductUpdateInput): Promise<number> {
    const result = await this.prisma.product.updateMany({
      where: {
        id: {
          in: productIds,
        },
      },
      data,
    });

    return result.count;
  }

  /**
   * Bulk delete products
   */
  async bulkDelete(productIds: string[]): Promise<number> {
    const result = await this.prisma.product.deleteMany({
      where: {
        id: {
          in: productIds,
        },
      },
    });

    return result.count;
  }

  /**
   * Find products by category
   */
  async findByCategory(categoryId: string, pagination?: { page: number; limit: number }) {
    const where = {
      categories: {
        some: {
          categoryId,
        },
      },
    };

    const include = {
      variants: {
        take: 1,
        orderBy: { createdAt: 'asc' },
      },
      images: {
        take: 1,
        orderBy: { position: 'asc' },
      },
    };

    if (pagination) {
      return this.paginate(where, pagination.page, pagination.limit, include);
    }

    return this.findMany(where, include);
  }

  /**
   * Find products by collection
   */
  async findByCollection(collectionId: string, pagination?: { page: number; limit: number }) {
    const where = {
      collections: {
        some: {
          collectionId,
        },
      },
    };

    const include = {
      variants: {
        take: 1,
        orderBy: { createdAt: 'asc' },
      },
      images: {
        take: 1,
        orderBy: { position: 'asc' },
      },
    };

    if (pagination) {
      return this.paginate(where, pagination.page, pagination.limit, include);
    }

    return this.findMany(where, include);
  }

  /**
   * Get product count by status
   */
  async countByStatus(storeId: string): Promise<Record<string, number>> {
    const counts = await this.prisma.product.groupBy({
      by: ['status'],
      where: { storeId },
      _count: true,
    });

    return counts.reduce(
      (acc, curr) => {
        acc[curr.status] = curr._count;
        return acc;
      },
      {} as Record<string, number>,
    );
  }
}
