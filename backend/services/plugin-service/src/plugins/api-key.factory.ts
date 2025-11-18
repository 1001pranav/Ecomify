import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

/**
 * API Key Factory - Factory Pattern
 * Generates secure API keys and secrets
 */
@Injectable()
export class ApiKeyFactory {
  /**
   * Generate API key
   */
  generateApiKey(prefix: string = 'pk'): string {
    const randomBytes = crypto.randomBytes(32);
    const key = randomBytes.toString('base64url');
    return `${prefix}_${key}`;
  }

  /**
   * Generate API secret
   */
  generateApiSecret(): string {
    const randomBytes = crypto.randomBytes(48);
    return randomBytes.toString('base64url');
  }

  /**
   * Generate OAuth2 client credentials
   */
  generateOAuthCredentials(): { clientId: string; clientSecret: string } {
    return {
      clientId: this.generateApiKey('oauth'),
      clientSecret: this.generateApiSecret(),
    };
  }

  /**
   * Hash secret (for storage)
   */
  hashSecret(secret: string): string {
    return crypto.createHash('sha256').update(secret).digest('hex');
  }

  /**
   * Verify secret
   */
  verifySecret(secret: string, hash: string): boolean {
    const secretHash = this.hashSecret(secret);
    return crypto.timingSafeEqual(
      Buffer.from(secretHash),
      Buffer.from(hash)
    );
  }

  /**
   * Generate HMAC signature
   */
  generateHmacSignature(payload: string, secret: string): string {
    return crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
  }

  /**
   * Verify HMAC signature
   */
  verifyHmacSignature(payload: string, signature: string, secret: string): boolean {
    const expectedSignature = this.generateHmacSignature(payload, secret);
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }
}
