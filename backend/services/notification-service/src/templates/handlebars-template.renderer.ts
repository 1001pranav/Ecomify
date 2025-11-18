import { Injectable } from '@nestjs/common';
import * as Handlebars from 'handlebars';
import { NotificationTemplateRenderer } from './notification-template.interface';

/**
 * Handlebars Template Renderer
 * Implements Template Method Pattern using Handlebars
 */
@Injectable()
export class HandlebarsTemplateRenderer implements NotificationTemplateRenderer {
  constructor() {
    // Register custom helpers
    this.registerHelpers();
  }

  /**
   * Register Handlebars helpers
   */
  private registerHelpers(): void {
    // Date formatting helper
    Handlebars.registerHelper('formatDate', (date: Date, format: string) => {
      // Simple date formatting (in production, use date-fns or moment)
      return date ? new Date(date).toLocaleDateString() : '';
    });

    // Currency formatting helper
    Handlebars.registerHelper('formatCurrency', (amount: number, currency: string = 'USD') => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
      }).format(amount);
    });

    // Conditional helper
    Handlebars.registerHelper('eq', (a: any, b: any) => {
      return a === b;
    });
  }

  /**
   * Render template with data
   */
  render(template: string, data: Record<string, any>): string {
    try {
      const compiledTemplate = Handlebars.compile(template);
      return compiledTemplate(data);
    } catch (error) {
      throw new Error(`Failed to render template: ${error.message}`);
    }
  }

  /**
   * Compile template for reuse
   */
  compile(template: string): any {
    return Handlebars.compile(template);
  }
}
