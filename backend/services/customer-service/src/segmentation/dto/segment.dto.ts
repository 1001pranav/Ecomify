import { IsString, IsObject, IsOptional } from 'class-validator';

export class CreateSegmentDto {
  @IsString()
  storeId: string;

  @IsString()
  name: string;

  @IsObject()
  conditions: any; // SegmentRules
}

export class UpdateSegmentDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsObject()
  @IsOptional()
  conditions?: any; // SegmentRules
}
