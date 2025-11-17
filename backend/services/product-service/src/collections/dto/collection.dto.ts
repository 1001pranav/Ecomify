import { IsString, IsOptional, IsEnum, IsBoolean, IsObject, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CollectionType } from '@prisma/client';

export class CollectionConditionRuleDto {
  @IsString()
  field: string; // 'price', 'tags', 'productType', 'vendor', 'inventoryQty'

  @IsString()
  operator: string; // 'equals', 'greaterThan', 'lessThan', 'contains', 'in', 'notIn'

  value: any;
}

export class CollectionConditionsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CollectionConditionRuleDto)
  rules: CollectionConditionRuleDto[];

  @IsString()
  logic: 'AND' | 'OR';
}

export class CreateCollectionDto {
  @IsString()
  storeId: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  handle?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(CollectionType)
  type: CollectionType;

  @IsOptional()
  @IsObject()
  conditions?: CollectionConditionsDto;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsBoolean()
  published?: boolean;
}

export class UpdateCollectionDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  handle?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsObject()
  conditions?: CollectionConditionsDto;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsBoolean()
  published?: boolean;
}
