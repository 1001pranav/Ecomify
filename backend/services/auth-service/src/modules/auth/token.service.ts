/**
 * Token Service - Factory Pattern
 *
 * Implements Factory pattern for JWT token generation
 */

import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User, Role } from '@prisma/client';
import { jwtConfig } from '../../config/jwt.config';
import { CryptoUtils } from '@ecomify/shared';

export interface TokenPayload {
  sub: string; // user id
  email: string;
  roles: Role[];
  type: 'access' | 'refresh';
  iat?: number;
  exp?: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class TokenService {
  constructor(private jwtService: JwtService) {}

  /**
   * Generate access token
   * Factory method for creating access tokens
   */
  generateAccessToken(user: User, roles: Role[]): string {
    const payload: Omit<TokenPayload, 'iat' | 'exp'> = {
      sub: user.id,
      email: user.email,
      roles,
      type: 'access',
    };

    return this.jwtService.sign(payload, {
      expiresIn: jwtConfig.accessTokenExpiry,
    });
  }

  /**
   * Generate refresh token
   * Factory method for creating refresh tokens
   */
  generateRefreshToken(user: User, roles: Role[]): string {
    const payload: Omit<TokenPayload, 'iat' | 'exp'> = {
      sub: user.id,
      email: user.email,
      roles,
      type: 'refresh',
    };

    return this.jwtService.sign(payload, {
      expiresIn: jwtConfig.refreshTokenExpiry,
    });
  }

  /**
   * Generate token pair (access + refresh)
   * Factory method for creating both tokens
   */
  generateTokenPair(user: User, roles: Role[]): TokenPair {
    return {
      accessToken: this.generateAccessToken(user, roles),
      refreshToken: this.generateRefreshToken(user, roles),
    };
  }

  /**
   * Verify and decode token
   */
  async verifyToken(token: string): Promise<TokenPayload> {
    try {
      return await this.jwtService.verifyAsync<TokenPayload>(token);
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * Decode token without verification (for debugging)
   */
  decodeToken(token: string): TokenPayload | null {
    try {
      return this.jwtService.decode(token) as TokenPayload;
    } catch {
      return null;
    }
  }

  /**
   * Generate password reset token
   * Factory method for reset tokens
   */
  generatePasswordResetToken(userId: string, email: string): string {
    const payload = {
      sub: userId,
      email,
      type: 'password-reset',
    };

    return this.jwtService.sign(payload, {
      expiresIn: '1h',
    });
  }

  /**
   * Generate email verification token
   * Factory method for verification tokens
   */
  generateEmailVerificationToken(): string {
    return CryptoUtils.generateToken(32);
  }

  /**
   * Get token expiry time in milliseconds
   */
  getRefreshTokenExpiryDate(): Date {
    const expiryString = jwtConfig.refreshTokenExpiry;
    const expiryMs = this.parseExpiryToMs(expiryString);
    return new Date(Date.now() + expiryMs);
  }

  /**
   * Parse expiry string to milliseconds
   */
  private parseExpiryToMs(expiry: string): number {
    const regex = /^(\d+)([smhd])$/;
    const match = expiry.match(regex);

    if (!match) {
      throw new Error('Invalid expiry format');
    }

    const value = parseInt(match[1]);
    const unit = match[2];

    const multipliers: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };

    return value * multipliers[unit];
  }
}
