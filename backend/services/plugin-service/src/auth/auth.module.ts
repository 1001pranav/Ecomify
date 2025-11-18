import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { OAuthService } from './oauth.service';
import { OAuthController } from './oauth.controller';
import { PluginRepository } from '../repository/plugin.repository';
import { ApiKeyFactory } from '../plugins/api-key.factory';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [
    DatabaseModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'default-secret-change-in-production',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [OAuthController],
  providers: [OAuthService, PluginRepository, ApiKeyFactory],
  exports: [OAuthService],
})
export class AuthModule {}
