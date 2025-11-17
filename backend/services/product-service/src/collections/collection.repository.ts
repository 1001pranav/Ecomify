import { Injectable } from '@nestjs/common';
import { Collection, CollectionType, Prisma } from '@prisma/client';
import { BaseRepository } from '../database/base.repository';
import { PrismaService } from '../database/prisma.service';

/**
 * Repository Pattern - Collection data access layer
 */
@Injectable()
export class CollectionRepository extends BaseRepository<Collection> {
  constructor(prisma: PrismaService) {
    super(prisma, 'collection');
  }

  /**
   * Find collection by handle
   */
  async findByHandle(storeId: string, handle: string): Promise<Collection | null> {
    return this.model.findUnique({
      where: {
        storeId_handle: {
          storeId,
          handle,
        },
      },
      include: {
        products: {
          include: {
            product: {
              include: {
                variants: {
                  take: 1,
                },
                images: {
                  take: 1,
                },
              },
            },
          },
          orderBy: { position: 'asc' },
        },
        _count: {
          select: {
            products: true,
          },
        },
      },
    });
  }

  /**
   * Find collections by store
   */
  async findByStore(storeId: string, type?: CollectionType) {
    const where: Prisma.CollectionWhereInput = { storeId };

    if (type) {
      where.type = type;
    }

    return this.model.findMany({
      where,
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Find collection with products
   */
  async findWithProducts(id: string): Promise<Collection | null> {
    return this.model.findUnique({
      where: { id },
      include: {
        products: {
          include: {
            product: {
              include: {
                variants: {
                  take: 1,
                },
                images: {
                  take: 1,
                },
              },
            },
          },
          orderBy: { position: 'asc' },
        },
        _count: {
          select: {
            products: true,
          },
        },
      },
    });
  }

  /**
   * Add product to collection
   */
  async addProduct(collectionId: string, productId: string, position?: number) {
    return this.prisma.productCollection.create({
      data: {
        collectionId,
        productId,
        position: position || 0,
      },
    });
  }

  /**
   * Remove product from collection
   */
  async removeProduct(collectionId: string, productId: string) {
    return this.prisma.productCollection.delete({
      where: {
        productId_collectionId: {
          productId,
          collectionId,
        },
      },
    });
  }

  /**
   * Remove all products from collection
   */
  async removeAllProducts(collectionId: string) {
    return this.prisma.productCollection.deleteMany({
      where: {
        collectionId,
      },
    });
  }

  /**
   * Update product position in collection
   */
  async updateProductPosition(collectionId: string, productId: string, position: number) {
    return this.prisma.productCollection.update({
      where: {
        productId_collectionId: {
          productId,
          collectionId,
        },
      },
      data: {
        position,
      },
    });
  }

  /**
   * Get all automated collections for a store
   */
  async getAutomatedCollections(storeId: string) {
    return this.model.findMany({
      where: {
        storeId,
        type: CollectionType.AUTOMATED,
      },
    });
  }
}
