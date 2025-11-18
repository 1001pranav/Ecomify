import { Module } from '@nestjs/common';
import { EventCollectorService } from './event-collector.service';
import { EventSubscribersService } from './event-subscribers.service';

@Module({
  providers: [EventCollectorService, EventSubscribersService],
  exports: [EventCollectorService],
})
export class EventsModule {}
