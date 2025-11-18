import { IsString, IsNumber, Min } from 'class-validator';

export class TransferInventoryDto {
  @IsString()
  variantId: string;

  @IsString()
  fromLocationId: string;

  @IsString()
  toLocationId: string;

  @IsNumber()
  @Min(1)
  quantity: number;
}
