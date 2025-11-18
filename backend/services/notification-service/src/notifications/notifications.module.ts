import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { NotificationStrategyFactory } from '../strategies/notification-strategy.factory';
import { EmailNotificationStrategy } from '../strategies/email-notification.strategy';
import { SmsNotificationStrategy } from '../strategies/sms-notification.strategy';
import { PushNotificationStrategy } from '../strategies/push-notification.strategy';
import { TemplateService } from '../templates/template.service';
import { HandlebarsTemplateRenderer } from '../templates/handlebars-template.renderer';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    NotificationStrategyFactory,
    EmailNotificationStrategy,
    SmsNotificationStrategy,
    PushNotificationStrategy,
    TemplateService,
    HandlebarsTemplateRenderer,
  ],
  exports: [NotificationsService],
})
export class NotificationsModule {}
