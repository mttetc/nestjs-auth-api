import { Type } from 'class-transformer';
import { IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class QueryParamsDto {
  @IsOptional()
  @IsString()
  @Type(() => String)
  search?: string;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  @Type(() => String)
  sortBy?: string;

  @IsOptional()
  @IsString()
  @Type(() => String)
  sortOrder?: 'asc' | 'desc' = 'asc';
}
