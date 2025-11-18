import { PrismaService } from '../../database/prisma.service';
import { EventPublisher } from '../../events/event-publisher.service';
import { IInventoryCommand } from './inventory-command.interface';
import { ReservationStatus } from '@prisma/client';

/**
 * Command Pattern: Release Inventory Command
 * Encapsulates the logic for releasing reserved inventory
 */
export class ReleaseInventoryCommand implements IInventoryCommand {
  constructor(
    private prisma: PrismaService,
    private eventPublisher: EventPublisher,
    private orderId: string,
  ) {}

  async execute() {
    // Find all active reservations for the order
    const reservations = await this.prisma.inventoryReservation.findMany({
      where: {
        orderId: this.orderId,
        status: ReservationStatus.ACTIVE,
      },
    });

    if (reservations.length === 0) {
      return { success: true, message: 'No active reservations found' };
    }

    // Release each reservation
    for (const reservation of reservations) {
      await this.prisma.$transaction(async (tx) => {
        // Add back to available and deduct from committed
        await tx.inventoryItem.update({
          where: {
            variantId_locationId: {
              variantId: reservation.variantId,
              locationId: reservation.locationId,
            },
          },
          data: {
            available: { increment: reservation.quantity },
            committed: { decrement: reservation.quantity },
          },
        });

        // Mark reservation as released
        await tx.inventoryReservation.update({
          where: { id: reservation.id },
          data: { status: ReservationStatus.RELEASED },
        });
      });
    }

    // Publish event
    await this.eventPublisher.publish('inventory.released', {
      orderId: this.orderId,
      reservations: reservations.map((r) => ({
        variantId: r.variantId,
        locationId: r.locationId,
        quantity: r.quantity,
      })),
    });

    return {
      success: true,
      released: reservations.length,
    };
  }
}
