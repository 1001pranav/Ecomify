import { Module } from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { WebhookController } from './webhook.controller';
import { ApiKeyFactory } from '../plugins/api-key.factory';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [WebhookController],
  providers: [WebhookService, ApiKeyFactory],
  exports: [WebhookService],
})
export class WebhooksModule {}
