/**
 * App Module - Root module for Store Service
 * Implements Sprint 2 - Store Management Service
 */

import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { DatabaseModule } from './common/database.module';
import { CacheModule } from './common/cache.module';
import { EventsModule } from './modules/events/events.module';
import { StoreModule } from './modules/store/store.module';
import { JwtAuthGuard } from './patterns/guards/jwt-auth.guard';

@Module({
  imports: [
    // Global modules
    DatabaseModule,
    CacheModule,
    EventsModule,

    // Feature modules
    StoreModule,
  ],
  providers: [
    // Apply JWT guard globally (except for routes marked with @Public())
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
