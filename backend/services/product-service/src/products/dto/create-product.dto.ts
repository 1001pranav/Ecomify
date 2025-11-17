import { IsString, IsOptional, IsArray, IsNumber, IsEnum, IsBoolean, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ProductStatus } from '@prisma/client';

export class CreateVariantDto {
  @IsString()
  title: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  @IsString()
  barcode?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  compareAtPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  costPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  inventoryQty?: number;

  @IsOptional()
  @IsBoolean()
  trackInventory?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  weight?: number;

  @IsOptional()
  @IsString()
  weightUnit?: string;

  @IsOptional()
  options?: Record<string, string>;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}

export class CreateOptionDto {
  @IsString()
  name: string;

  @IsArray()
  @IsString({ each: true })
  values: string[];

  @IsOptional()
  @IsNumber()
  position?: number;
}

export class CreateImageDto {
  @IsString()
  url: string;

  @IsOptional()
  @IsString()
  altText?: string;

  @IsOptional()
  @IsNumber()
  position?: number;
}

export class CreateProductDto {
  @IsString()
  storeId: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  handle?: string;

  @IsOptional()
  @IsString()
  vendor?: string;

  @IsOptional()
  @IsString()
  productType?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @IsOptional()
  @IsString()
  seoTitle?: string;

  @IsOptional()
  @IsString()
  seoDescription?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOptionDto)
  options?: CreateOptionDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateVariantDto)
  variants: CreateVariantDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateImageDto)
  images?: CreateImageDto[];
}
