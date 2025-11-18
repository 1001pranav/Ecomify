import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { DatabaseModule } from './database/database.module';
import { CustomersModule } from './customers/customers.module';
import { SegmentationModule } from './segmentation/segmentation.module';
import { EventsModule } from './events/events.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    DatabaseModule,
    CustomersModule,
    SegmentationModule,
    EventsModule,
  ],
})
export class AppModule {}
