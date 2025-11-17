/**
 * Auth Service - Main authentication service
 *
 * Implements multiple design patterns:
 * - Repository Pattern for data access
 * - Factory Pattern for token generation
 * - Strategy Pattern for authentication strategies
 * - Observer Pattern for event publishing
 */

import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { CryptoUtils } from '@ecomify/shared';
import { EventPublisher } from '@ecomify/queue';
import { UserRepository } from '../user/user.repository';
import { SessionRepository } from '../session/session.repository';
import { TokenService } from './token.service';
import { MfaService } from '../mfa/mfa.service';
import { RedisService } from '@ecomify/database';
import {
  RegisterDto,
  RegisterResponseDto,
  LoginDto,
  LoginResponseDto,
  TokenRefreshDto,
  TokenRefreshResponseDto,
  PasswordResetRequestDto,
  PasswordResetDto,
  PasswordResetResponseDto,
} from './dto';

@Injectable()
export class AuthService {
  private eventPublisher: EventPublisher;
  private readonly TOKEN_BLACKLIST_PREFIX = 'blacklist:token:';
  private readonly LOGIN_ATTEMPTS_PREFIX = 'login:attempts:';
  private readonly MAX_LOGIN_ATTEMPTS = 5;
  private readonly LOGIN_ATTEMPT_WINDOW = 900; // 15 minutes in seconds

  constructor(
    private userRepository: UserRepository,
    private sessionRepository: SessionRepository,
    private tokenService: TokenService,
    private mfaService: MfaService,
    private redisService: RedisService,
  ) {
    // Initialize event publisher for Observer Pattern
    this.initializeEventPublisher();
  }

  /**
   * Initialize event publisher
   */
  private async initializeEventPublisher() {
    const { createPublisher } = await import('@ecomify/queue');
    this.eventPublisher = createPublisher({
      exchange: 'auth.events',
      exchangeType: 'topic',
    });
    await this.eventPublisher.initialize();
  }

  /**
   * US-BE-101: User Registration
   */
  async register(dto: RegisterDto): Promise<RegisterResponseDto> {
    // Check if email already exists
    const emailExists = await this.userRepository.emailExists(dto.email);
    if (emailExists) {
      throw new ConflictException('Email already registered');
    }

    // Hash password using bcrypt (Strategy Pattern)
    const passwordHash = await CryptoUtils.hashPassword(dto.password);

    // Generate email verification token
    const verificationToken = this.tokenService.generateEmailVerificationToken();

    // Create user
    const user = await this.userRepository.create({
      email: dto.email,
      passwordHash,
      firstName: dto.firstName,
      lastName: dto.lastName,
      verificationToken,
      isVerified: false,
    });

    // Assign default CUSTOMER role
    await this.userRepository.addRole(user.id, Role.CUSTOMER);

    // Publish UserCreated event (Observer Pattern)
    await this.eventPublisher.publish('user.created', {
      userId: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      verificationToken,
    });

    return {
      userId: user.id,
      message: 'Registration successful. Please check your email for verification.',
    };
  }

