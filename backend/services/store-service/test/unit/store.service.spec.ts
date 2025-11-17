/**
 * Store Service Unit Tests
 * Tests for all user stories with >80% coverage
 */

import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { StoreService } from '../../src/modules/store/store.service';
import { StoreRepository } from '../../src/modules/store/repositories/store.repository';
import { SlugFactory } from '../../src/modules/store/factories/slug.factory';
import { EventPublisherService } from '../../src/modules/events/event-publisher.service';
import { CacheService } from '../../src/common/cache.service';
import { CreateStoreDto } from '../../src/modules/store/dto/create-store.dto';
import { UpdateStoreDto } from '../../src/modules/store/dto/update-store.dto';
import { StoreStatus, UpdateStoreStatusDto } from '../../src/modules/store/dto/update-status.dto';

describe('StoreService', () => {
  let service: StoreService;
  let repository: jest.Mocked<StoreRepository>;
  let slugFactory: jest.Mocked<SlugFactory>;
  let eventPublisher: jest.Mocked<EventPublisherService>;
  let cacheService: jest.Mocked<CacheService>;

  const mockStore = {
    id: 'store-123',
    ownerId: 'user-123',
    name: 'Test Store',
    slug: 'test-store',
    domain: 'test-store.ecomify.com',
    customDomain: null,
    email: 'test@example.com',
    phone: null,
    currency: 'USD',
    locale: 'en-US',
    timezone: 'UTC',
    settings: {},
    theme: {},
    status: 'ACTIVE',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByOwnerId: jest.fn(),
      update: jest.fn(),
      updateTheme: jest.fn(),
      updateStatus: jest.fn(),
    };

    const mockSlugFactory = {
      generateUniqueSlug: jest.fn(),
      generateSubdomain: jest.fn(),
    };

    const mockEventPublisher = {
      publishStoreCreated: jest.fn(),
      publishStoreUpdated: jest.fn(),
      publishStoreStatusChanged: jest.fn(),
      publishThemeUpdated: jest.fn(),
    };

    const mockCacheService = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StoreService,
        { provide: StoreRepository, useValue: mockRepository },
        { provide: SlugFactory, useValue: mockSlugFactory },
        { provide: EventPublisherService, useValue: mockEventPublisher },
        { provide: CacheService, useValue: mockCacheService },
      ],
    }).compile();

    service = module.get<StoreService>(StoreService);
    repository = module.get(StoreRepository);
    slugFactory = module.get(SlugFactory);
    eventPublisher = module.get(EventPublisherService);
    cacheService = module.get(CacheService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('US-BE-201: Create Store', () => {
    it('should create a store successfully', async () => {
      const createDto: CreateStoreDto = {
        name: 'Test Store',
        email: 'test@example.com',
      };

      slugFactory.generateUniqueSlug.mockResolvedValue('test-store');
      slugFactory.generateSubdomain.mockReturnValue('test-store.ecomify.com');
      repository.create.mockResolvedValue(mockStore);

      const result = await service.createStore('user-123', createDto);

      expect(result.name).toBe('Test Store');
      expect(result.slug).toBe('test-store');
      expect(repository.create).toHaveBeenCalled();
      expect(eventPublisher.publishStoreCreated).toHaveBeenCalledWith(
        'store-123',
        expect.any(Object),
      );
    });

    it('should create store with optional fields', async () => {
      const createDto: CreateStoreDto = {
        name: 'Test Store',
        email: 'test@example.com',
        phone: '+1234567890',
        currency: 'EUR',
        locale: 'en-GB',
        timezone: 'Europe/London',
      };

      slugFactory.generateUniqueSlug.mockResolvedValue('test-store');
      slugFactory.generateSubdomain.mockReturnValue('test-store.ecomify.com');
      repository.create.mockResolvedValue({ ...mockStore, ...createDto });

      const result = await service.createStore('user-123', createDto);

      expect(result.currency).toBe('EUR');
      expect(result.locale).toBe('en-GB');
      expect(result.timezone).toBe('Europe/London');
    });
  });

  describe('US-BE-202: Get Store Details', () => {
    it('should get store from cache if available', async () => {
      cacheService.get.mockResolvedValue(mockStore);

      const result = await service.getStoreById('store-123');

      expect(result.id).toBe('store-123');
      expect(cacheService.get).toHaveBeenCalledWith('store:store-123');
      expect(repository.findById).not.toHaveBeenCalled();
    });

    it('should get store from database if not in cache', async () => {
      cacheService.get.mockResolvedValue(null);
      repository.findById.mockResolvedValue(mockStore);

      const result = await service.getStoreById('store-123');

      expect(result.id).toBe('store-123');
      expect(repository.findById).toHaveBeenCalledWith('store-123');
      expect(cacheService.set).toHaveBeenCalledWith(
        'store:store-123',
        mockStore,
        3600,
      );
    });

    it('should throw NotFoundException if store not found', async () => {
      cacheService.get.mockResolvedValue(null);
      repository.findById.mockResolvedValue(null);

      await expect(service.getStoreById('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should get stores by owner', async () => {
      cacheService.get.mockResolvedValue(null);
      repository.findByOwnerId.mockResolvedValue([mockStore]);

      const result = await service.getStoresByOwner('user-123');

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('store-123');
      expect(repository.findByOwnerId).toHaveBeenCalledWith('user-123');
    });
  });

  describe('US-BE-203: Update Store Settings', () => {
    it('should update store settings', async () => {
      const updateDto: UpdateStoreDto = {
        name: 'Updated Store',
        email: 'updated@example.com',
      };

      repository.findById.mockResolvedValue(mockStore);
      repository.update.mockResolvedValue({
        ...mockStore,
        ...updateDto,
      });

      const result = await service.updateStore('store-123', 'user-123', updateDto);

      expect(result.name).toBe('Updated Store');
      expect(repository.update).toHaveBeenCalledWith('store-123', updateDto);
      expect(eventPublisher.publishStoreUpdated).toHaveBeenCalled();
      expect(cacheService.del).toHaveBeenCalledWith('store:store-123');
    });

    it('should throw ForbiddenException if user is not owner', async () => {
      repository.findById.mockResolvedValue(mockStore);

      await expect(
        service.updateStore('store-123', 'different-user', {}),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('US-BE-204: Update Store Theme', () => {
    it('should update theme with valid configuration', async () => {
      const themeConfig = {
        colors: {
          primary: '#3B82F6',
          secondary: '#8B5CF6',
          accent: '#10B981',
          background: '#FFFFFF',
          text: '#1F2937',
        },
        typography: {
          fontFamily: 'Inter',
          headingFont: 'Inter',
        },
        layout: {
          headerStyle: 'fixed',
          sidebarPosition: 'left',
        },
      };

      repository.findById.mockResolvedValue(mockStore);
      repository.updateTheme.mockResolvedValue({
        ...mockStore,
        theme: themeConfig,
      });

      const result = await service.updateTheme('store-123', 'user-123', themeConfig);

      expect(result.theme).toEqual(themeConfig);
      expect(eventPublisher.publishThemeUpdated).toHaveBeenCalled();
    });

    it('should throw BadRequestException for invalid theme', async () => {
      const invalidTheme = {
        colors: {
          primary: 'invalid-color', // Invalid hex color
        },
      };

      repository.findById.mockResolvedValue(mockStore);

      await expect(
        service.updateTheme('store-123', 'user-123', invalidTheme),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('US-BE-206: Update Store Status', () => {
    it('should allow merchant to pause their own store', async () => {
      const statusDto: UpdateStoreStatusDto = {
        status: StoreStatus.PAUSED,
      };

      repository.findById.mockResolvedValue(mockStore);
      repository.updateStatus.mockResolvedValue({
        ...mockStore,
        status: StoreStatus.PAUSED,
      });

      const result = await service.updateStatus(
        'store-123',
        'user-123',
        statusDto,
        ['MERCHANT'],
      );

      expect(result.status).toBe(StoreStatus.PAUSED);
      expect(eventPublisher.publishStoreStatusChanged).toHaveBeenCalled();
    });

    it('should allow platform admin to suspend store', async () => {
      const statusDto: UpdateStoreStatusDto = {
        status: StoreStatus.SUSPENDED,
      };

      repository.findById.mockResolvedValue(mockStore);
      repository.updateStatus.mockResolvedValue({
        ...mockStore,
        status: StoreStatus.SUSPENDED,
      });

      const result = await service.updateStatus(
        'store-123',
        'admin-123',
        statusDto,
        ['PLATFORM_ADMIN'],
      );

      expect(result.status).toBe(StoreStatus.SUSPENDED);
    });

    it('should throw ForbiddenException if merchant tries to suspend', async () => {
      const statusDto: UpdateStoreStatusDto = {
        status: StoreStatus.SUSPENDED,
      };

      repository.findById.mockResolvedValue(mockStore);

      await expect(
        service.updateStatus('store-123', 'user-123', statusDto, ['MERCHANT']),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException for invalid status transition', async () => {
      const statusDto: UpdateStoreStatusDto = {
        status: StoreStatus.ACTIVE,
      };

      repository.findById.mockResolvedValue({
        ...mockStore,
        status: StoreStatus.CLOSED,
      });

      await expect(
        service.updateStatus('store-123', 'user-123', statusDto, ['PLATFORM_ADMIN']),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
