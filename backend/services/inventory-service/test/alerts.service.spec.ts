import { Test, TestingModule } from '@nestjs/testing';
import { AlertsService } from '../src/alerts/alerts.service';
import { PrismaService } from '../src/database/prisma.service';
import { EventPublisher } from '../src/events/event-publisher.service';
import { AlertStatus } from '@prisma/client';

describe('AlertsService', () => {
  let service: AlertsService;
  let prisma: PrismaService;
  let eventPublisher: EventPublisher;

  const mockPrisma = {
    inventoryItem: {
      findMany: jest.fn(),
    },
    lowStockAlert: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      count: jest.fn(),
    },
    inventoryItem: {
      findMany: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockEventPublisher = {
    publish: jest.fn(),
  };

  beforeEach(async () => {
    process.env.LOW_STOCK_THRESHOLD = '10';

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AlertsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: EventPublisher, useValue: mockEventPublisher },
      ],
    }).compile();

    service = module.get<AlertsService>(AlertsService);
    prisma = module.get<PrismaService>(PrismaService);
    eventPublisher = module.get<EventPublisher>(EventPublisher);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('checkLowStock', () => {
    it('should create alert when stock is below threshold', async () => {
      const mockInventoryItems = [
        {
          variantId: 'variant-1',
          locationId: 'location-1',
          available: 5, // Below default threshold of 10
          lowStockThreshold: null,
          location: { storeId: 'store-1' },
        },
      ];

      const mockAlert = {
        id: 'alert-1',
        storeId: 'store-1',
        variantId: 'variant-1',
        locationId: 'location-1',
        currentStock: 5,
        threshold: 10,
        status: AlertStatus.ACTIVE,
      };

      mockPrisma.inventoryItem.findMany.mockResolvedValue(mockInventoryItems);
      mockPrisma.lowStockAlert.findFirst.mockResolvedValue(null);
      mockPrisma.lowStockAlert.create.mockResolvedValue(mockAlert);
      mockPrisma.lowStockAlert.updateMany.mockResolvedValue({});

      await service.checkLowStock();

      expect(mockPrisma.lowStockAlert.create).toHaveBeenCalled();
      expect(mockEventPublisher.publish).toHaveBeenCalledWith(
        'inventory.low_stock',
        expect.objectContaining({
          variantId: 'variant-1',
          currentStock: 5,
          threshold: 10,
        })
      );
    });

    it('should resolve alert when stock is above threshold', async () => {
      const mockInventoryItems = [
        {
          variantId: 'variant-1',
          locationId: 'location-1',
          available: 15, // Above threshold
          lowStockThreshold: null,
          location: { storeId: 'store-1' },
        },
      ];

      mockPrisma.inventoryItem.findMany.mockResolvedValue(mockInventoryItems);
      mockPrisma.lowStockAlert.findFirst.mockResolvedValue(null);
      mockPrisma.lowStockAlert.updateMany.mockResolvedValue({});

      await service.checkLowStock();

      expect(mockPrisma.lowStockAlert.create).not.toHaveBeenCalled();
      expect(mockPrisma.lowStockAlert.updateMany).toHaveBeenCalledWith({
        where: {
          variantId: 'variant-1',
          locationId: 'location-1',
          status: AlertStatus.ACTIVE,
        },
        data: {
          status: AlertStatus.RESOLVED,
          resolvedAt: expect.any(Date),
        },
      });
    });
  });

  describe('getActiveAlerts', () => {
    it('should return active alerts for a store', async () => {
      const storeId = 'store-1';
      const mockAlerts = [
        {
          id: 'alert-1',
          storeId,
          variantId: 'variant-1',
          locationId: 'location-1',
          currentStock: 5,
          threshold: 10,
          status: AlertStatus.ACTIVE,
        },
      ];

      mockPrisma.lowStockAlert.findMany.mockResolvedValue(mockAlerts);

      const result = await service.getActiveAlerts(storeId);

      expect(result).toEqual(mockAlerts);
      expect(mockPrisma.lowStockAlert.findMany).toHaveBeenCalledWith({
        where: {
          storeId,
          status: AlertStatus.ACTIVE,
        },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('updateThreshold', () => {
    it('should update low stock threshold', async () => {
      const variantId = 'variant-1';
      const locationId = 'location-1';
      const threshold = 15;

      mockPrisma.inventoryItem.update.mockResolvedValue({
        variantId,
        locationId,
        lowStockThreshold: threshold,
      });

      const result = await service.updateThreshold(variantId, locationId, threshold);

      expect(mockPrisma.inventoryItem.update).toHaveBeenCalledWith({
        where: {
          variantId_locationId: { variantId, locationId },
        },
        data: { lowStockThreshold: threshold },
      });
    });
  });
});
