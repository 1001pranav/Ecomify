import { IsString, IsDateString, IsEnum, IsOptional } from 'class-validator';

export enum Granularity {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
}

export class SalesReportQueryDto {
  @IsString()
  storeId: string;

  @IsDateString()
  dateFrom: string;

  @IsDateString()
  dateTo: string;

  @IsEnum(Granularity)
  @IsOptional()
  granularity?: Granularity = Granularity.DAY;
}

export class TopProductsQueryDto {
  @IsString()
  storeId: string;

  @IsEnum(['revenue', 'units'])
  metric: 'revenue' | 'units';

  @IsOptional()
  limit?: number = 10;

  @IsDateString()
  @IsOptional()
  dateFrom?: string;

  @IsDateString()
  @IsOptional()
  dateTo?: string;
}
