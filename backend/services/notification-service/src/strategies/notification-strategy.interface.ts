/**
 * Strategy Pattern - Notification Delivery Interface
 * Defines the contract for different notification delivery channels
 */
export interface NotificationStrategy {
  /**
   * Send notification through the specific channel
   * @param recipient - Email, phone number, or device token
   * @param subject - Notification subject (for email/push)
   * @param content - Notification content
   * @param metadata - Additional metadata
   * @returns Promise<boolean> - Success status
   */
  send(
    recipient: string,
    subject: string,
    content: string,
    metadata?: Record<string, any>
  ): Promise<boolean>;

  /**
   * Validate recipient format for this channel
   * @param recipient - Recipient identifier
   * @returns boolean - Valid or not
   */
  validateRecipient(recipient: string): boolean;

  /**
   * Get channel name
   * @returns string - Channel identifier
   */
  getChannelName(): string;
}
