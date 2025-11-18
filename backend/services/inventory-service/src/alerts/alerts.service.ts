import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { EventPublisher } from '../events/event-publisher.service';
import { AlertStatus } from '@prisma/client';

/**
 * Low Stock Alert Service
 * Monitors inventory levels and triggers alerts
 */
@Injectable()
export class AlertsService {
  private readonly defaultThreshold: number;

  constructor(
    private prisma: PrismaService,
    private eventPublisher: EventPublisher,
  ) {
    this.defaultThreshold = parseInt(process.env.LOW_STOCK_THRESHOLD || '10');
  }

  /**
   * Check and create low stock alerts
   */
  async checkLowStock() {
    const items = await this.prisma.inventoryItem.findMany({
      include: { location: true },
    });

    for (const item of items) {
      const threshold = item.lowStockThreshold || this.defaultThreshold;

      if (item.available <= threshold) {
        // Check if alert already exists
        const existingAlert = await this.prisma.lowStockAlert.findFirst({
          where: {
            variantId: item.variantId,
            locationId: item.locationId,
            status: AlertStatus.ACTIVE,
          },
        });

        if (!existingAlert) {
          // Create new alert
          const alert = await this.prisma.lowStockAlert.create({
            data: {
              storeId: item.location.storeId,
              variantId: item.variantId,
              locationId: item.locationId,
              currentStock: item.available,
              threshold,
              status: AlertStatus.ACTIVE,
            },
          });

          // Publish event
          await this.eventPublisher.publish('inventory.low_stock', {
            alertId: alert.id,
            storeId: alert.storeId,
            variantId: alert.variantId,
            locationId: alert.locationId,
            currentStock: alert.currentStock,
            threshold: alert.threshold,
          });

          console.log(`⚠️  Low stock alert created for variant ${item.variantId} at location ${item.locationId}`);
        }
      } else {
        // Resolve alert if stock is above threshold
        await this.prisma.lowStockAlert.updateMany({
          where: {
            variantId: item.variantId,
            locationId: item.locationId,
            status: AlertStatus.ACTIVE,
          },
          data: {
            status: AlertStatus.RESOLVED,
            resolvedAt: new Date(),
          },
        });
      }
    }
  }

  /**
   * Get active alerts for a store
   */
  async getActiveAlerts(storeId: string) {
    return this.prisma.lowStockAlert.findMany({
      where: {
        storeId,
        status: AlertStatus.ACTIVE,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get alert history
   */
  async getAlertHistory(storeId: string, page = 1, limit = 50) {
    const skip = (page - 1) * limit;

    const [alerts, total] = await Promise.all([
      this.prisma.lowStockAlert.findMany({
        where: { storeId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.lowStockAlert.count({ where: { storeId } }),
    ]);

    return {
      alerts,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }

  /**
   * Dismiss an alert
   */
  async dismissAlert(id: string) {
    return this.prisma.lowStockAlert.update({
      where: { id },
      data: {
        status: AlertStatus.DISMISSED,
        resolvedAt: new Date(),
      },
    });
  }

  /**
   * Update low stock threshold for a variant at a location
   */
  async updateThreshold(variantId: string, locationId: string, threshold: number) {
    return this.prisma.inventoryItem.update({
      where: {
        variantId_locationId: {
          variantId,
          locationId,
        },
      },
      data: {
        lowStockThreshold: threshold,
      },
    });
  }
}
