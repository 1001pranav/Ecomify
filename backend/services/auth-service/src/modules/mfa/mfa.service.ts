/**
 * MFA Service - Multi-Factor Authentication
 *
 * Implements TOTP (Time-based One-Time Password) authentication
 * using Strategy Pattern for different MFA methods
 */

import { Injectable } from '@nestjs/common';
import { authenticator } from 'otplib';
import * as QRCode from 'qrcode';
import { CryptoUtils } from '@ecomify/shared';
import { UserRepository } from '../user/user.repository';

@Injectable()
export class MfaService {
  constructor(private userRepository: UserRepository) {
    // Configure TOTP
    authenticator.options = {
      window: 1, // Allow 1 step before and after current time
      step: 30, // 30 seconds validity
    };
  }

  /**
   * Generate MFA secret for user
   */
  generateSecret(): string {
    return authenticator.generateSecret();
  }

  /**
   * Generate QR code for TOTP setup
   */
  async generateQRCode(email: string, secret: string): Promise<string> {
    const serviceName = 'Ecomify';
    const otpauth = authenticator.keyuri(email, serviceName, secret);

    try {
      return await QRCode.toDataURL(otpauth);
    } catch (error) {
      throw new Error('Failed to generate QR code');
    }
  }

  /**
   * Setup MFA for user
   */
  async setupMfa(userId: string, email: string): Promise<{ secret: string; qrCode: string }> {
    const secret = this.generateSecret();
    const qrCode = await this.generateQRCode(email, secret);

    // Store encrypted secret (don't enable yet)
    const encryptedSecret = this.encryptSecret(secret);
    await this.userRepository.update(userId, {
      mfaSecret: encryptedSecret,
    });

    return { secret, qrCode };
  }

  /**
   * Verify MFA code
   */
  async verifyCode(userId: string, code: string): Promise<boolean> {
    const user = await this.userRepository.findById(userId);

    if (!user || !user.mfaSecret) {
      throw new Error('MFA not set up for this user');
    }

    const secret = this.decryptSecret(user.mfaSecret);
    return authenticator.verify({ token: code, secret });
  }

  /**
   * Enable MFA after verification
   */
  async enableMfa(userId: string, code: string): Promise<boolean> {
    const isValid = await this.verifyCode(userId, code);

    if (!isValid) {
      return false;
    }

    await this.userRepository.update(userId, {
      mfaEnabled: true,
    });

    return true;
  }

  /**
   * Disable MFA
   */
  async disableMfa(userId: string): Promise<void> {
    await this.userRepository.update(userId, {
      mfaEnabled: false,
      mfaSecret: null,
    });
  }

  /**
   * Encrypt MFA secret
   */
  private encryptSecret(secret: string): string {
    const encryptionKey = process.env.MFA_ENCRYPTION_KEY || 'default-mfa-key-change-me';
    return CryptoUtils.encrypt(secret, encryptionKey);
  }

  /**
   * Decrypt MFA secret
   */
  private decryptSecret(encryptedSecret: string): string {
    const encryptionKey = process.env.MFA_ENCRYPTION_KEY || 'default-mfa-key-change-me';
    return CryptoUtils.decrypt(encryptedSecret, encryptionKey);
  }

  /**
   * Generate backup codes for MFA
   */
  generateBackupCodes(count: number = 10): string[] {
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
      // Generate 8-character backup codes
      codes.push(CryptoUtils.generateToken(4).toUpperCase());
    }
    return codes;
  }
}
