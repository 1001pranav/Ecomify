import { IsArray, IsString, IsOptional, IsEnum, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ProductStatus } from '@prisma/client';

export class BulkUpdateProductDto {
  @IsArray()
  @IsString({ each: true })
  productIds: string[];

  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  vendor?: string;

  @IsOptional()
  @IsString()
  productType?: string;
}

export class BulkDeleteProductDto {
  @IsArray()
  @IsString({ each: true })
  productIds: string[];
}
