import { Module } from '@nestjs/common';
import { PluginsService } from './plugins.service';
import { PluginsController } from './plugins.controller';
import { PluginRepository } from '../repository/plugin.repository';
import { InstallationRepository } from '../repository/installation.repository';
import { ApiKeyFactory } from './api-key.factory';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [PluginsController],
  providers: [
    PluginsService,
    PluginRepository,
    InstallationRepository,
    ApiKeyFactory,
  ],
  exports: [PluginsService, ApiKeyFactory],
})
export class PluginsModule {}
