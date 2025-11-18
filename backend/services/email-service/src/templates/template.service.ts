import { Injectable, Logger } from '@nestjs/common';
import * as Handlebars from 'handlebars';
import { PrismaService } from '../database/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Email Template Service
 * Manages email templates with Handlebars rendering
 */
@Injectable()
export class EmailTemplateService {
  private readonly logger = new Logger(EmailTemplateService.name);
  private templateCache: Map<string, any> = new Map();

  constructor(private readonly prisma: PrismaService) {
    this.registerHelpers();
  }

  /**
   * Register Handlebars helpers
   */
  private registerHelpers(): void {
    Handlebars.registerHelper('formatDate', (date: Date) => {
      return date ? new Date(date).toLocaleDateString() : '';
    });

    Handlebars.registerHelper('formatCurrency', (amount: number, currency: string = 'USD') => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
      }).format(amount);
    });

    Handlebars.registerHelper('year', () => {
      return new Date().getFullYear();
    });
  }

  /**
   * Render template from database
   */
  async renderFromDb(
    slug: string,
    data: Record<string, any>,
    storeId?: string,
  ): Promise<{ subject: string; html: string; text?: string }> {
    try {
      const template = await this.prisma.emailTemplate.findFirst({
        where: {
          slug,
          isActive: true,
          OR: [
            { storeId },
            { storeId: null },
          ],
        },
        orderBy: {
          storeId: 'desc', // Prefer store-specific
        },
      });

      if (!template) {
        throw new Error(`Template not found: ${slug}`);
      }

      const subjectCompiled = Handlebars.compile(template.subject);
      const htmlCompiled = Handlebars.compile(template.html);
      const textCompiled = template.text ? Handlebars.compile(template.text) : null;

      return {
        subject: subjectCompiled(data),
        html: htmlCompiled(data),
        text: textCompiled ? textCompiled(data) : undefined,
      };
    } catch (error) {
      this.logger.error(`Failed to render template: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Render template from file
   */
  async renderFromFile(
    templateName: string,
    data: Record<string, any>,
  ): Promise<string> {
    try {
      const templatePath = path.join(__dirname, '../../templates', `${templateName}.hbs`);

      if (!fs.existsSync(templatePath)) {
        throw new Error(`Template file not found: ${templateName}`);
      }

      const templateContent = fs.readFileSync(templatePath, 'utf-8');
      const compiled = Handlebars.compile(templateContent);
      return compiled(data);
    } catch (error) {
      this.logger.error(`Failed to render file template: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Create or update template
   */
  async upsertTemplate(
    slug: string,
    name: string,
    subject: string,
    html: string,
    text?: string,
    storeId?: string,
  ): Promise<void> {
    await this.prisma.emailTemplate.upsert({
      where: {
        storeId_slug: {
          storeId: storeId || null,
          slug,
        },
      },
      create: {
        storeId: storeId || null,
        name,
        slug,
        subject,
        html,
        text,
        isActive: true,
      },
      update: {
        name,
        subject,
        html,
        text,
      },
    });

    this.logger.log(`Template upserted: ${slug}`);
  }

  /**
   * Seed default templates
   */
  async seedDefaultTemplates(): Promise<void> {
    const templates = [
      {
        name: 'Order Confirmation',
        slug: 'order-confirmation',
        subject: 'Order Confirmation - #{{orderNumber}}',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
              .content { padding: 20px; }
              .footer { text-align: center; color: #666; padding: 20px; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Thank You for Your Order!</h1>
              </div>
              <div class="content">
                <p>Hello {{customerName}},</p>
                <p>Your order <strong>#{{orderNumber}}</strong> has been confirmed.</p>
                <p><strong>Order Total:</strong> {{formatCurrency totalPrice currency}}</p>
                <p>We'll send you a shipping notification when your order ships.</p>
              </div>
              <div class="footer">
                <p>&copy; {{year}} Ecomify. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: 'Hello {{customerName}}, Your order #{{orderNumber}} has been confirmed. Total: {{totalPrice}}',
      },
      {
        name: 'Shipping Notification',
        slug: 'order-shipped',
        subject: 'Your order has shipped - #{{orderNumber}}',
        html: `
          <!DOCTYPE html>
          <html>
          <body>
            <h1>Your Order is On the Way!</h1>
            <p>Hello {{customerName}},</p>
            <p>Your order #{{orderNumber}} has been shipped.</p>
            <p><strong>Tracking Number:</strong> {{trackingNumber}}</p>
            <p><strong>Expected Delivery:</strong> {{formatDate deliveryDate}}</p>
          </body>
          </html>
        `,
        text: 'Hello {{customerName}}, Your order #{{orderNumber}} has shipped. Tracking: {{trackingNumber}}',
      },
      {
        name: 'Welcome Email',
        slug: 'welcome',
        subject: 'Welcome to Ecomify!',
        html: `
          <!DOCTYPE html>
          <html>
          <body>
            <h1>Welcome to Ecomify!</h1>
            <p>Hello {{firstName}},</p>
            <p>Thank you for joining Ecomify. We're excited to have you!</p>
            <p><a href="{{verificationLink}}">Verify your email</a></p>
          </body>
          </html>
        `,
        text: 'Welcome to Ecomify! Verify your email: {{verificationLink}}',
      },
    ];

    for (const template of templates) {
      await this.upsertTemplate(
        template.slug,
        template.name,
        template.subject,
        template.html,
        template.text,
      );
    }

    this.logger.log('Default email templates seeded');
  }
}
