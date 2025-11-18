import { Test, TestingModule } from '@nestjs/testing';
import { InventoryService } from '../src/inventory/inventory.service';
import { PrismaService } from '../src/database/prisma.service';
import { EventPublisher } from '../src/events/event-publisher.service';
import { ReservationStatus } from '@prisma/client';

describe('InventoryService', () => {
  let service: InventoryService;
  let prisma: PrismaService;
  let eventPublisher: EventPublisher;

  const mockPrisma = {
    inventoryItem: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      upsert: jest.fn(),
      count: jest.fn(),
    },
    inventoryReservation: {
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    inventoryAdjustment: {
      create: jest.fn(),
      createMany: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(mockPrisma)),
  };

  const mockEventPublisher = {
    publish: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: EventPublisher, useValue: mockEventPublisher },
      ],
    }).compile();

    service = module.get<InventoryService>(InventoryService);
    prisma = module.get<PrismaService>(PrismaService);
    eventPublisher = module.get<EventPublisher>(EventPublisher);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('reserveInventory', () => {
    it('should reserve inventory successfully', async () => {
      const dto = {
        orderId: 'order-123',
        items: [
          { variantId: 'variant-1', quantity: 2 },
          { variantId: 'variant-2', quantity: 1 },
        ],
      };

      const mockInventoryItem = {
        variantId: 'variant-1',
        locationId: 'location-1',
        available: 10,
        committed: 0,
        location: { isActive: true, priority: 1 },
      };

      const mockReservation = {
        id: 'reservation-1',
        orderId: dto.orderId,
        variantId: 'variant-1',
        locationId: 'location-1',
        quantity: 2,
        status: ReservationStatus.ACTIVE,
      };

      mockPrisma.inventoryItem.findMany.mockResolvedValue([mockInventoryItem]);
      mockPrisma.inventoryItem.update.mockResolvedValue(mockInventoryItem);
      mockPrisma.inventoryReservation.create.mockResolvedValue(mockReservation);

      const result = await service.reserveInventory(dto);

      expect(result.success).toBe(true);
      expect(mockEventPublisher.publish).toHaveBeenCalledWith(
        'inventory.reserved',
        expect.any(Object)
      );
    });
  });

  describe('releaseReservationByOrder', () => {
    it('should release inventory reservations', async () => {
      const orderId = 'order-123';

      const mockReservations = [
        {
          id: 'reservation-1',
          orderId,
          variantId: 'variant-1',
          locationId: 'location-1',
          quantity: 2,
          status: ReservationStatus.ACTIVE,
        },
      ];

      mockPrisma.inventoryReservation.findMany.mockResolvedValue(mockReservations);
      mockPrisma.inventoryItem.update.mockResolvedValue({});
      mockPrisma.inventoryReservation.update.mockResolvedValue({});

      const result = await service.releaseReservationByOrder(orderId);

      expect(result.success).toBe(true);
      expect(result.released).toBe(1);
      expect(mockEventPublisher.publish).toHaveBeenCalledWith(
        'inventory.released',
        expect.any(Object)
      );
    });
  });

  describe('adjustInventory', () => {
    it('should adjust inventory levels', async () => {
      const dto = {
        variantId: 'variant-1',
        locationId: 'location-1',
        quantity: 10,
        reason: 'Restock',
      };

      const mockInventoryItem = {
        variantId: dto.variantId,
        locationId: dto.locationId,
        available: 20,
        committed: 0,
        incoming: 0,
      };

      mockPrisma.inventoryItem.upsert.mockResolvedValue(mockInventoryItem);
      mockPrisma.inventoryAdjustment.create.mockResolvedValue({});

      const result = await service.adjustInventory(dto);

      expect(result.success).toBe(true);
      expect(mockEventPublisher.publish).toHaveBeenCalledWith(
        'inventory.adjusted',
        expect.any(Object)
      );
    });
  });

  describe('transferInventory', () => {
    it('should transfer inventory between locations', async () => {
      const dto = {
        variantId: 'variant-1',
        fromLocationId: 'location-1',
        toLocationId: 'location-2',
        quantity: 5,
      };

      const mockFromItem = {
        variantId: dto.variantId,
        locationId: dto.fromLocationId,
        available: 10,
        committed: 0,
        incoming: 0,
      };

      mockPrisma.inventoryItem.findUnique.mockResolvedValue(mockFromItem);
      mockPrisma.inventoryItem.update.mockResolvedValue({});
      mockPrisma.inventoryItem.upsert.mockResolvedValue({});
      mockPrisma.inventoryAdjustment.createMany.mockResolvedValue({});

      const result = await service.transferInventory(dto);

      expect(result.success).toBe(true);
      expect(mockEventPublisher.publish).toHaveBeenCalledWith(
        'inventory.transferred',
        expect.any(Object)
      );
    });
  });

  describe('getInventoryByVariant', () => {
    it('should get inventory across all locations', async () => {
      const variantId = 'variant-1';

      const mockItems = [
        {
          variantId,
          locationId: 'location-1',
          available: 10,
          committed: 2,
          incoming: 5,
          location: { name: 'Warehouse A' },
        },
        {
          variantId,
          locationId: 'location-2',
          available: 5,
          committed: 1,
          incoming: 0,
          location: { name: 'Warehouse B' },
        },
      ];

      mockPrisma.inventoryItem.findMany.mockResolvedValue(mockItems);

      const result = await service.getInventoryByVariant(variantId);

      expect(result.variantId).toBe(variantId);
      expect(result.total.available).toBe(15);
      expect(result.total.committed).toBe(3);
      expect(result.total.incoming).toBe(5);
      expect(result.locations).toHaveLength(2);
    });
  });
});
