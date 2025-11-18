import { IsString, IsOptional, IsArray, ValidateNested, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class FulfillmentLineItemDto {
  @IsString()
  lineItemId: string;

  @IsNumber()
  @Min(1)
  quantity: number;
}

export class CreateFulfillmentDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FulfillmentLineItemDto)
  lineItems: FulfillmentLineItemDto[];

  @IsOptional()
  @IsString()
  trackingNumber?: string;

  @IsOptional()
  @IsString()
  trackingUrl?: string;

  @IsOptional()
  @IsString()
  carrier?: string;
}
