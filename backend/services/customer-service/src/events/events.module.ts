import { Module } from '@nestjs/common';
import { EventSubscribersService } from './event-subscribers.service';
import { CustomersModule } from '../customers/customers.module';

@Module({
  imports: [CustomersModule],
  providers: [EventSubscribersService],
})
export class EventsModule {}
