import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { HandlebarsTemplateRenderer } from './handlebars-template.renderer';

/**
 * Template Service
 * Manages notification templates with Template Method Pattern
 */
@Injectable()
export class TemplateService {
  private readonly logger = new Logger(TemplateService.name);
  private templateCache: Map<string, any> = new Map();

  constructor(
    private readonly prisma: PrismaService,
    private readonly renderer: HandlebarsTemplateRenderer,
  ) {}

  /**
   * Get and render template for event and channel
   */
  async renderTemplate(
    event: string,
    channel: string,
    data: Record<string, any>,
    storeId?: string,
  ): Promise<{ subject?: string; content: string }> {
    try {
      // Find template (store-specific or platform-wide)
      const template = await this.prisma.notificationTemplate.findFirst({
        where: {
          event,
          channel,
          enabled: true,
          OR: [
            { storeId },
            { storeId: null }, // Platform-wide template
          ],
        },
        orderBy: {
          storeId: 'desc', // Prefer store-specific templates
        },
      });

      if (!template) {
        this.logger.warn(`No template found for event: ${event}, channel: ${channel}`);
        return {
          subject: data.subject || 'Notification',
          content: data.content || 'You have a new notification',
        };
      }

      // Render template
      const content = this.renderer.render(template.template, data);
      const subject = template.subject
        ? this.renderer.render(template.subject, data)
        : undefined;

      return { subject, content };
    } catch (error) {
      this.logger.error(`Failed to render template: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Create or update template
   */
  async upsertTemplate(
    event: string,
    channel: string,
    template: string,
    subject?: string,
    storeId?: string,
  ): Promise<void> {
    await this.prisma.notificationTemplate.upsert({
      where: {
        storeId_event_channel: {
          storeId: storeId || null,
          event,
          channel,
        },
      },
      create: {
        storeId: storeId || null,
        event,
        channel,
        template,
        subject,
        enabled: true,
      },
      update: {
        template,
        subject,
      },
    });

    this.logger.log(`Template upserted for event: ${event}, channel: ${channel}`);
  }

  /**
   * Seed default templates
   */
  async seedDefaultTemplates(): Promise<void> {
    const defaultTemplates = [
      {
        event: 'order.created',
        channel: 'email',
        subject: 'Order Confirmation - #{{orderNumber}}',
        template: `
          <h1>Thank you for your order!</h1>
          <p>Hello {{customerName}},</p>
          <p>Your order #{{orderNumber}} has been confirmed.</p>
          <p>Order Total: {{formatCurrency totalPrice currency}}</p>
          <p>We'll notify you when it ships.</p>
        `,
      },
      {
        event: 'order.shipped',
        channel: 'email',
        subject: 'Your order has shipped - #{{orderNumber}}',
        template: `
          <h1>Your order is on the way!</h1>
          <p>Hello {{customerName}},</p>
          <p>Your order #{{orderNumber}} has been shipped.</p>
          <p>Tracking Number: {{trackingNumber}}</p>
          <p>Expected Delivery: {{formatDate deliveryDate}}</p>
        `,
      },
      {
        event: 'payment.success',
        channel: 'email',
        subject: 'Payment Received - {{formatCurrency amount currency}}',
        template: `
          <h1>Payment Received</h1>
          <p>Hello {{customerName}},</p>
          <p>We've received your payment of {{formatCurrency amount currency}}.</p>
          <p>Transaction ID: {{transactionId}}</p>
        `,
      },
    ];

    for (const template of defaultTemplates) {
      await this.upsertTemplate(
        template.event,
        template.channel,
        template.template,
        template.subject,
      );
    }

    this.logger.log('Default templates seeded');
  }
}
