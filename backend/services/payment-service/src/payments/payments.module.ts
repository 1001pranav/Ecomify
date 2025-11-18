import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { StripeGatewayStrategy } from './strategies/stripe-gateway.strategy';
import { PaymentGatewayFactory } from './strategies/payment-gateway.factory';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [EventsModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, StripeGatewayStrategy, PaymentGatewayFactory],
  exports: [PaymentGatewayFactory],
})
export class PaymentsModule {}
