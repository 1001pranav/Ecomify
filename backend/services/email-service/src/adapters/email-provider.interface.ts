/**
 * Adapter Pattern - Email Provider Interface
 * Defines the contract for email sending providers
 */
export interface EmailProvider {
  /**
   * Send email
   * @param to - Recipient email
   * @param from - Sender email
   * @param subject - Email subject
   * @param html - HTML content
   * @param text - Plain text content
   * @param metadata - Additional metadata
   * @returns Provider message ID
   */
  sendEmail(
    to: string,
    from: string,
    subject: string,
    html: string,
    text?: string,
    metadata?: Record<string, any>
  ): Promise<string>;

  /**
   * Send bulk emails
   * @param emails - Array of email objects
   * @returns Array of provider message IDs
   */
  sendBulk(emails: Array<{
    to: string;
    from: string;
    subject: string;
    html: string;
    text?: string;
  }>): Promise<string[]>;

  /**
   * Verify webhook signature
   * @param payload - Webhook payload
   * @param signature - Signature to verify
   * @returns boolean
   */
  verifyWebhook(payload: any, signature: string): boolean;

  /**
   * Get provider name
   * @returns string
   */
  getProviderName(): string;
}
