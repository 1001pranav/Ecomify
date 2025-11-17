/**
 * App Module - Root module for Auth Service
 */

import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { SessionModule } from './modules/session/session.module';
import { MfaModule } from './modules/mfa/mfa.module';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { DatabaseModule } from './common/database.module';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    UserModule,
    SessionModule,
    MfaModule,
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
