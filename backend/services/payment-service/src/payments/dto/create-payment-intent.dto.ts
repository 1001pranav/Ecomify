import { IsString, IsNumber, IsEnum, IsOptional, Min } from 'class-validator';

export class CreatePaymentIntentDto {
  @IsString()
  orderId: string;

  @IsNumber()
  @Min(0.5)
  amount: number;

  @IsString()
  currency: string;

  @IsString()
  @IsOptional()
  paymentMethod?: string;

  @IsString()
  storeId: string;

  @IsOptional()
  metadata?: Record<string, any>;
}
