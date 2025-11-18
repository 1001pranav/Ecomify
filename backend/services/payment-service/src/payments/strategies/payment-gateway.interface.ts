/**
 * Strategy Pattern: Payment Gateway Interface
 * Defines the contract for different payment gateway implementations
 */
export interface PaymentIntent {
  id: string;
  clientSecret: string;
  amount: number;
  currency: string;
  status: string;
}

export interface PaymentResult {
  success: boolean;
  transactionId: string;
  amount: number;
  currency: string;
  status: string;
  rawResponse?: any;
  error?: string;
}

export interface RefundResult {
  success: boolean;
  refundId: string;
  amount: number;
  status: string;
  rawResponse?: any;
  error?: string;
}

export interface IPaymentGateway {
  /**
   * Create a payment intent
   */
  createIntent(
    amount: number,
    currency: string,
    metadata?: Record<string, any>
  ): Promise<PaymentIntent>;

  /**
   * Capture a payment
   */
  capturePayment(intentId: string): Promise<PaymentResult>;

  /**
   * Process a refund
   */
  refundPayment(
    transactionId: string,
    amount: number,
    reason?: string
  ): Promise<RefundResult>;

  /**
   * Verify webhook signature
   */
  verifyWebhook(payload: any, signature: string): any;
}
