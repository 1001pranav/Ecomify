import { IsString, IsNumber, IsOptional } from 'class-validator';

export class AdjustInventoryDto {
  @IsString()
  variantId: string;

  @IsString()
  locationId: string;

  @IsNumber()
  quantity: number;

  @IsString()
  reason: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
