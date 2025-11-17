import { IsString, IsOptional, IsNumber, Min } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  storeId: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  parentId?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  position?: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}

export class UpdateCategoryDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  parentId?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  position?: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}
