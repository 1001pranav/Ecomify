import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { PluginRepository } from '../repository/plugin.repository';
import { ApiKeyFactory } from '../plugins/api-key.factory';
import { JwtService } from '@nestjs/jwt';

/**
 * OAuth Service
 * Implements OAuth2 authentication flow for plugins
 */
@Injectable()
export class OAuthService {
  private readonly logger = new Logger(OAuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly pluginRepo: PluginRepository,
    private readonly apiKeyFactory: ApiKeyFactory,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Verify client credentials (OAuth2 Client Credentials flow)
   */
  async verifyClientCredentials(clientId: string, clientSecret: string) {
    const plugin = await this.pluginRepo.findByClientId(clientId);

    if (!plugin || !plugin.isActive) {
      throw new UnauthorizedException('Invalid client credentials');
    }

    // Verify client secret
    const isValid = this.apiKeyFactory.verifySecret(clientSecret, plugin.clientSecret);

    if (!isValid) {
      throw new UnauthorizedException('Invalid client credentials');
    }

    return plugin;
  }

  /**
   * Generate access token
   */
  async generateAccessToken(
    pluginId: string,
    storeId: string,
    scope: string[] = [],
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    tokenType: string;
  }> {
    const plugin = await this.pluginRepo.findById(pluginId);

    if (!plugin) {
      throw new UnauthorizedException('Invalid plugin');
    }

    // Validate requested scopes against plugin permissions
    const validScopes = scope.filter((s) => plugin.permissions.includes(s));

    // Generate tokens
    const accessToken = this.jwtService.sign(
      {
        pluginId,
        storeId,
        scope: validScopes,
        type: 'access',
      },
      { expiresIn: '1h' },
    );

    const refreshToken = this.jwtService.sign(
      {
        pluginId,
        storeId,
        type: 'refresh',
      },
      { expiresIn: '30d' },
    );

    // Store token in database
    const expiresAt = new Date(Date.now() + 3600 * 1000); // 1 hour

    await this.prisma.oAuthToken.create({
      data: {
        pluginId,
        storeId,
        accessToken,
        refreshToken,
        tokenType: 'Bearer',
        expiresAt,
        scope: validScopes,
      },
    });

    this.logger.log(`Access token generated for plugin ${pluginId}`);

    return {
      accessToken,
      refreshToken,
      expiresIn: 3600,
      tokenType: 'Bearer',
    };
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(refreshToken: string) {
    try {
      // Verify refresh token
      const decoded = this.jwtService.verify(refreshToken);

      if (decoded.type !== 'refresh') {
        throw new UnauthorizedException('Invalid token type');
      }

      // Find stored token
      const storedToken = await this.prisma.oAuthToken.findUnique({
        where: { refreshToken },
      });

      if (!storedToken) {
        throw new UnauthorizedException('Token not found');
      }

      // Generate new access token
      const newTokens = await this.generateAccessToken(
        decoded.pluginId,
        decoded.storeId,
        storedToken.scope,
      );

      // Delete old token
      await this.prisma.oAuthToken.delete({
        where: { refreshToken },
      });

      return newTokens;
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  /**
   * Verify access token
   */
  async verifyAccessToken(accessToken: string) {
    try {
      const decoded = this.jwtService.verify(accessToken);

      if (decoded.type !== 'access') {
        throw new UnauthorizedException('Invalid token type');
      }

      // Check if token exists in database
      const storedToken = await this.prisma.oAuthToken.findUnique({
        where: { accessToken },
      });

      if (!storedToken) {
        throw new UnauthorizedException('Token not found');
      }

      // Check if expired
      if (storedToken.expiresAt < new Date()) {
        throw new UnauthorizedException('Token expired');
      }

      return {
        pluginId: decoded.pluginId,
        storeId: decoded.storeId,
        scope: decoded.scope,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid access token');
    }
  }

  /**
   * Revoke token
   */
  async revokeToken(token: string) {
    // Try to find and delete token (could be access or refresh token)
    const deleted = await this.prisma.oAuthToken.deleteMany({
      where: {
        OR: [
          { accessToken: token },
          { refreshToken: token },
        ],
      },
    });

    this.logger.log(`Revoked ${deleted.count} token(s)`);
    return { revoked: deleted.count > 0 };
  }

  /**
   * Revoke all tokens for a plugin
   */
  async revokeAllPluginTokens(pluginId: string, storeId?: string) {
    const where: any = { pluginId };
    if (storeId) {
      where.storeId = storeId;
    }

    const deleted = await this.prisma.oAuthToken.deleteMany({ where });
    this.logger.log(`Revoked ${deleted.count} tokens for plugin ${pluginId}`);
    return { revoked: deleted.count };
  }
}
