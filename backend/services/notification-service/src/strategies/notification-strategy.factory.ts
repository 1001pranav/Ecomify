import { Injectable, Logger } from '@nestjs/common';
import { NotificationStrategy } from './notification-strategy.interface';
import { EmailNotificationStrategy } from './email-notification.strategy';
import { SmsNotificationStrategy } from './sms-notification.strategy';
import { PushNotificationStrategy } from './push-notification.strategy';

/**
 * Factory Pattern - Notification Strategy Factory
 * Creates appropriate notification strategy based on channel
 */
@Injectable()
export class NotificationStrategyFactory {
  private readonly logger = new Logger(NotificationStrategyFactory.name);
  private strategies: Map<string, NotificationStrategy> = new Map();

  constructor(
    private readonly emailStrategy: EmailNotificationStrategy,
    private readonly smsStrategy: SmsNotificationStrategy,
    private readonly pushStrategy: PushNotificationStrategy,
  ) {
    // Register strategies
    this.registerStrategy(emailStrategy);
    this.registerStrategy(smsStrategy);
    this.registerStrategy(pushStrategy);
  }

  /**
   * Register a notification strategy
   */
  private registerStrategy(strategy: NotificationStrategy): void {
    this.strategies.set(strategy.getChannelName(), strategy);
    this.logger.log(`Registered strategy: ${strategy.getChannelName()}`);
  }

  /**
   * Get strategy for channel
   */
  getStrategy(channel: string): NotificationStrategy {
    const strategy = this.strategies.get(channel);

    if (!strategy) {
      throw new Error(`No strategy found for channel: ${channel}`);
    }

    return strategy;
  }

  /**
   * Get all available channels
   */
  getAvailableChannels(): string[] {
    return Array.from(this.strategies.keys());
  }

  /**
   * Check if channel is supported
   */
  isChannelSupported(channel: string): boolean {
    return this.strategies.has(channel);
  }
}
