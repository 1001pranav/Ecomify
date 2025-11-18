import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

/**
 * Saga Pattern - Orchestrator
 * Manages distributed transactions across multiple services
 * Implements compensation logic for rollback on failures
 *
 * Saga Steps for Order Creation:
 * 1. Create order (Pending)
 * 2. Reserve inventory → Success/Rollback
 * 3. Calculate shipping → Success/Rollback
 * 4. Calculate tax → Success/Rollback
 * 5. Create payment intent → Success/Rollback
 * 6. Update order status → Confirmed
 */
@Injectable()
export class SagaOrchestratorService {
  private readonly logger = new Logger(SagaOrchestratorService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Executes the Order Creation Saga
   */
  async executeOrderCreationSaga(orderData: any): Promise<any> {
    const sagaId = await this.createSagaExecution('order_creation', orderData);

    try {
      // Step 1: Create Order
      await this.executeStep(sagaId, 'create_order', async () => {
        return { orderId: orderData.id, status: 'created' };
      });

      // Step 2: Reserve Inventory
      await this.executeStep(sagaId, 'reserve_inventory', async () => {
        // TODO: Call Inventory Service to reserve items
        // For now, simulate success
        this.logger.log('Reserving inventory for order');
        return { reserved: true };
      });

      // Step 3: Calculate Shipping
      await this.executeStep(sagaId, 'calculate_shipping', async () => {
        // TODO: Call Shipping Service to calculate shipping cost
        // For now, use the provided shipping cost
        this.logger.log('Calculating shipping');
        return { shippingCost: orderData.totalShipping };
      });

      // Step 4: Calculate Tax
      await this.executeStep(sagaId, 'calculate_tax', async () => {
        // TODO: Call Tax Service to calculate tax
        // For now, use the provided tax amount
        this.logger.log('Calculating tax');
        return { taxAmount: orderData.totalTax };
      });

      // Step 5: Create Payment Intent
      await this.executeStep(sagaId, 'create_payment_intent', async () => {
        // TODO: Call Payment Service to create payment intent
        // For now, simulate success
        this.logger.log('Creating payment intent');
        return { paymentIntentId: 'pi_mock_' + Date.now() };
      });

      // Mark saga as completed
      await this.completeSaga(sagaId);

      return { success: true, sagaId };
    } catch (error) {
      this.logger.error(`Saga execution failed: ${error.message}`);
      await this.compensate(sagaId, error);
      throw error;
    }
  }

  /**
   * Executes the Order Cancellation Saga
   */
  async executeOrderCancellationSaga(orderId: string): Promise<any> {
    const sagaId = await this.createSagaExecution('order_cancellation', { orderId });

    try {
      // Step 1: Cancel Order
      await this.executeStep(sagaId, 'cancel_order', async () => {
        return { orderId, status: 'cancelled' };
      });

      // Step 2: Release Inventory
      await this.executeStep(sagaId, 'release_inventory', async () => {
        // TODO: Call Inventory Service to release reserved items
        this.logger.log('Releasing inventory for cancelled order');
        return { released: true };
      });

      // Step 3: Refund Payment (if applicable)
      await this.executeStep(sagaId, 'refund_payment', async () => {
        // TODO: Call Payment Service to process refund
        this.logger.log('Processing refund for cancelled order');
        return { refunded: true };
      });

      await this.completeSaga(sagaId);

      return { success: true, sagaId };
    } catch (error) {
      this.logger.error(`Cancellation saga failed: ${error.message}`);
      await this.compensate(sagaId, error);
      throw error;
    }
  }

  /**
   * Creates a new saga execution record
   */
  private async createSagaExecution(sagaType: string, context: any): Promise<string> {
    const saga = await this.prisma.sagaExecution.create({
      data: {
        sagaType,
        currentStep: 'initialized',
        status: 'in_progress',
        steps: [],
        compensations: [],
        context,
      },
    });

    return saga.id;
  }

  /**
   * Executes a single step in the saga
   */
  private async executeStep(
    sagaId: string,
    stepName: string,
    stepFunction: () => Promise<any>,
  ): Promise<void> {
    this.logger.log(`Executing step: ${stepName}`);

    try {
      const result = await stepFunction();

      // Update saga with completed step
      await this.prisma.sagaExecution.update({
        where: { id: sagaId },
        data: {
          currentStep: stepName,
          steps: {
            push: {
              name: stepName,
              status: 'completed',
              result,
              timestamp: new Date(),
            },
          },
        },
      });
    } catch (error) {
      // Update saga with failed step
      await this.prisma.sagaExecution.update({
        where: { id: sagaId },
        data: {
          currentStep: stepName,
          status: 'failed',
          error: error.message,
          steps: {
            push: {
              name: stepName,
              status: 'failed',
              error: error.message,
              timestamp: new Date(),
            },
          },
        },
      });

      throw error;
    }
  }

  /**
   * Compensates (rolls back) completed steps on failure
   */
  private async compensate(sagaId: string, error: any): Promise<void> {
    this.logger.log(`Starting compensation for saga: ${sagaId}`);

    await this.prisma.sagaExecution.update({
      where: { id: sagaId },
      data: {
        status: 'compensating',
      },
    });

    const saga = await this.prisma.sagaExecution.findUnique({
      where: { id: sagaId },
    });

    // Get completed steps
    const steps = saga.steps as any[];
    const completedSteps = steps.filter(s => s.status === 'completed');

    // Execute compensations in reverse order
    for (let i = completedSteps.length - 1; i >= 0; i--) {
      const step = completedSteps[i];
      await this.compensateStep(sagaId, step.name);
    }

    await this.prisma.sagaExecution.update({
      where: { id: sagaId },
      data: {
        status: 'failed',
      },
    });
  }

  /**
   * Compensates a single step
   */
  private async compensateStep(sagaId: string, stepName: string): Promise<void> {
    this.logger.log(`Compensating step: ${stepName}`);

    try {
      switch (stepName) {
        case 'reserve_inventory':
          // Release reserved inventory
          this.logger.log('Releasing reserved inventory');
          break;
        case 'create_payment_intent':
          // Cancel payment intent
          this.logger.log('Cancelling payment intent');
          break;
        // Add more compensations as needed
      }

      await this.prisma.sagaExecution.update({
        where: { id: sagaId },
        data: {
          compensations: {
            push: {
              stepName,
              status: 'completed',
              timestamp: new Date(),
            },
          },
        },
      });
    } catch (error) {
      this.logger.error(`Compensation failed for step ${stepName}: ${error.message}`);
    }
  }

  /**
   * Marks saga as completed
   */
  private async completeSaga(sagaId: string): Promise<void> {
    await this.prisma.sagaExecution.update({
      where: { id: sagaId },
      data: {
        status: 'completed',
        completedAt: new Date(),
      },
    });
  }
}
