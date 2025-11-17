import { Injectable } from '@nestjs/common';
import { Category, Prisma } from '@prisma/client';
import { BaseRepository } from '../database/base.repository';
import { PrismaService } from '../database/prisma.service';

/**
 * Repository Pattern - Category data access layer
 */
@Injectable()
export class CategoryRepository extends BaseRepository<Category> {
  constructor(prisma: PrismaService) {
    super(prisma, 'category');
  }

  /**
   * Find category by slug
   */
  async findBySlug(storeId: string, slug: string): Promise<Category | null> {
    return this.model.findUnique({
      where: {
        storeId_slug: {
          storeId,
          slug,
        },
      },
      include: {
        parent: true,
        children: {
          orderBy: { position: 'asc' },
        },
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
        },
      },
    });
  }

  /**
   * Find categories by store
   */
  async findByStore(storeId: string, includeProducts: boolean = false) {
    return this.model.findMany({
      where: { storeId },
      include: {
        parent: true,
        children: {
          orderBy: { position: 'asc' },
        },
        _count: {
          select: {
            products: true,
            children: true,
          },
        },
        ...(includeProducts && {
          products: {
            include: {
              product: true,
            },
          },
        }),
      },
      orderBy: [{ parentId: 'asc' }, { position: 'asc' }],
    });
  }

  /**
   * Find root categories (no parent)
   */
  async findRootCategories(storeId: string) {
    return this.model.findMany({
      where: {
        storeId,
        parentId: null,
      },
      include: {
        children: {
          orderBy: { position: 'asc' },
          include: {
            children: {
              orderBy: { position: 'asc' },
            },
          },
        },
        _count: {
          select: {
            products: true,
          },
        },
      },
      orderBy: { position: 'asc' },
    });
  }

  /**
   * Find category with full hierarchy
   */
  async findWithHierarchy(id: string): Promise<Category | null> {
    return this.model.findUnique({
      where: { id },
      include: {
        parent: true,
        children: {
          orderBy: { position: 'asc' },
          include: {
            children: {
              orderBy: { position: 'asc' },
            },
          },
        },
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
        },
      },
    });
  }

  /**
   * Get category path (breadcrumb)
   */
  async getCategoryPath(categoryId: string): Promise<Category[]> {
    const path: Category[] = [];
    let currentId: string | null = categoryId;

    while (currentId) {
      const category = await this.findById(currentId);
      if (!category) break;

      path.unshift(category);
      currentId = category.parentId;
    }

    return path;
  }

  /**
   * Add product to category
   */
  async addProduct(categoryId: string, productId: string, position?: number) {
    return this.prisma.productCategory.create({
      data: {
        categoryId,
        productId,
        position: position || 0,
      },
    });
  }

  /**
   * Remove product from category
   */
  async removeProduct(categoryId: string, productId: string) {
    return this.prisma.productCategory.delete({
      where: {
        productId_categoryId: {
          productId,
          categoryId,
        },
      },
    });
  }

  /**
   * Check if category has children
   */
  async hasChildren(categoryId: string): Promise<boolean> {
    const count = await this.prisma.category.count({
      where: {
        parentId: categoryId,
      },
    });

    return count > 0;
  }

  /**
   * Get all descendant IDs (recursive)
   */
  async getDescendantIds(categoryId: string): Promise<string[]> {
    const descendants: string[] = [];

    const getChildren = async (parentId: string) => {
      const children = await this.model.findMany({
        where: { parentId },
        select: { id: true },
      });

      for (const child of children) {
        descendants.push(child.id);
        await getChildren(child.id);
      }
    };

    await getChildren(categoryId);
    return descendants;
  }
}
