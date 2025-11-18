import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

/**
 * Observer Pattern: Collects and stores events from all business services
 * Repository Pattern: Handles data persistence
 */
@Injectable()
export class EventCollectorService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Collect and store an analytics event
   */
  async collectEvent(
    storeId: string,
    eventType: string,
    eventData: Record<string, any>,
  ): Promise<void> {
    try {
      await this.prisma.analyticsEvent.create({
        data: {
          storeId,
          eventType,
          eventData,
          timestamp: new Date(),
        },
      });
    } catch (error) {
      console.error('Error collecting event:', error);
      // Don't throw - analytics should never break the main flow
    }
  }

  /**
   * Get events by store and type
   */
  async getEvents(
    storeId: string,
    eventType?: string,
    startDate?: Date,
    endDate?: Date,
  ) {
    return this.prisma.analyticsEvent.findMany({
      where: {
        storeId,
        ...(eventType && { eventType }),
        timestamp: {
          ...(startDate && { gte: startDate }),
          ...(endDate && { lte: endDate }),
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
    });
  }

  /**
   * Clean up old events (data retention)
   */
  async cleanupOldEvents(daysToKeep: number = 90): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    await this.prisma.analyticsEvent.deleteMany({
      where: {
        timestamp: {
          lt: cutoffDate,
        },
      },
    });
  }
}
