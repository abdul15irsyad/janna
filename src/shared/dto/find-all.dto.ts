import { Transform } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  isNumberString,
} from 'class-validator';

export class FindAllDto {
  @IsInt()
  @IsNotEmpty()
  @IsOptional()
  @Transform(({ value }) => (isNumberString(value) ? +value : value))
  page?: number;

  @IsInt()
  @IsNotEmpty()
  @IsOptional()
  @Transform(({ value }) => (isNumberString(value) ? +value : value))
  limit?: number;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  search?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  orderBy?: string;

  @IsIn(['ASC', 'DESC', 'asc', 'desc'])
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  orderDir?: 'ASC' | 'DESC' | 'asc' | 'desc';
}
