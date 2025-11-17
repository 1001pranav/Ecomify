/**
 * Base Repository Pattern Implementation
 *
 * This provides a generic repository interface following the Repository Pattern
 * for data access abstraction.
 */

import { getDatabase } from '../client/prisma';
import { getRedis } from '../client/redis';

export interface Repository<T> {
  findById(id: string): Promise<T | null>;
  findMany(filter?: any): Promise<T[]>;
  create(data: any): Promise<T>;
  update(id: string, data: any): Promise<T>;
  delete(id: string): Promise<void>;
}

/**
 * Base Repository class implementing common CRUD operations
 * Following Repository Pattern
 */
export abstract class BaseRepository<T> implements Repository<T> {
  protected db = getDatabase();
  protected cache = getRedis();
  protected abstract modelName: string;
  protected cachePrefix?: string;
  protected cacheTTL: number = 3600; // 1 hour default

  /**
   * Get model delegate from Prisma
   */
  protected abstract getModel(): any;

  /**
   * Generate cache key
   */
  protected getCacheKey(id: string): string {
    return this.cachePrefix ? `${this.cachePrefix}:${id}` : `${this.modelName}:${id}`;
  }

  /**
   * Find by ID with caching
   */
  async findById(id: string): Promise<T | null> {
    // Try cache first
    const cacheKey = this.getCacheKey(id);
    const cached = await this.cache.get<T>(cacheKey);

    if (cached) {
      return cached;
    }

    // Query database
    const model = this.getModel();
    const result = await model.findUnique({
      where: { id },
    });

    // Cache result
    if (result) {
      await this.cache.set(cacheKey, result, { ttl: this.cacheTTL });
    }

    return result;
  }

  /**
   * Find many records
   */
  async findMany(filter: any = {}): Promise<T[]> {
    const model = this.getModel();
    return await model.findMany(filter);
  }

  /**
   * Create a new record
   */
  async create(data: any): Promise<T> {
    const model = this.getModel();
    const result = await model.create({ data });

    // Cache the new record
    if (result.id) {
      const cacheKey = this.getCacheKey(result.id);
      await this.cache.set(cacheKey, result, { ttl: this.cacheTTL });
    }

    return result;
  }

  /**
   * Update a record
   */
  async update(id: string, data: any): Promise<T> {
    const model = this.getModel();
    const result = await model.update({
      where: { id },
      data,
    });

    // Invalidate cache
    const cacheKey = this.getCacheKey(id);
    await this.cache.del(cacheKey);

    // Cache updated record
    await this.cache.set(cacheKey, result, { ttl: this.cacheTTL });

    return result;
  }

  /**
   * Delete a record
   */
  async delete(id: string): Promise<void> {
    const model = this.getModel();
    await model.delete({
      where: { id },
    });

    // Invalidate cache
    const cacheKey = this.getCacheKey(id);
    await this.cache.del(cacheKey);
  }

  /**
   * Count records
   */
  async count(filter: any = {}): Promise<number> {
    const model = this.getModel();
    return await model.count(filter);
  }

  /**
   * Check if record exists
   */
  async exists(id: string): Promise<boolean> {
    // Check cache first
    const cacheKey = this.getCacheKey(id);
    const cached = await this.cache.exists(cacheKey);

    if (cached) {
      return true;
    }

    // Check database
    const model = this.getModel();
    const count = await model.count({
      where: { id },
    });

    return count > 0;
  }

  /**
   * Paginate results
   */
  async paginate(
    page: number = 1,
    limit: number = 10,
    filter: any = {},
  ): Promise<{
    items: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const model = this.getModel();
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      model.findMany({
        ...filter,
        skip,
        take: limit,
      }),
      model.count({ where: filter.where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Invalidate all cache for this model
   */
  async invalidateCache(): Promise<void> {
    const pattern = this.cachePrefix
      ? `${this.cachePrefix}:*`
      : `${this.modelName}:*`;
    await this.cache.delPattern(pattern);
  }
}

/**
 * Example User Repository implementation
 */
export class UserRepository extends BaseRepository<any> {
  protected modelName = 'user';
  protected cachePrefix = 'user';

  protected getModel() {
    return this.db.user;
  }

  async findByEmail(email: string): Promise<any | null> {
    return await this.db.user.findUnique({
      where: { email },
      include: { roles: true },
    });
  }

  async findWithRoles(id: string): Promise<any | null> {
    return await this.db.user.findUnique({
      where: { id },
      include: { roles: true, sessions: true },
    });
  }
}
