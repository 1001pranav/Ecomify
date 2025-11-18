import { Injectable, Logger } from '@nestjs/common';
import { NotificationStrategy } from './notification-strategy.interface';

/**
 * SMS Notification Strategy
 * Implements Strategy Pattern for SMS notifications using Twilio
 */
@Injectable()
export class SmsNotificationStrategy implements NotificationStrategy {
  private readonly logger = new Logger(SmsNotificationStrategy.name);
  private twilioClient: any; // Twilio client instance

  constructor() {
    // Initialize Twilio client
    // In production: this.twilioClient = require('twilio')(accountSid, authToken);
    this.logger.log('SMS Strategy initialized');
  }

  getChannelName(): string {
    return 'sms';
  }

  validateRecipient(recipient: string): boolean {
    // Basic phone number validation (supports international format)
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(recipient);
  }

  async send(
    recipient: string,
    subject: string,
    content: string,
    metadata?: Record<string, any>
  ): Promise<boolean> {
    try {
      if (!this.validateRecipient(recipient)) {
        throw new Error('Invalid phone number');
      }

      this.logger.log(`Sending SMS to ${recipient}`);

      // In production, this would use Twilio:
      // await this.twilioClient.messages.create({
      //   body: content,
      //   from: process.env.TWILIO_PHONE_NUMBER,
      //   to: recipient
      // });

      this.logger.log(`SMS sent to ${recipient}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send SMS to ${recipient}`, error.stack);
      return false;
    }
  }
}
