import { Controller, Post, Get, Body, Param, Headers, RawBodyRequest, Req } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailProviderFactory } from '../adapters/email-provider.factory';

@Controller('email')
export class EmailController {
  constructor(
    private readonly emailService: EmailService,
    private readonly providerFactory: EmailProviderFactory,
  ) {}

  @Post('send')
  async sendEmail(@Body() body: any) {
    const { to, subject, html, text, options } = body;
    return this.emailService.sendEmail(to, subject, html, text, options);
  }

  @Post('send-template')
  async sendFromTemplate(@Body() body: any) {
    const { to, templateSlug, data, options } = body;
    return this.emailService.sendFromTemplate(to, templateSlug, data, options);
  }

  @Post('send-bulk')
  async sendBulk(@Body() body: any) {
    const { emails, options } = body;
    return this.emailService.sendBulk(emails, options);
  }

  @Get(':id/status')
  async getStatus(@Param('id') id: string) {
    return this.emailService.getEmailStatus(id);
  }

  @Post('retry-failed')
  async retryFailed() {
    const count = await this.emailService.retryFailedEmails();
    return { retriedCount: count };
  }

  /**
   * Webhook endpoint for SendGrid
   */
  @Post('webhooks/sendgrid')
  async sendgridWebhook(
    @Body() events: any[],
    @Headers('x-twilio-email-event-webhook-signature') signature: string,
  ) {
    try {
      // Verify signature
      const provider = this.providerFactory.getProvider('sendgrid');
      const isValid = provider.verifyWebhook(events, signature);

      if (!isValid) {
        return { error: 'Invalid signature' };
      }

      // Process events
      for (const event of events) {
        await this.emailService.handleWebhookEvent('sendgrid', event);
      }

      return { success: true, processed: events.length };
    } catch (error) {
      return { error: error.message };
    }
  }

  /**
   * Generic webhook endpoint
   */
  @Post('webhooks/:provider')
  async genericWebhook(
    @Param('provider') provider: string,
    @Body() payload: any,
  ) {
    try {
      if (Array.isArray(payload)) {
        for (const event of payload) {
          await this.emailService.handleWebhookEvent(provider, event);
        }
      } else {
        await this.emailService.handleWebhookEvent(provider, payload);
      }

      return { success: true };
    } catch (error) {
      return { error: error.message };
    }
  }
}
