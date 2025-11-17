import { Injectable } from '@nestjs/common';

/**
 * Factory Pattern - Order Number Generator
 * Encapsulates the logic for creating unique order numbers
 */
@Injectable()
export class OrderNumberFactory {
  /**
   * Generates a unique order number
   * Format: ORD-{YYYYMMDD}-{RANDOM}
   * Example: ORD-20231215-A3F9K2
   */
  generate(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    // Generate random alphanumeric string (6 characters)
    const random = this.generateRandomString(6);

    return `ORD-${year}${month}${day}-${random}`;
  }

  /**
   * Generates a random alphanumeric string
   */
  private generateRandomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}
