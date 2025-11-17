/**
 * Store Service - Business Logic Layer
 * Implements all store management operations with design patterns
 */

import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { StoreRepository } from './repositories/store.repository';
import { StoreBuilder } from './builders/store.builder';
import { SlugFactory } from './factories/slug.factory';
import { EventPublisherService } from '../events/event-publisher.service';
import { CacheService } from '../../common/cache.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { UpdateStoreStatusDto, StoreStatus } from './dto/update-status.dto';
import { ThemeConfigSchema, ThemeConfig } from './dto/theme-config.dto';
import { Store, StoreResponse } from './entities/store.entity';

@Injectable()
export class StoreService {
  private readonly logger = new Logger(StoreService.name);
  private readonly CACHE_TTL = 3600; // 1 hour

  constructor(
    private readonly repository: StoreRepository,
    private readonly slugFactory: SlugFactory,
    private readonly eventPublisher: EventPublisherService,
    private readonly cache: CacheService,
  ) {}

  /**
   * US-BE-201: Create Store
   * Implements Factory Pattern (SlugFactory) and Builder Pattern (StoreBuilder)
   */
  async createStore(userId: string, dto: CreateStoreDto): Promise<StoreResponse> {
    this.logger.log(`Creating store for user ${userId}`);

    // Use Builder Pattern to construct store
    const builder = new StoreBuilder(this.slugFactory);
    const storeData = await builder.fromDto(userId, dto);

    // Use Repository Pattern to persist
    const store = await this.repository.create(storeData);

    // Publish StoreCreated event (Observer Pattern)
    await this.eventPublisher.publishStoreCreated(store.id, {
      storeId: store.id,
      ownerId: store.ownerId,
      name: store.name,
      slug: store.slug,
      domain: store.domain,
    });

    this.logger.log(`Store created successfully: ${store.id}`);

    return this.toResponse(store);
  }

  /**
   * US-BE-202: Get Store Details
   * Implements Repository Pattern and Caching Decorator Pattern
   */
  async getStoreById(storeId: string, userId?: string): Promise<StoreResponse> {
    const cacheKey = `store:${storeId}`;

    // Try cache first (Decorator Pattern - caching decorator)
    const cached = await this.cache.get<Store>(cacheKey);
    if (cached) {
      this.logger.debug(`Cache hit for store ${storeId}`);
      return this.toResponse(cached);
    }

    // Fetch from repository
    const store = await this.repository.findById(storeId);

    if (!store) {
      throw new NotFoundException(`Store ${storeId} not found`);
    }

    // Cache for future requests
    await this.cache.set(cacheKey, store, this.CACHE_TTL);

    return this.toResponse(store);
  }

  /**
   * US-BE-202: Get stores by owner
   */
  async getStoresByOwner(ownerId: string): Promise<StoreResponse[]> {
    const cacheKey = `stores:owner:${ownerId}`;

    // Try cache first
    const cached = await this.cache.get<Store[]>(cacheKey);
    if (cached) {
      this.logger.debug(`Cache hit for owner ${ownerId} stores`);
      return cached.map(this.toResponse);
    }

    // Fetch from repository
    const stores = await this.repository.findByOwnerId(ownerId);

    // Cache for future requests
    await this.cache.set(cacheKey, stores, this.CACHE_TTL);

    return stores.map(this.toResponse);
  }

  /**
   * US-BE-203: Update Store Settings
   * Implements validation and event publishing
   */
  async updateStore(
    storeId: string,
    userId: string,
    dto: UpdateStoreDto,
  ): Promise<StoreResponse> {
    this.logger.log(`Updating store ${storeId}`);

    // Verify ownership
    await this.verifyOwnership(storeId, userId);

    // Update store
    const store = await this.repository.update(storeId, dto);

    // Invalidate cache
    await this.invalidateStoreCache(storeId, store.ownerId);

    // Publish StoreUpdated event
    await this.eventPublisher.publishStoreUpdated(storeId, {
      storeId,
      updates: dto,
    });

    this.logger.log(`Store updated successfully: ${storeId}`);

    return this.toResponse(store);
  }

