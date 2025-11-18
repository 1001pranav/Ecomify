import { Module } from '@nestjs/common';
import { WebhooksController } from './webhooks.controller';
import { PaymentsModule } from '../payments/payments.module';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [PaymentsModule, EventsModule],
  controllers: [WebhooksController],
})
export class WebhooksModule {}
