import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { FulfillmentRepository } from './fulfillment.repository';
import { PrismaService } from '../database/prisma.service';
import { EventPublisherService } from '../events/event-publisher.service';
import { CreateFulfillmentDto } from './dto/create-fulfillment.dto';

@Injectable()
export class FulfillmentService {
  private readonly logger = new Logger(FulfillmentService.name);

  constructor(
    private readonly fulfillmentRepository: FulfillmentRepository,
    private readonly prisma: PrismaService,
    private readonly eventPublisher: EventPublisherService,
  ) {}

  async createFulfillment(orderId: string, dto: CreateFulfillmentDto): Promise<any> {
    // Get the order
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { lineItems: true },
    });

    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }

    // Validate that order is in a state that can be fulfilled
    if (!['AUTHORIZED', 'PAID'].includes(order.financialStatus)) {
      throw new BadRequestException(
        'Order must be authorized or paid before fulfillment',
      );
    }

    // Validate line items exist
    const lineItemIds = order.lineItems.map(item => item.id);
    const invalidItems = dto.lineItems.filter(
      item => !lineItemIds.includes(item.lineItemId),
    );

    if (invalidItems.length > 0) {
      throw new BadRequestException('Invalid line item IDs');
    }

    // Create fulfillment
    const fulfillment = await this.fulfillmentRepository.create({
      orderId,
      trackingNumber: dto.trackingNumber,
      trackingUrl: dto.trackingUrl,
      carrier: dto.carrier,
      lineItems: dto.lineItems,
      status: 'FULFILLED',
    });

    // Check if all items are fulfilled
    const allFulfilled = this.checkIfFullyFulfilled(order, dto.lineItems);

    // Update order fulfillment status
    const newStatus = allFulfilled ? 'FULFILLED' : 'PARTIALLY_FULFILLED';
    await this.prisma.order.update({
      where: { id: orderId },
      data: { fulfillmentStatus: newStatus },
    });

    // Publish event
    await this.eventPublisher.publishOrderFulfilled(fulfillment);

    return fulfillment;
  }

  async getFulfillmentsByOrderId(orderId: string): Promise<any[]> {
    return this.fulfillmentRepository.findByOrderId(orderId);
  }

  private checkIfFullyFulfilled(order: any, fulfilledItems: any[]): boolean {
    // Simple check: if all line items have been fulfilled
    // In production, this would need more complex logic to track quantities
    return fulfilledItems.length === order.lineItems.length;
  }
}
