/**
 * Store Repository - Repository Pattern
 * Encapsulates data access logic for Store entities
 */

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma.service';
import { Store } from '../entities/store.entity';
import { StoreConstructorData } from '../builders/store.builder';
import { UpdateStoreDto } from '../dto/update-store.dto';

@Injectable()
export class StoreRepository {
  private readonly logger = new Logger(StoreRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new store
   */
  async create(data: StoreConstructorData): Promise<Store> {
    try {
      const store = await this.prisma.store.create({
        data: {
          ownerId: data.ownerId,
          name: data.name,
          slug: data.slug,
          domain: data.domain,
          email: data.email,
          phone: data.phone,
          currency: data.currency,
          locale: data.locale,
          timezone: data.timezone,
          settings: data.settings,
          theme: data.theme,
        },
      });

      this.logger.log(`Store created: ${store.id}`);
      return store as Store;
    } catch (error) {
      this.logger.error('Error creating store:', error);
      throw error;
    }
  }

  /**
   * Find store by ID
   */
  async findById(id: string): Promise<Store | null> {
    try {
      const store = await this.prisma.store.findUnique({
        where: { id },
      });

      return store as Store | null;
    } catch (error) {
      this.logger.error(`Error finding store ${id}:`, error);
      throw error;
    }
  }

  /**
   * Find store by slug
   */
  async findBySlug(slug: string): Promise<Store | null> {
    try {
      const store = await this.prisma.store.findUnique({
        where: { slug },
      });

      return store as Store | null;
    } catch (error) {
      this.logger.error(`Error finding store by slug ${slug}:`, error);
      throw error;
    }
  }

  /**
   * Find all stores by owner ID
   */
  async findByOwnerId(ownerId: string): Promise<Store[]> {
    try {
      const stores = await this.prisma.store.findMany({
        where: { ownerId },
        orderBy: { createdAt: 'desc' },
      });

      return stores as Store[];
    } catch (error) {
      this.logger.error(`Error finding stores for owner ${ownerId}:`, error);
      throw error;
    }
  }

  /**
   * Update store
   */
  async update(id: string, data: UpdateStoreDto): Promise<Store> {
    try {
      const store = await this.prisma.store.update({
        where: { id },
        data,
      });

      this.logger.log(`Store updated: ${id}`);
      return store as Store;
    } catch (error) {
      this.logger.error(`Error updating store ${id}:`, error);
      throw error;
    }
  }

  /**
   * Update store theme
   */
  async updateTheme(id: string, theme: any): Promise<Store> {
    try {
      const store = await this.prisma.store.update({
        where: { id },
        data: { theme },
      });

      this.logger.log(`Store theme updated: ${id}`);
      return store as Store;
    } catch (error) {
      this.logger.error(`Error updating store theme ${id}:`, error);
      throw error;
    }
  }

  /**
   * Update store status
   */
  async updateStatus(id: string, status: string): Promise<Store> {
    try {
      const store = await this.prisma.store.update({
        where: { id },
        data: { status },
      });

      this.logger.log(`Store status updated: ${id} -> ${status}`);
      return store as Store;
    } catch (error) {
      this.logger.error(`Error updating store status ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete store (soft delete by setting status to CLOSED)
   */
  async delete(id: string): Promise<Store> {
    try {
      const store = await this.prisma.store.update({
        where: { id },
        data: { status: 'CLOSED' },
      });

      this.logger.log(`Store deleted (closed): ${id}`);
      return store as Store;
    } catch (error) {
      this.logger.error(`Error deleting store ${id}:`, error);
      throw error;
    }
  }

  /**
   * Check if store exists
   */
  async exists(id: string): Promise<boolean> {
    try {
      const count = await this.prisma.store.count({
        where: { id },
      });

      return count > 0;
    } catch (error) {
      this.logger.error(`Error checking store existence ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get store count by owner
   */
  async countByOwner(ownerId: string): Promise<number> {
    try {
      return await this.prisma.store.count({
        where: { ownerId },
      });
    } catch (error) {
      this.logger.error(`Error counting stores for owner ${ownerId}:`, error);
      throw error;
    }
  }
}
