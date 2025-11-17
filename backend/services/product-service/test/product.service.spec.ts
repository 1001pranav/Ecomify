import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from '../src/products/product.service';
import { ProductRepository } from '../src/products/product.repository';
import { EventPublisherService } from '../src/events/event-publisher.service';
import { ProductStatus } from '@prisma/client';

describe('ProductService', () => {
  let service: ProductService;
  let repository: ProductRepository;
  let eventPublisher: EventPublisherService;

  const mockRepository = {
    findByHandle: jest.fn(),
    createWithRelations: jest.fn(),
    findByIdWithRelations: jest.fn(),
    findByStore: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockEventPublisher = {
    publishProductCreated: jest.fn(),
    publishProductUpdated: jest.fn(),
    publishProductDeleted: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: ProductRepository,
          useValue: mockRepository,
        },
        {
          provide: EventPublisherService,
          useValue: mockEventPublisher,
        },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
    repository = module.get<ProductRepository>(ProductRepository);
    eventPublisher = module.get<EventPublisherService>(EventPublisherService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a product with variants', async () => {
      const createDto = {
        storeId: 'store-1',
        title: 'Test Product',
        description: 'Test description',
        variants: [
          {
            title: 'Default',
            price: 29.99,
            inventoryQty: 100,
          },
        ],
      };

      mockRepository.findByHandle.mockResolvedValue(null);
      mockRepository.createWithRelations.mockResolvedValue({
        id: 'product-1',
        ...createDto,
        handle: 'test-product',
        status: ProductStatus.DRAFT,
      });

      const result = await service.create(createDto);

      expect(result).toBeDefined();
      expect(result.id).toBe('product-1');
      expect(mockEventPublisher.publishProductCreated).toHaveBeenCalled();
    });

    it('should throw error if handle already exists', async () => {
      const createDto = {
        storeId: 'store-1',
        title: 'Test Product',
        variants: [{ title: 'Default', price: 29.99 }],
      };

      mockRepository.findByHandle.mockResolvedValue({ id: 'existing-product' });

      await expect(service.create(createDto)).rejects.toThrow();
    });
  });

  describe('findOne', () => {
    it('should return a product by ID', async () => {
      const mockProduct = {
        id: 'product-1',
        title: 'Test Product',
      };

      mockRepository.findByIdWithRelations.mockResolvedValue(mockProduct);

      const result = await service.findOne('product-1');

      expect(result).toEqual(mockProduct);
    });

    it('should throw error if product not found', async () => {
      mockRepository.findByIdWithRelations.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow();
    });
  });

  describe('update', () => {
    it('should update a product', async () => {
      const mockProduct = {
        id: 'product-1',
        title: 'Test Product',
        status: ProductStatus.DRAFT,
      };

      mockRepository.findByIdWithRelations.mockResolvedValue(mockProduct);
      mockRepository.updateWithRelations.mockResolvedValue({
        ...mockProduct,
        title: 'Updated Product',
      });

      const result = await service.update('product-1', { title: 'Updated Product' });

      expect(result.title).toBe('Updated Product');
      expect(mockEventPublisher.publishProductUpdated).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete a product', async () => {
      const mockProduct = {
        id: 'product-1',
        storeId: 'store-1',
      };

      mockRepository.findByIdWithRelations.mockResolvedValue(mockProduct);
      mockRepository.delete.mockResolvedValue(mockProduct);

      const result = await service.remove('product-1');

      expect(result.message).toBe('Product deleted successfully');
      expect(mockEventPublisher.publishProductDeleted).toHaveBeenCalledWith(
        'product-1',
        'store-1',
      );
    });
  });
});
