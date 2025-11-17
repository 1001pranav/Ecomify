/**
 * Update Store Status DTO
 */

import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum StoreStatus {
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  SUSPENDED = 'SUSPENDED',
  CLOSED = 'CLOSED',
}

export class UpdateStoreStatusDto {
  @IsEnum(StoreStatus)
  status: StoreStatus;

  @IsOptional()
  @IsString()
  reason?: string;
}