  /**
   * US-BE-204: Update Store Theme
   * Implements Zod validation
   */
  async updateTheme(
    storeId: string,
    userId: string,
    themeConfig: any,
  ): Promise<StoreResponse> {
    this.logger.log(`Updating theme for store ${storeId}`);

    // Verify ownership
    await this.verifyOwnership(storeId, userId);

    // Validate theme with Zod
    const validationResult = ThemeConfigSchema.safeParse(themeConfig);

    if (!validationResult.success) {
      throw new BadRequestException({
        message: 'Invalid theme configuration',
        errors: validationResult.error.errors,
      });
    }

    // Update theme
    const store = await this.repository.updateTheme(
      storeId,
      validationResult.data,
    );

    // Invalidate cache
    await this.invalidateStoreCache(storeId, store.ownerId);

    // Publish ThemeUpdated event
    await this.eventPublisher.publishThemeUpdated(storeId, {
      storeId,
      theme: validationResult.data,
    });

    this.logger.log(`Theme updated successfully: ${storeId}`);

    return this.toResponse(store);
  }

  /**
   * US-BE-206: Update Store Status
   * Implements status workflow validation and authorization
   */
  async updateStatus(
    storeId: string,
    userId: string,
    dto: UpdateStoreStatusDto,
    userRoles: string[],
  ): Promise<StoreResponse> {
    this.logger.log(`Updating status for store ${storeId} to ${dto.status}`);

    const store = await this.repository.findById(storeId);

    if (!store) {
      throw new NotFoundException(`Store ${storeId} not found`);
    }

    // Authorization check
    const isPlatformAdmin = userRoles.includes('PLATFORM_ADMIN');
    const isOwner = store.ownerId === userId;

    // Only platform admins can suspend or close stores
    if (
      (dto.status === StoreStatus.SUSPENDED || dto.status === StoreStatus.CLOSED) &&
      !isPlatformAdmin
    ) {
      throw new ForbiddenException('Only platform admins can suspend or close stores');
    }

    // Merchants can pause their own stores
    if (dto.status === StoreStatus.PAUSED && !isOwner && !isPlatformAdmin) {
      throw new ForbiddenException('You can only pause your own stores');
    }

    // Validate status transition
    this.validateStatusTransition(store.status, dto.status);

    // Update status
    const updatedStore = await this.repository.updateStatus(storeId, dto.status);

    // Invalidate cache
    await this.invalidateStoreCache(storeId, store.ownerId);

    // Publish StoreStatusChanged event
    await this.eventPublisher.publishStoreStatusChanged(storeId, {
      storeId,
      oldStatus: store.status,
      newStatus: dto.status,
      reason: dto.reason,
      changedBy: userId,
    });

    this.logger.log(`Store status updated successfully: ${storeId}`);

    return this.toResponse(updatedStore);
  }

  /**
   * Verify store ownership
   */
  private async verifyOwnership(storeId: string, userId: string): Promise<void> {
    const store = await this.repository.findById(storeId);

    if (!store) {
      throw new NotFoundException(`Store ${storeId} not found`);
    }

    if (store.ownerId !== userId) {
      throw new ForbiddenException('You do not own this store');
    }
  }

  /**
   * Validate status transitions
   */
  private validateStatusTransition(currentStatus: string, newStatus: string): void {
    const validTransitions: Record<string, string[]> = {
      ACTIVE: ['PAUSED', 'SUSPENDED', 'CLOSED'],
      PAUSED: ['ACTIVE', 'SUSPENDED', 'CLOSED'],
      SUSPENDED: ['ACTIVE', 'CLOSED'],
      CLOSED: [], // Cannot transition from CLOSED
    };

    const allowed = validTransitions[currentStatus] || [];

    if (!allowed.includes(newStatus)) {
      throw new BadRequestException(
        `Invalid status transition from ${currentStatus} to ${newStatus}`,
      );
    }
  }

  /**
   * Invalidate store cache
   */
  private async invalidateStoreCache(storeId: string, ownerId: string): Promise<void> {
    await this.cache.del(`store:${storeId}`);
    await this.cache.del(`stores:owner:${ownerId}`);
  }

  /**
   * Convert Store entity to response DTO
   */
  private toResponse(store: Store): StoreResponse {
    return {
      id: store.id,
      name: store.name,
      slug: store.slug,
      domain: store.domain || '',
      customDomain: store.customDomain || undefined,
      email: store.email,
      phone: store.phone || undefined,
      currency: store.currency,
      locale: store.locale,
      timezone: store.timezone,
      settings: store.settings,
      theme: store.theme,
      status: store.status,
      createdAt: store.createdAt,
      updatedAt: store.updatedAt,
    };
  }
}
