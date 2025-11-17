import { Injectable, BadRequestException } from '@nestjs/common';
import { OrderContext } from './order-state.interface';

/**
 * State Pattern - Order State Machine
 * Manages valid state transitions for orders
 * Ensures business rules are enforced
 */
@Injectable()
export class OrderStateMachineService {
  /**
   * Valid financial status transitions
   */
  private readonly financialStatusTransitions: Record<string, string[]> = {
    PENDING: ['AUTHORIZED', 'PAID', 'VOIDED'],
    AUTHORIZED: ['PAID', 'VOIDED'],
    PAID: ['PARTIALLY_REFUNDED', 'REFUNDED'],
    PARTIALLY_REFUNDED: ['REFUNDED'],
    REFUNDED: [],
    VOIDED: [],
  };

  /**
   * Valid fulfillment status transitions
   */
  private readonly fulfillmentStatusTransitions: Record<string, string[]> = {
    UNFULFILLED: ['PARTIALLY_FULFILLED', 'FULFILLED'],
    PARTIALLY_FULFILLED: ['FULFILLED'],
    FULFILLED: [],
  };

  /**
   * Validates if a state transition is allowed
   */
  canTransition(
    currentContext: OrderContext,
    newFinancialStatus?: string,
    newFulfillmentStatus?: string,
  ): boolean {
    // Check financial status transition
    if (newFinancialStatus && newFinancialStatus !== currentContext.financialStatus) {
      const allowedTransitions = this.financialStatusTransitions[currentContext.financialStatus] || [];
      if (!allowedTransitions.includes(newFinancialStatus)) {
        return false;
      }
    }

    // Check fulfillment status transition
    if (newFulfillmentStatus && newFulfillmentStatus !== currentContext.fulfillmentStatus) {
      const allowedTransitions = this.fulfillmentStatusTransitions[currentContext.fulfillmentStatus] || [];
      if (!allowedTransitions.includes(newFulfillmentStatus)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Validates and throws error if transition is invalid
   */
  validateTransition(
    currentContext: OrderContext,
    newFinancialStatus?: string,
    newFulfillmentStatus?: string,
  ): void {
    if (!this.canTransition(currentContext, newFinancialStatus, newFulfillmentStatus)) {
      const message = this.getTransitionErrorMessage(currentContext, newFinancialStatus, newFulfillmentStatus);
      throw new BadRequestException(message);
    }
  }

  /**
   * Gets valid transitions for current state
   */
  getValidTransitions(currentContext: OrderContext): {
    financialStatus: string[];
    fulfillmentStatus: string[];
  } {
    return {
      financialStatus: this.financialStatusTransitions[currentContext.financialStatus] || [],
      fulfillmentStatus: this.fulfillmentStatusTransitions[currentContext.fulfillmentStatus] || [],
    };
  }

  /**
   * Generates error message for invalid transition
   */
  private getTransitionErrorMessage(
    currentContext: OrderContext,
    newFinancialStatus?: string,
    newFulfillmentStatus?: string,
  ): string {
    const parts = [];

    if (newFinancialStatus && newFinancialStatus !== currentContext.financialStatus) {
      const allowedTransitions = this.financialStatusTransitions[currentContext.financialStatus] || [];
      parts.push(
        `Cannot transition financial status from ${currentContext.financialStatus} to ${newFinancialStatus}. ` +
        `Allowed transitions: ${allowedTransitions.join(', ') || 'none'}`,
      );
    }

    if (newFulfillmentStatus && newFulfillmentStatus !== currentContext.fulfillmentStatus) {
      const allowedTransitions = this.fulfillmentStatusTransitions[currentContext.fulfillmentStatus] || [];
      parts.push(
        `Cannot transition fulfillment status from ${currentContext.fulfillmentStatus} to ${newFulfillmentStatus}. ` +
        `Allowed transitions: ${allowedTransitions.join(', ') || 'none'}`,
      );
    }

    return parts.join(' ');
  }

  /**
   * Checks if order can be cancelled
   */
  canCancelOrder(context: OrderContext): boolean {
    // Can cancel if not already refunded or voided
    return !['REFUNDED', 'VOIDED'].includes(context.financialStatus);
  }

  /**
   * Checks if order can be fulfilled
   */
  canFulfillOrder(context: OrderContext): boolean {
    // Can fulfill if payment is authorized or paid
    return ['AUTHORIZED', 'PAID'].includes(context.financialStatus);
  }

  /**
   * Checks if order can be refunded
   */
  canRefundOrder(context: OrderContext): boolean {
    // Can refund if paid or partially refunded
    return ['PAID', 'PARTIALLY_REFUNDED'].includes(context.financialStatus);
  }
}