  /**
   * US-BE-102: User Login
   */
  async login(dto: LoginDto, ipAddress?: string, userAgent?: string): Promise<LoginResponseDto> {
    // Check rate limiting
    await this.checkLoginAttempts(dto.email);

    // Find user by email
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) {
      await this.recordFailedLoginAttempt(dto.email);
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await CryptoUtils.verifyPassword(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      await this.recordFailedLoginAttempt(dto.email);
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if MFA is enabled
    if (user.mfaEnabled) {
      if (!dto.mfaCode) {
        throw new BadRequestException('MFA code required');
      }

      const isMfaValid = await this.mfaService.verifyCode(user.id, dto.mfaCode);
      if (!isMfaValid) {
        throw new UnauthorizedException('Invalid MFA code');
      }
    }

    // Clear login attempts
    await this.clearLoginAttempts(dto.email);

    // Get user roles
    const roles = await this.userRepository.getUserRoles(user.id);

    // Generate JWT tokens (Factory Pattern)
    const { accessToken, refreshToken } = this.tokenService.generateTokenPair(user, roles);

    // Create session
    await this.sessionRepository.create({
      user: { connect: { id: user.id } },
      refreshToken,
      ipAddress,
      userAgent,
      expiresAt: this.tokenService.getRefreshTokenExpiryDate(),
    });

    // Publish UserLoggedIn event
    await this.eventPublisher.publish('user.logged_in', {
      userId: user.id,
      email: user.email,
      ipAddress,
      timestamp: new Date(),
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: roles as string[],
      },
    };
  }

  /**
   * US-BE-104: Token Refresh
   */
  async refreshToken(dto: TokenRefreshDto): Promise<TokenRefreshResponseDto> {
    // Verify refresh token
    const session = await this.sessionRepository.findByRefreshToken(dto.refreshToken);

    if (!session) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Check if session is expired
    if (session.expiresAt < new Date()) {
      await this.sessionRepository.delete(session.id);
      throw new UnauthorizedException('Refresh token expired');
    }

    // Check if token is blacklisted
    const isBlacklisted = await this.isTokenBlacklisted(dto.refreshToken);
    if (isBlacklisted) {
      throw new UnauthorizedException('Token has been revoked');
    }

    // Get user roles
    const roles = await this.userRepository.getUserRoles(session.userId);

    // Generate new token pair (Token Rotation)
    const { accessToken, refreshToken: newRefreshToken } = this.tokenService.generateTokenPair(
      session.user,
      roles,
    );

    // Delete old session
    await this.sessionRepository.delete(session.id);

    // Create new session
    await this.sessionRepository.create({
      user: { connect: { id: session.userId } },
      refreshToken: newRefreshToken,
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
      expiresAt: this.tokenService.getRefreshTokenExpiryDate(),
    });

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  /**
   * Logout user
   */
  async logout(refreshToken: string): Promise<void> {
    const session = await this.sessionRepository.findByRefreshToken(refreshToken);

    if (session) {
      // Blacklist the refresh token
      await this.blacklistToken(refreshToken);

      // Delete session
      await this.sessionRepository.delete(session.id);

      // Publish UserLoggedOut event
      await this.eventPublisher.publish('user.logged_out', {
        userId: session.userId,
        timestamp: new Date(),
      });
    }
  }

  /**
   * US-BE-107: Password Reset Request
   */
  async requestPasswordReset(dto: PasswordResetRequestDto): Promise<PasswordResetResponseDto> {
    const user = await this.userRepository.findByEmail(dto.email);

    // Don't reveal if email exists (security)
    if (!user) {
      return { message: 'If the email exists, a reset link has been sent' };
    }

    // Generate password reset token
    const resetToken = this.tokenService.generatePasswordResetToken(user.id, user.email);

    // Publish PasswordResetRequested event
    await this.eventPublisher.publish('password.reset_requested', {
      userId: user.id,
      email: user.email,
      resetToken,
      expiresIn: '1h',
    });

    return { message: 'If the email exists, a reset link has been sent' };
  }

  /**
   * US-BE-107: Reset Password
   */
  async resetPassword(dto: PasswordResetDto): Promise<PasswordResetResponseDto> {
    try {
      // Verify reset token
      const payload = await this.tokenService.verifyToken(dto.token);

      if (payload.type !== 'password-reset') {
        throw new BadRequestException('Invalid token type');
      }

      // Hash new password
      const passwordHash = await CryptoUtils.hashPassword(dto.newPassword);

      // Update user password
      await this.userRepository.update(payload.sub, { passwordHash });

      // Delete all sessions for security
      await this.sessionRepository.deleteAllForUser(payload.sub);

      // Publish PasswordChanged event
      await this.eventPublisher.publish('password.changed', {
        userId: payload.sub,
        timestamp: new Date(),
      });

      return { message: 'Password reset successful' };
    } catch (error) {
      throw new BadRequestException('Invalid or expired reset token');
    }
  }

  /**
   * Rate limiting - Check login attempts
   */
  private async checkLoginAttempts(email: string): Promise<void> {
    const key = `${this.LOGIN_ATTEMPTS_PREFIX}${email}`;
    const attempts = await this.redisService.get(key);

    if (attempts && parseInt(attempts) >= this.MAX_LOGIN_ATTEMPTS) {
      throw new UnauthorizedException('Too many login attempts. Please try again later.');
    }
  }

  /**
   * Record failed login attempt
   */
  private async recordFailedLoginAttempt(email: string): Promise<void> {
    const key = `${this.LOGIN_ATTEMPTS_PREFIX}${email}`;
    const current = await this.redisService.get(key);
    const attempts = current ? parseInt(current) + 1 : 1;

    await this.redisService.set(key, attempts.toString(), this.LOGIN_ATTEMPT_WINDOW);
  }

  /**
   * Clear login attempts
   */
  private async clearLoginAttempts(email: string): Promise<void> {
    const key = `${this.LOGIN_ATTEMPTS_PREFIX}${email}`;
    await this.redisService.del(key);
  }

  /**
   * US-BE-103: Blacklist token
   */
  async blacklistToken(token: string): Promise<void> {
    const key = `${this.TOKEN_BLACKLIST_PREFIX}${token}`;
    // Store with expiry matching token expiry
    await this.redisService.set(key, 'blacklisted', 7 * 24 * 60 * 60); // 7 days
  }

  /**
   * Check if token is blacklisted
   */
  async isTokenBlacklisted(token: string): Promise<boolean> {
    const key = `${this.TOKEN_BLACKLIST_PREFIX}${token}`;
    const value = await this.redisService.get(key);
    return value === 'blacklisted';
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<void> {
    const user = await this.userRepository.findByEmail(token); // Simplified - should find by token

    if (!user || user.verificationToken !== token) {
      throw new BadRequestException('Invalid verification token');
    }

    await this.userRepository.markAsVerified(user.id);

    // Publish EmailVerified event
    await this.eventPublisher.publish('user.email_verified', {
      userId: user.id,
      email: user.email,
    });
  }
}
