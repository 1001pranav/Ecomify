/**
 * Cryptography utilities
 */
import * as crypto from 'crypto';

export class CryptoUtils {
  /**
   * Generate a random token
   */
  static generateToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Generate a random UUID
   */
  static generateUUID(): string {
    return crypto.randomUUID();
  }

  /**
   * Hash a password using bcrypt-compatible format
   */
  static async hashPassword(password: string): Promise<string> {
    // In production, use bcrypt or argon2
    // This is a placeholder implementation
    return crypto
      .createHash('sha256')
      .update(password + process.env.SALT || 'default-salt')
      .digest('hex');
  }

  /**
   * Verify a password against a hash
   */
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    const computed = await this.hashPassword(password);
    return computed === hash;
  }

  /**
   * Generate HMAC signature
   */
  static generateHMAC(data: string, secret: string): string {
    return crypto.createHmac('sha256', secret).update(data).digest('hex');
  }

  /**
   * Verify HMAC signature
   */
  static verifyHMAC(data: string, signature: string, secret: string): boolean {
    const computed = this.generateHMAC(data, secret);
    return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(signature));
  }

  /**
   * Encrypt data
   */
  static encrypt(text: string, key: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
      'aes-256-cbc',
      crypto.createHash('sha256').update(key).digest(),
      iv,
    );
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  }

  /**
   * Decrypt data
   */
  static decrypt(text: string, key: string): string {
    const parts = text.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    const decipher = crypto.createDecipheriv(
      'aes-256-cbc',
      crypto.createHash('sha256').update(key).digest(),
      iv,
    );
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
}
