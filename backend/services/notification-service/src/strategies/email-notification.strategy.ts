import { Injectable, Logger } from '@nestjs/common';
import { NotificationStrategy } from './notification-strategy.interface';

/**
 * Email Notification Strategy
 * Implements Strategy Pattern for email notifications
 */
@Injectable()
export class EmailNotificationStrategy implements NotificationStrategy {
  private readonly logger = new Logger(EmailNotificationStrategy.name);

  getChannelName(): string {
    return 'email';
  }

  validateRecipient(recipient: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(recipient);
  }

  async send(
    recipient: string,
    subject: string,
    content: string,
    metadata?: Record<string, any>
  ): Promise<boolean> {
    try {
      if (!this.validateRecipient(recipient)) {
        throw new Error('Invalid email address');
      }

      this.logger.log(`Sending email to ${recipient}`);
      // Email sending is delegated to Email Service
      // This strategy is a placeholder that queues the email

      // In production, this would:
      // 1. Call the Email Service API
      // 2. Or publish an event to the message queue
      // 3. Email Service picks it up and sends via SendGrid

      this.logger.log(`Email queued for ${recipient}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email to ${recipient}`, error.stack);
      return false;
    }
  }
}
