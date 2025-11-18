import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { OrderRepository } from './order.repository';
import { OrderNumberFactory } from './patterns/order-number.factory';
import { OrderBuilder } from './patterns/order.builder';
import { SagaOrchestratorService } from './saga/saga-orchestrator.service';
import { OrderStateMachineService } from './state/order-state-machine.service';
import { EventPublisherService } from '../events/event-publisher.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { CancelOrderDto } from './dto/cancel-order.dto';
import { CreateRefundDto } from './dto/create-refund.dto';
import { SearchOrdersDto } from './dto/search-orders.dto';

/**
 * Order Service
 * Orchestrates all order-related operations using design patterns:
 * - Factory Pattern: Order number generation
 * - Builder Pattern: Order construction
 * - Repository Pattern: Data access
 * - Saga Pattern: Distributed transactions
 * - State Pattern: Status management
 * - Observer Pattern: Event publishing
 */
@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly orderNumberFactory: OrderNumberFactory,
    private readonly orderBuilder: OrderBuilder,
    private readonly sagaOrchestrator: SagaOrchestratorService,
    private readonly stateMachine: OrderStateMachineService,
    private readonly eventPublisher: EventPublisherService,
  ) {}

  /**
   * Creates a new order using Builder Pattern and Saga Pattern
   */
  async createOrder(dto: CreateOrderDto): Promise<any> {
    this.logger.log('Creating new order');

    try {
      // Use Factory Pattern to generate order number
      const orderNumber = this.orderNumberFactory.generate();

      // Use Builder Pattern to construct order
      const orderBuilder = this.orderBuilder
        .reset()
        .setOrderNumber(orderNumber)
        .setStoreId(dto.storeId)
        .setEmail(dto.email)
        .setShippingAddress(dto.shippingAddress)
        .setBillingAddress(dto.billingAddress)
        .setCurrency(dto.currency || 'USD');

      // Set optional fields
      if (dto.customerId) {
        orderBuilder.setCustomerId(dto.customerId);
      }
      if (dto.phone) {
        orderBuilder.setPhone(dto.phone);
      }
      if (dto.note) {
        orderBuilder.setNote(dto.note);
      }
      if (dto.tags) {
        orderBuilder.setTags(dto.tags);
      }

      // Add line items
      dto.lineItems.forEach(item => {
        orderBuilder.addLineItem(item);
      });

      // Set financial details
      if (dto.shippingRate) {
        orderBuilder.setShippingCost(dto.shippingRate);
      }
      if (dto.taxAmount) {
        orderBuilder.setTaxAmount(dto.taxAmount);
      }
      if (dto.discountAmount) {
        orderBuilder.setDiscountAmount(dto.discountAmount);
      }

      // Build the order
      const orderData = orderBuilder.build();

      // Use Repository Pattern to persist order
      const order = await this.orderRepository.create(orderData);

      // Use Saga Pattern for distributed transaction
      await this.sagaOrchestrator.executeOrderCreationSaga(order);

      // Use Observer Pattern to publish event
      await this.eventPublisher.publishOrderCreated(order);

      return order;
    } catch (error) {
      this.logger.error('Failed to create order', error);
      throw error;
    }
  }

  /**
   * Finds an order by ID
   */
  async findOrderById(id: string): Promise<any> {
    const order = await this.orderRepository.findById(id);
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    return order;
  }

  /**
   * Finds an order by order number
   */
  async findOrderByNumber(orderNumber: string): Promise<any> {
    const order = await this.orderRepository.findByOrderNumber(orderNumber);
    if (!order) {
      throw new NotFoundException(`Order with number ${orderNumber} not found`);
    }
    return order;
  }

  /**
   * Updates order status using State Pattern
   */
  async updateOrderStatus(id: string, dto: UpdateOrderStatusDto): Promise<any> {
    const order = await this.findOrderById(id);

    // Use State Pattern to validate transition
    this.stateMachine.validateTransition(
      {
        financialStatus: order.financialStatus,
        fulfillmentStatus: order.fulfillmentStatus,
      },
      dto.financialStatus,
      dto.fulfillmentStatus,
    );

    // Store previous status for event
    const previousStatus = {
      financialStatus: order.financialStatus,
      fulfillmentStatus: order.fulfillmentStatus,
    };

    // Update the order
    const updateData: any = {};
    if (dto.financialStatus) {
      updateData.financialStatus = dto.financialStatus;
    }
    if (dto.fulfillmentStatus) {
      updateData.fulfillmentStatus = dto.fulfillmentStatus;
    }

    const updatedOrder = await this.orderRepository.update(id, updateData);

    // Create status history entry
    await this.orderRepository.createStatusHistory({
      orderId: id,
      previousFinancialStatus: previousStatus.financialStatus,
      newFinancialStatus: dto.financialStatus,
      previousFulfillmentStatus: previousStatus.fulfillmentStatus,
      newFulfillmentStatus: dto.fulfillmentStatus,
      comment: dto.comment,
    });

    // Publish event
    await this.eventPublisher.publishOrderStatusChanged(updatedOrder, previousStatus);

    return updatedOrder;
  }

  /**
   * Cancels an order using State Pattern and Saga Pattern
   */
  async cancelOrder(id: string, dto: CancelOrderDto): Promise<any> {
    const order = await this.findOrderById(id);

    // Check if order can be cancelled
    if (!this.stateMachine.canCancelOrder({
      financialStatus: order.financialStatus,
      fulfillmentStatus: order.fulfillmentStatus,
    })) {
      throw new BadRequestException('Order cannot be cancelled in current state');
    }

    // Use Saga Pattern for cancellation
    await this.sagaOrchestrator.executeOrderCancellationSaga(id);

    // Update order status
    const updatedOrder = await this.orderRepository.update(id, {
      financialStatus: dto.refund ? 'REFUNDED' : 'VOIDED',
    });

    // Publish event
    await this.eventPublisher.publishOrderCancelled(updatedOrder, dto.reason);

    return updatedOrder;
  }

  /**
   * Creates a refund for an order
   */
  async createRefund(id: string, dto: CreateRefundDto): Promise<any> {
    const order = await this.findOrderById(id);

    // Check if order can be refunded
    if (!this.stateMachine.canRefundOrder({
      financialStatus: order.financialStatus,
      fulfillmentStatus: order.fulfillmentStatus,
    })) {
      throw new BadRequestException('Order cannot be refunded in current state');
    }

    // Validate refund amount
    if (dto.amount > parseFloat(order.totalPrice.toString())) {
      throw new BadRequestException('Refund amount cannot exceed order total');
    }

    // Create refund
    const refund = await this.orderRepository.createRefund({
      orderId: id,
      amount: dto.amount,
      reason: dto.reason,
      restockItems: dto.restockItems,
    });

    // Update order financial status
    const isFullRefund = dto.amount === parseFloat(order.totalPrice.toString());
    const newStatus = isFullRefund ? 'REFUNDED' : 'PARTIALLY_REFUNDED';

    await this.orderRepository.update(id, {
      financialStatus: newStatus,
    });

    // Publish event
    await this.eventPublisher.publishOrderRefunded(refund);

    return refund;
  }

  /**
   * Searches and filters orders
   */
  async searchOrders(dto: SearchOrdersDto): Promise<any> {
    const { orders, total } = await this.orderRepository.findMany({
      storeId: dto.storeId,
      customerId: dto.customerId,
      email: dto.email,
      financialStatus: dto.financialStatus,
      fulfillmentStatus: dto.fulfillmentStatus,
      search: dto.search,
      dateFrom: dto.dateFrom ? new Date(dto.dateFrom) : undefined,
      dateTo: dto.dateTo ? new Date(dto.dateTo) : undefined,
      tags: dto.tags,
      page: dto.page,
      limit: dto.limit,
      sortBy: dto.sortBy,
      sortOrder: dto.sortOrder,
    });

    return {
      orders,
      total,
      page: dto.page,
      limit: dto.limit,
      totalPages: Math.ceil(total / dto.limit),
    };
  }

  /**
   * Gets valid state transitions for an order
   */
  async getValidTransitions(id: string): Promise<any> {
    const order = await this.findOrderById(id);

    return this.stateMachine.getValidTransitions({
      financialStatus: order.financialStatus,
      fulfillmentStatus: order.fulfillmentStatus,
    });
  }
}
