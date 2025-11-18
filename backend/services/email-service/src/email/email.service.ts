import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { EmailProviderFactory } from '../adapters/email-provider.factory';
import { EmailTemplateService } from '../templates/template.service';

/**
 * Email Service
 * Main service for sending emails using Strategy and Adapter patterns
 */
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly providerFactory: EmailProviderFactory,
    private readonly templateService: EmailTemplateService,
  ) {}

  /**
   * Send email
   */
  async sendEmail(
    to: string,
    subject: string,
    html: string,
    text?: string,
    options?: {
      from?: string;
      storeId?: string;
      provider?: string;
      metadata?: Record<string, any>;
    },
  ): Promise<string> {
    try {
      const from = options?.from || process.env.DEFAULT_FROM_EMAIL || 'noreply@ecomify.com';
      const provider = this.providerFactory.getProvider(
        options?.provider || process.env.DEFAULT_EMAIL_PROVIDER || 'sendgrid'
      );

      // Create email record
      const email = await this.prisma.email.create({
        data: {
          storeId: options?.storeId,
          to,
          from,
          subject,
          html,
          text,
          status: 'PENDING',
          provider: provider.getProviderName(),
          metadata: options?.metadata,
        },
      });

      try {
        // Send via provider
        const providerMsgId = await provider.sendEmail(
          to,
          from,
          subject,
          html,
          text,
          options?.metadata,
        );

        // Update status
        await this.prisma.email.update({
          where: { id: email.id },
          data: {
            status: 'SENT',
            providerMsgId,
            sentAt: new Date(),
            attempts: 1,
          },
        });

        this.logger.log(`Email sent to ${to}: ${email.id}`);
        return email.id;
      } catch (error) {
        // Update failure
        await this.prisma.email.update({
          where: { id: email.id },
          data: {
            status: 'FAILED',
            error: error.message,
            attempts: 1,
          },
        });

        this.logger.error(`Failed to send email to ${to}`, error);
        throw error;
      }
    } catch (error) {
      this.logger.error(`Email service error: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Send email from template
   */
  async sendFromTemplate(
    to: string,
    templateSlug: string,
    data: Record<string, any>,
    options?: {
      from?: string;
      storeId?: string;
      provider?: string;
      metadata?: Record<string, any>;
    },
  ): Promise<string> {
    try {
      // Render template
      const { subject, html, text } = await this.templateService.renderFromDb(
        templateSlug,
        data,
        options?.storeId,
      );

      // Send email
      return await this.sendEmail(to, subject, html, text, options);
    } catch (error) {
      this.logger.error(`Failed to send templated email: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Send bulk emails
   */
  async sendBulk(
    emails: Array<{
      to: string;
      subject: string;
      html: string;
      text?: string;
      storeId?: string;
    }>,
    options?: {
      from?: string;
      provider?: string;
    },
  ): Promise<string[]> {
    const emailIds: string[] = [];

    for (const email of emails) {
      try {
        const id = await this.sendEmail(
          email.to,
          email.subject,
          email.html,
          email.text,
          {
            from: options?.from,
            provider: options?.provider,
            storeId: email.storeId,
          },
        );
        emailIds.push(id);
      } catch (error) {
        this.logger.error(`Failed to send bulk email to ${email.to}`, error);
        emailIds.push('');
      }
    }

    return emailIds;
  }

  /**
   * Retry failed emails
   */
  async retryFailedEmails(): Promise<number> {
    const failedEmails = await this.prisma.email.findMany({
      where: {
        status: 'FAILED',
        attempts: {
          lt: 3,
        },
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
      },
      take: 100,
    });

    let retriedCount = 0;

    for (const email of failedEmails) {
      try {
        const provider = this.providerFactory.getProvider(email.provider);
        const providerMsgId = await provider.sendEmail(
          email.to,
          email.from,
          email.subject,
          email.html,
          email.text || undefined,
          email.metadata as Record<string, any>,
        );

        await this.prisma.email.update({
          where: { id: email.id },
          data: {
            status: 'SENT',
            providerMsgId,
            sentAt: new Date(),
            attempts: email.attempts + 1,
            error: null,
          },
        });

        retriedCount++;
      } catch (error) {
        await this.prisma.email.update({
          where: { id: email.id },
          data: {
            attempts: email.attempts + 1,
            error: error.message,
          },
        });
      }
    }

    this.logger.log(`Retried ${retriedCount} failed emails`);
    return retriedCount;
  }

  /**
   * Get email status
   */
  async getEmailStatus(emailId: string) {
    return this.prisma.email.findUnique({
      where: { id: emailId },
    });
  }

  /**
   * Handle webhook event
   */
  async handleWebhookEvent(
    provider: string,
    event: any,
  ): Promise<void> {
    try {
      // Map provider event to our status
      const statusMap: Record<string, string> = {
        delivered: 'DELIVERED',
        open: 'OPENED',
        click: 'CLICKED',
        bounce: 'BOUNCED',
        failed: 'FAILED',
      };

      const status = statusMap[event.event] || event.event;
      const providerMsgId = event.sg_message_id || event.messageId;

      if (!providerMsgId) {
        this.logger.warn('Webhook event missing message ID');
        return;
      }

      const email = await this.prisma.email.findFirst({
        where: { providerMsgId },
      });

      if (!email) {
        this.logger.warn(`Email not found for provider message ID: ${providerMsgId}`);
        return;
      }

      // Update email status
      const updateData: any = { status };

      if (event.event === 'open' && !email.openedAt) {
        updateData.openedAt = new Date(event.timestamp * 1000);
      }

      if (event.event === 'click' && !email.clickedAt) {
        updateData.clickedAt = new Date(event.timestamp * 1000);
      }

      await this.prisma.email.update({
        where: { id: email.id },
        data: updateData,
      });

      this.logger.log(`Webhook processed for email ${email.id}: ${event.event}`);
    } catch (error) {
      this.logger.error(`Webhook processing error: ${error.message}`, error.stack);
      throw error;
    }
  }
}
