/**
 * Store Module
 * Aggregates all store-related components
 */

import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { StoreController } from './store.controller';
import { StoreService } from './store.service';
import { StoreRepository } from './repositories/store.repository';
import { StoreBuilder } from './builders/store.builder';
import { SlugFactory } from './factories/slug.factory';
import { JwtStrategy } from '../../config/jwt.strategy';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
      signOptions: {
        expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m',
      },
    }),
  ],
  controllers: [StoreController],
  providers: [
    StoreService,
    StoreRepository,
    StoreBuilder,
    SlugFactory,
    JwtStrategy,
  ],
  exports: [StoreService, StoreRepository],
})
export class StoreModule {}
