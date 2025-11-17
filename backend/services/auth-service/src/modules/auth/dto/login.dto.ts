/**
 * Login Data Transfer Objects
 */

import { IsEmail, IsString, IsOptional } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @IsString()
  password: string;

  @IsOptional()
  @IsString()
  mfaCode?: string;
}

export class LoginResponseDto {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    roles: string[];
  };
}

export class TokenRefreshDto {
  @IsString()
  refreshToken: string;
}

export class TokenRefreshResponseDto {
  accessToken: string;
  refreshToken: string;
}
