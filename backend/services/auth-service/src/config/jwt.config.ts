/**
 * JWT Configuration
 */

export const jwtConfig = {
  secret: process.env.JWT_SECRET || 'ecomify-secret-key-change-in-production',
  accessTokenExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
  refreshTokenExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
};

export const jwtConstants = {
  secret: jwtConfig.secret,
};
