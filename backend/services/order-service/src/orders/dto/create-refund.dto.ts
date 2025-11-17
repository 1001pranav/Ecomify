import { IsNumber, IsString, IsOptional, IsBoolean, Min } from 'class-validator';

export class CreateRefundDto {
  @IsNumber()
  @Min(0)
  amount: number;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsBoolean()
  restockItems: boolean;
}
