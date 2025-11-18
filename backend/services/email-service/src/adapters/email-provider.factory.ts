import { Injectable, Logger } from '@nestjs/common';
import { EmailProvider } from './email-provider.interface';
import { SendGridAdapter } from './sendgrid.adapter';
import { SmtpAdapter } from './smtp.adapter';

/**
 * Email Provider Factory - Factory Pattern
 * Creates appropriate email provider adapter
 */
@Injectable()
export class EmailProviderFactory {
  private readonly logger = new Logger(EmailProviderFactory.name);
  private providers: Map<string, EmailProvider> = new Map();

  constructor(
    private readonly sendgridAdapter: SendGridAdapter,
    private readonly smtpAdapter: SmtpAdapter,
  ) {
    // Register providers
    this.registerProvider(sendgridAdapter);
    this.registerProvider(smtpAdapter);
  }

  /**
   * Register an email provider
   */
  private registerProvider(provider: EmailProvider): void {
    this.providers.set(provider.getProviderName(), provider);
    this.logger.log(`Registered email provider: ${provider.getProviderName()}`);
  }

  /**
   * Get provider by name
   */
  getProvider(providerName: string): EmailProvider {
    const provider = this.providers.get(providerName);

    if (!provider) {
      throw new Error(`Email provider not found: ${providerName}`);
    }

    return provider;
  }

  /**
   * Get default provider
   */
  getDefaultProvider(): EmailProvider {
    const defaultProviderName = process.env.DEFAULT_EMAIL_PROVIDER || 'sendgrid';
    return this.getProvider(defaultProviderName);
  }

  /**
   * Get all available providers
   */
  getAvailableProviders(): string[] {
    return Array.from(this.providers.keys());
  }
}
