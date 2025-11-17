/**
 * Password Reset Data Transfer Objects
 */

import { IsEmail, IsString, MinLength, MaxLength, Matches } from 'class-validator';

export class PasswordResetRequestDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;
}

export class PasswordResetDto {
  @IsString()
  token: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(128, { message: 'Password must not exceed 128 characters' })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'Password must contain uppercase, lowercase, and number/special character',
  })
  newPassword: string;
}

export class PasswordResetResponseDto {
  message: string;
}
