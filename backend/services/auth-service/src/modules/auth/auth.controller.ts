/**
 * Auth Controller
 *
 * Exposes all authentication and authorization endpoints
 * Implements all Sprint 1 User Stories
 */

import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
  Req,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { MfaService } from '../mfa/mfa.service';
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
import {
  MfaSetupResponseDto,
  MfaVerifyDto,
  MfaVerifyResponseDto,
} from './dto/mfa.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Public } from './decorators/public.decorator';
import { CurrentUser, CurrentUserType } from './decorators/current-user.decorator';
import { Roles } from './decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('api/v1/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly mfaService: MfaService,
  ) {}

  /**
   * US-BE-101: User Registration
   * POST /api/v1/auth/register
   */
  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto): Promise<RegisterResponseDto> {
    return this.authService.register(registerDto);
  }

  /**
   * US-BE-102: User Login
   * POST /api/v1/auth/login
   */
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto, @Req() req: Request): Promise<LoginResponseDto> {
    const ipAddress = req.ip;
    const userAgent = req.headers['user-agent'];
    return this.authService.login(loginDto, ipAddress, userAgent);
  }

  /**
   * US-BE-104: Token Refresh
   * POST /api/v1/auth/refresh
   */
  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body() refreshDto: TokenRefreshDto): Promise<TokenRefreshResponseDto> {
    return this.authService.refreshToken(refreshDto);
  }

  /**
   * Logout
   * POST /api/v1/auth/logout
   */
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Body('refreshToken') refreshToken: string): Promise<void> {
    return this.authService.logout(refreshToken);
  }

  /**
   * US-BE-107: Password Reset Request
   * POST /api/v1/auth/password/reset-request
   */
  @Public()
  @Post('password/reset-request')
  @HttpCode(HttpStatus.OK)
  async requestPasswordReset(
    @Body() dto: PasswordResetRequestDto,
  ): Promise<PasswordResetResponseDto> {
    return this.authService.requestPasswordReset(dto);
  }

  /**
   * US-BE-107: Reset Password
   * POST /api/v1/auth/password/reset
   */
  @Public()
  @Post('password/reset')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() dto: PasswordResetDto): Promise<PasswordResetResponseDto> {
    return this.authService.resetPassword(dto);
  }

  /**
   * Get current user profile
   * GET /api/v1/auth/profile
   */
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@CurrentUser() user: CurrentUserType) {
    return {
      user,
    };
  }

  /**
   * US-BE-106: MFA Setup
   * POST /api/v1/auth/mfa/setup
   */
  @UseGuards(JwtAuthGuard)
  @Post('mfa/setup')
  async setupMfa(@CurrentUser('userId') userId: string, @CurrentUser('email') email: string): Promise<MfaSetupResponseDto> {
    return this.mfaService.setupMfa(userId, email);
  }

  /**
   * US-BE-106: MFA Verification
   * POST /api/v1/auth/mfa/verify
   */
  @UseGuards(JwtAuthGuard)
  @Post('mfa/verify')
  async verifyMfa(
    @CurrentUser('userId') userId: string,
    @Body() dto: MfaVerifyDto,
  ): Promise<MfaVerifyResponseDto> {
    const success = await this.mfaService.enableMfa(userId, dto.code);
    return {
      success,
      message: success ? 'MFA enabled successfully' : 'Invalid MFA code',
    };
  }

  /**
   * US-BE-106: Disable MFA
   * POST /api/v1/auth/mfa/disable
   */
  @UseGuards(JwtAuthGuard)
  @Post('mfa/disable')
  @HttpCode(HttpStatus.NO_CONTENT)
  async disableMfa(@CurrentUser('userId') userId: string): Promise<void> {
    return this.mfaService.disableMfa(userId);
  }

  /**
   * US-BE-105: Protected route example - RBAC
   * GET /api/v1/auth/admin
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.PLATFORM_ADMIN)
  @Get('admin')
  adminOnly(@CurrentUser() user: CurrentUserType) {
    return {
      message: 'This is a protected admin route',
      user,
    };
  }

  /**
   * US-BE-105: Merchant-only route example - RBAC
   * GET /api/v1/auth/merchant
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MERCHANT, Role.PLATFORM_ADMIN)
  @Get('merchant')
  merchantOnly(@CurrentUser() user: CurrentUserType) {
    return {
      message: 'This is a protected merchant route',
      user,
    };
  }

  /**
   * Health check endpoint
   * GET /api/v1/auth/health
   */
  @Public()
  @Get('health')
  healthCheck() {
    return {
      status: 'ok',
      service: 'auth-service',
      timestamp: new Date().toISOString(),
    };
  }
}
