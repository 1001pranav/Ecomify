import { Module } from '@nestjs/common';
import { EventPublisher } from './event-publisher.service';
import { EventSubscriber } from './event-subscriber.service';

@Module({
  providers: [EventPublisher, EventSubscriber],
  exports: [EventPublisher, EventSubscriber],
})
export class EventsModule {}
