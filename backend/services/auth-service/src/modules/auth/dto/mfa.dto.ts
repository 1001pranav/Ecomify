/**
 * Multi-Factor Authentication Data Transfer Objects
 */

import { IsString, Length } from 'class-validator';

export class MfaSetupResponseDto {
  secret: string;
  qrCode: string;
}

export class MfaVerifyDto {
  @IsString()
  @Length(6, 6, { message: 'MFA code must be exactly 6 digits' })
  code: string;
}

export class MfaVerifyResponseDto {
  success: boolean;
  message?: string;
}

export class MfaLoginDto {
  @IsString()
  email: string;

  @IsString()
  password: string;

  @IsString()
  @Length(6, 6, { message: 'MFA code must be exactly 6 digits' })
  mfaCode: string;
}
