import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CancelOrderDto {
  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsBoolean()
  refund?: boolean;
}
