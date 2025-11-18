import { IsString, IsArray, ValidateNested, IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

class ReserveInventoryItemDto {
  @IsString()
  variantId: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsString()
  @IsOptional()
  locationId?: string;
}

export class ReserveInventoryDto {
  @IsString()
  orderId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReserveInventoryItemDto)
  items: ReserveInventoryItemDto[];
}
