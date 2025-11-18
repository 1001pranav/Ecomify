import { PrismaService } from '../../database/prisma.service';
import { EventPublisher } from '../../events/event-publisher.service';
import { IInventoryCommand } from './inventory-command.interface';

interface AdjustInventoryParams {
  variantId: string;
  locationId: string;
  quantity: number; // Can be negative
  reason: string;
  notes?: string;
  createdBy?: string;
}

/**
 * Command Pattern: Adjust Inventory Command
 * Encapsulates the logic for adjusting inventory levels
 */
export class AdjustInventoryCommand implements IInventoryCommand {
  constructor(
    private prisma: PrismaService,
    private eventPublisher: EventPublisher,
    private params: AdjustInventoryParams,
  ) {}

  async execute() {
    await this.prisma.$transaction(async (tx) => {
      // Update inventory item
      const item = await tx.inventoryItem.upsert({
        where: {
          variantId_locationId: {
            variantId: this.params.variantId,
            locationId: this.params.locationId,
          },
        },
        update: {
          available: { increment: this.params.quantity },
        },
        create: {
          variantId: this.params.variantId,
          locationId: this.params.locationId,
          available: Math.max(0, this.params.quantity),
          committed: 0,
          incoming: 0,
        },
      });

      // Record the adjustment
      await tx.inventoryAdjustment.create({
        data: {
          variantId: this.params.variantId,
          locationId: this.params.locationId,
          quantity: this.params.quantity,
          reason: this.params.reason,
          notes: this.params.notes,
          createdBy: this.params.createdBy,
        },
      });

      // Publish event
      await this.eventPublisher.publish('inventory.adjusted', {
        variantId: this.params.variantId,
        locationId: this.params.locationId,
        quantity: this.params.quantity,
        newAvailable: item.available + this.params.quantity,
        reason: this.params.reason,
      });
    });

    return { success: true };
  }
}
