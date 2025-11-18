import { Controller, Post, Body, Headers, UnauthorizedException } from '@nestjs/common';
import { OAuthService } from './oauth.service';

@Controller('oauth')
export class OAuthController {
  constructor(private readonly oauthService: OAuthService) {}

  /**
   * OAuth2 Token endpoint
   * Supports client_credentials grant type
   */
  @Post('token')
  async token(@Body() body: any) {
    const { grant_type, client_id, client_secret, scope, refresh_token, store_id } = body;

    if (grant_type === 'client_credentials') {
      // Client Credentials flow
      if (!client_id || !client_secret || !store_id) {
        throw new UnauthorizedException('Missing required parameters');
      }

      // Verify credentials
      const plugin = await this.oauthService.verifyClientCredentials(client_id, client_secret);

      // Generate access token
      const scopes = scope ? scope.split(' ') : plugin.permissions;
      return this.oauthService.generateAccessToken(plugin.id, store_id, scopes);
    } else if (grant_type === 'refresh_token') {
      // Refresh Token flow
      if (!refresh_token) {
        throw new UnauthorizedException('Missing refresh_token');
      }

      return this.oauthService.refreshAccessToken(refresh_token);
    } else {
      throw new UnauthorizedException('Unsupported grant_type');
    }
  }

  /**
   * Verify token
   */
  @Post('verify')
  async verify(@Headers('authorization') authorization: string) {
    if (!authorization || !authorization.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid authorization header');
    }

    const token = authorization.substring(7);
    return this.oauthService.verifyAccessToken(token);
  }

  /**
   * Revoke token
   */
  @Post('revoke')
  async revoke(@Body() body: { token: string }) {
    return this.oauthService.revokeToken(body.token);
  }
}
