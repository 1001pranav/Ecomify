import { IsString, IsNumber, Min, IsOptional } from 'class-validator';

export class CreateRefundDto {
  @IsString()
  transactionId: string;

  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsString()
  reason: string;

  @IsOptional()
  metadata?: Record<string, any>;
}
