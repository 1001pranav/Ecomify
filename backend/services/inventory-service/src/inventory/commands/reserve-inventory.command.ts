import { PrismaService } from '../../database/prisma.service';
import { EventPublisher } from '../../events/event-publisher.service';
import { IInventoryCommand } from './inventory-command.interface';
import { BadRequestException } from '@nestjs/common';
import { ReservationStatus } from '@prisma/client';

interface ReserveInventoryParams {
  orderId: string;
  items: Array<{
    variantId: string;
    quantity: number;
    locationId?: string;
  }>;
}

/**
 * Command Pattern: Reserve Inventory Command
 * Encapsulates the logic for reserving inventory
 */
export class ReserveInventoryCommand implements IInventoryCommand {
  constructor(
    private prisma: PrismaService,
    private eventPublisher: EventPublisher,
    private params: ReserveInventoryParams,
  ) {}

  async execute() {
    const reservations = [];

    for (const item of this.params.items) {
      // Find location with available inventory
      const location = await this.findAvailableLocation(
        item.variantId,
        item.quantity,
        item.locationId,
      );

      if (!location) {
        throw new BadRequestException(
          `Insufficient inventory for variant ${item.variantId}`
        );
      }

      // Reserve inventory
      await this.prisma.$transaction(async (tx) => {
        // Deduct from available and add to committed
        await tx.inventoryItem.update({
          where: {
            variantId_locationId: {
              variantId: item.variantId,
              locationId: location.locationId,
            },
          },
          data: {
            available: { decrement: item.quantity },
            committed: { increment: item.quantity },
          },
        });

        // Create reservation record
        const reservation = await tx.inventoryReservation.create({
          data: {
            orderId: this.params.orderId,
            variantId: item.variantId,
            locationId: location.locationId,
            quantity: item.quantity,
            status: ReservationStatus.ACTIVE,
          },
        });

        reservations.push(reservation);
      });
    }

    // Publish event
    await this.eventPublisher.publish('inventory.reserved', {
      orderId: this.params.orderId,
      reservations: reservations.map((r) => ({
        variantId: r.variantId,
        locationId: r.locationId,
        quantity: r.quantity,
      })),
    });

    return {
      success: true,
      reservations,
    };
  }

  private async findAvailableLocation(
    variantId: string,
    quantity: number,
    preferredLocationId?: string,
  ) {
    // If preferred location specified, try it first
    if (preferredLocationId) {
      const item = await this.prisma.inventoryItem.findUnique({
        where: {
          variantId_locationId: {
            variantId,
            locationId: preferredLocationId,
          },
        },
      });

      if (item && item.available >= quantity) {
        return item;
      }
    }

    // Find any location with available inventory, ordered by priority
    const items = await this.prisma.inventoryItem.findMany({
      where: {
        variantId,
        available: { gte: quantity },
        location: { isActive: true },
      },
      include: {
        location: true,
      },
      orderBy: {
        location: { priority: 'desc' },
      },
    });

    return items.length > 0 ? items[0] : null;
  }
}
