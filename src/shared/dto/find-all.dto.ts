import { Transform } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  isNumberString,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class FindAllDto {
  @IsInt()
  @IsNotEmpty({ message: i18nValidationMessage('validation.IS_NOT_EMPTY') })
  @IsOptional()
  @Transform(({ value }) => (isNumberString(value) ? +value : value))
  page?: number;

  @IsInt()
  @IsNotEmpty({ message: i18nValidationMessage('validation.IS_NOT_EMPTY') })
  @IsOptional()
  @Transform(({ value }) => (isNumberString(value) ? +value : value))
  limit?: number;

  @IsString()
  @IsNotEmpty({ message: i18nValidationMessage('validation.IS_NOT_EMPTY') })
  @IsOptional()
  search?: string;

  @IsString()
  @IsNotEmpty({ message: i18nValidationMessage('validation.IS_NOT_EMPTY') })
  @IsOptional()
  orderBy?: string;

  @IsIn(['ASC', 'DESC', 'asc', 'desc'])
  @IsString()
  @IsNotEmpty({ message: i18nValidationMessage('validation.IS_NOT_EMPTY') })
  @IsOptional()
  orderDir?: 'ASC' | 'DESC' | 'asc' | 'desc';
}
