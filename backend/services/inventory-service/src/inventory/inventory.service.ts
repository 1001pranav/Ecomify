import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { EventPublisher } from '../events/event-publisher.service';
import { ReserveInventoryCommand } from './commands/reserve-inventory.command';
import { ReleaseInventoryCommand } from './commands/release-inventory.command';
import { AdjustInventoryCommand } from './commands/adjust-inventory.command';
import { ReserveInventoryDto } from './dto/reserve-inventory.dto';
import { AdjustInventoryDto } from './dto/adjust-inventory.dto';
import { TransferInventoryDto } from './dto/transfer-inventory.dto';
import { ReservationStatus } from '@prisma/client';

/**
 * Repository Pattern: Inventory Service
 * Command Pattern: Uses command objects for operations
 */
@Injectable()
export class InventoryService {
  constructor(
    private prisma: PrismaService,
    private eventPublisher: EventPublisher,
  ) {}

  /**
   * Reserve inventory for an order
   */
  async reserveInventory(dto: ReserveInventoryDto) {
    const command = new ReserveInventoryCommand(
      this.prisma,
      this.eventPublisher,
      dto,
    );
    return command.execute();
  }

  /**
   * Release reservation by order ID
   */
  async releaseReservationByOrder(orderId: string) {
    const command = new ReleaseInventoryCommand(
      this.prisma,
      this.eventPublisher,
      orderId,
    );
    return command.execute();
  }

  /**
   * Fulfill reservation (mark as fulfilled, don't restore inventory)
   */
  async fulfillReservationByOrder(orderId: string) {
    const reservations = await this.prisma.inventoryReservation.findMany({
      where: {
        orderId,
        status: ReservationStatus.ACTIVE,
      },
    });

    if (reservations.length === 0) {
      return { success: true, message: 'No active reservations found' };
    }

    // Mark reservations as fulfilled and deduct from committed
    for (const reservation of reservations) {
      await this.prisma.$transaction(async (tx) => {
        // Deduct from committed (already removed from available during reservation)
        await tx.inventoryItem.update({
          where: {
            variantId_locationId: {
              variantId: reservation.variantId,
              locationId: reservation.locationId,
            },
          },
          data: {
            committed: { decrement: reservation.quantity },
          },
        });

        // Mark reservation as fulfilled
        await tx.inventoryReservation.update({
          where: { id: reservation.id },
          data: { status: ReservationStatus.FULFILLED },
        });
      });
    }

    await this.eventPublisher.publish('inventory.fulfilled', {
      orderId,
      reservations: reservations.map((r) => ({
        variantId: r.variantId,
        locationId: r.locationId,
        quantity: r.quantity,
      })),
    });

    return { success: true, fulfilled: reservations.length };
  }

  /**
   * Adjust inventory levels
   */
  async adjustInventory(dto: AdjustInventoryDto) {
    const command = new AdjustInventoryCommand(
      this.prisma,
      this.eventPublisher,
      dto,
    );
    return command.execute();
  }

  /**
   * Transfer inventory between locations
   */
  async transferInventory(dto: TransferInventoryDto) {
    await this.prisma.$transaction(async (tx) => {
      // Deduct from source location
      const fromItem = await tx.inventoryItem.findUnique({
        where: {
          variantId_locationId: {
            variantId: dto.variantId,
            locationId: dto.fromLocationId,
          },
        },
      });

      if (!fromItem || fromItem.available < dto.quantity) {
        throw new NotFoundException('Insufficient inventory at source location');
      }

      await tx.inventoryItem.update({
        where: {
          variantId_locationId: {
            variantId: dto.variantId,
            locationId: dto.fromLocationId,
          },
        },
        data: { available: { decrement: dto.quantity } },
      });

      // Add to destination location
      await tx.inventoryItem.upsert({
        where: {
          variantId_locationId: {
            variantId: dto.variantId,
            locationId: dto.toLocationId,
          },
        },
        update: {
          available: { increment: dto.quantity },
        },
        create: {
          variantId: dto.variantId,
          locationId: dto.toLocationId,
          available: dto.quantity,
          committed: 0,
          incoming: 0,
        },
      });

      // Record adjustments
      await tx.inventoryAdjustment.createMany({
        data: [
          {
            variantId: dto.variantId,
            locationId: dto.fromLocationId,
            quantity: -dto.quantity,
            reason: 'transfer_out',
            notes: `Transferred to ${dto.toLocationId}`,
          },
          {
            variantId: dto.variantId,
            locationId: dto.toLocationId,
            quantity: dto.quantity,
            reason: 'transfer_in',
            notes: `Transferred from ${dto.fromLocationId}`,
          },
        ],
      });
    });

    await this.eventPublisher.publish('inventory.transferred', {
      variantId: dto.variantId,
      fromLocationId: dto.fromLocationId,
      toLocationId: dto.toLocationId,
      quantity: dto.quantity,
    });

    return { success: true };
  }

  /**
   * Get inventory for a variant across all locations
   */
  async getInventoryByVariant(variantId: string) {
    const items = await this.prisma.inventoryItem.findMany({
      where: { variantId },
      include: { location: true },
    });

    const total = items.reduce(
      (acc, item) => ({
        available: acc.available + item.available,
        committed: acc.committed + item.committed,
        incoming: acc.incoming + item.incoming,
      }),
      { available: 0, committed: 0, incoming: 0 }
    );

    return {
      variantId,
      total,
      locations: items.map((item) => ({
        locationId: item.locationId,
        locationName: item.location.name,
        available: item.available,
        committed: item.committed,
        incoming: item.incoming,
      })),
    };
  }

  /**
   * Get inventory at a specific location
   */
  async getInventoryByLocation(locationId: string, page = 1, limit = 50) {
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.inventoryItem.findMany({
        where: { locationId },
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
      }),
      this.prisma.inventoryItem.count({ where: { locationId } }),
    ]);

    return {
      items,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }

  /**
   * Get adjustment history
   */
  async getAdjustmentHistory(
    variantId?: string,
    locationId?: string,
    page = 1,
    limit = 50,
  ) {
    const where: any = {};
    if (variantId) where.variantId = variantId;
    if (locationId) where.locationId = locationId;

    const skip = (page - 1) * limit;

    const [adjustments, total] = await Promise.all([
      this.prisma.inventoryAdjustment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.inventoryAdjustment.count({ where }),
    ]);

    return {
      adjustments,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }
}
