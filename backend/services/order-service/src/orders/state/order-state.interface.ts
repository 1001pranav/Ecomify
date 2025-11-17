/**
 * State Pattern - Order State Interface
 * Defines the interface for different order states
 */
export interface OrderState {
  canTransitionTo(newFinancialStatus?: string, newFulfillmentStatus?: string): boolean;
  getValidTransitions(): {
    financialStatus: string[];
    fulfillmentStatus: string[];
  };
}

export interface OrderContext {
  financialStatus: string;
  fulfillmentStatus: string;
}
