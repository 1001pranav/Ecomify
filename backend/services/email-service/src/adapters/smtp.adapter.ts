import { Injectable, Logger } from '@nestjs/common';
import { EmailProvider } from './email-provider.interface';

/**
 * SMTP Adapter - Adapter Pattern
 * Adapts Nodemailer SMTP to our EmailProvider interface
 */
@Injectable()
export class SmtpAdapter implements EmailProvider {
  private readonly logger = new Logger(SmtpAdapter.name);
  private transporter: any;

  constructor() {
    // Initialize Nodemailer transporter
    // In production:
    // const nodemailer = require('nodemailer');
    // this.transporter = nodemailer.createTransport({
    //   host: process.env.SMTP_HOST,
    //   port: process.env.SMTP_PORT,
    //   secure: true,
    //   auth: {
    //     user: process.env.SMTP_USER,
    //     pass: process.env.SMTP_PASSWORD,
    //   },
    // });
    this.logger.log('SMTP adapter initialized');
  }

  getProviderName(): string {
    return 'smtp';
  }

  async sendEmail(
    to: string,
    from: string,
    subject: string,
    html: string,
    text?: string,
    metadata?: Record<string, any>
  ): Promise<string> {
    try {
      this.logger.log(`Sending email via SMTP to ${to}`);

      // In production:
      // const info = await this.transporter.sendMail({
      //   from,
      //   to,
      //   subject,
      //   html,
      //   text,
      //   headers: metadata,
      // });
      // return info.messageId;

      // Mock response
      const mockMessageId = `smtp-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      this.logger.log(`Email sent via SMTP: ${mockMessageId}`);
      return mockMessageId;
    } catch (error) {
      this.logger.error(`SMTP error: ${error.message}`, error.stack);
      throw error;
    }
  }

  async sendBulk(emails: Array<{
    to: string;
    from: string;
    subject: string;
    html: string;
    text?: string;
  }>): Promise<string[]> {
    const messageIds: string[] = [];

    for (const email of emails) {
      try {
        const messageId = await this.sendEmail(
          email.to,
          email.from,
          email.subject,
          email.html,
          email.text,
        );
        messageIds.push(messageId);
      } catch (error) {
        this.logger.error(`Failed to send email to ${email.to}`, error);
        messageIds.push('');
      }
    }

    return messageIds;
  }

  verifyWebhook(payload: any, signature: string): boolean {
    // SMTP doesn't typically have webhooks
    this.logger.warn('SMTP adapter does not support webhook verification');
    return false;
  }
}
