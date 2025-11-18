import { Injectable } from '@nestjs/common';
import { IPaymentGateway } from './payment-gateway.interface';
import { StripeGatewayStrategy } from './stripe-gateway.strategy';

/**
 * Factory Pattern: Payment Gateway Factory
 * Creates and returns appropriate payment gateway strategy based on gateway name
 */
@Injectable()
export class PaymentGatewayFactory {
  private strategies: Map<string, IPaymentGateway> = new Map();

  constructor(private stripeGateway: StripeGatewayStrategy) {
    // Register available gateways
    this.strategies.set('stripe', stripeGateway);
  }

  /**
   * Get payment gateway by name
   * @param gateway - Gateway name (e.g., 'stripe', 'paypal')
   */
  getGateway(gateway: string): IPaymentGateway {
    const gatewayStrategy = this.strategies.get(gateway.toLowerCase());
    if (!gatewayStrategy) {
      throw new Error(`Payment gateway '${gateway}' is not supported`);
    }
    return gatewayStrategy;
  }

  /**
   * Register a new payment gateway
   */
  registerGateway(name: string, strategy: IPaymentGateway) {
    this.strategies.set(name.toLowerCase(), strategy);
  }

  /**
   * Get all available gateways
   */
  getAvailableGateways(): string[] {
    return Array.from(this.strategies.keys());
  }
}
