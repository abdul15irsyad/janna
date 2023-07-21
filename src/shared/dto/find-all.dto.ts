import { Field, InputType, Int } from '@nestjs/graphql';
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

@InputType()
export abstract class FindAllDto {
  @Field(() => Int, { nullable: true })
  @IsInt({
    message: i18nValidationMessage('validation.IS_INT', { property: 'PAGE' }),
  })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.IS_NOT_EMPTY', {
      property: 'PAGE',
    }),
  })
  @IsOptional()
  @Transform(({ value }) => (isNumberString(value) ? +value : value))
  page?: number;

  @Field(() => Int, { nullable: true })
  @IsInt({
    message: i18nValidationMessage('validation.IS_INT', { property: 'LIMIT' }),
  })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.IS_NOT_EMPTY', {
      property: 'LIMIT',
    }),
  })
  @IsOptional()
  @Transform(({ value }) => (isNumberString(value) ? +value : value))
  limit?: number;

  @Field(() => String, { nullable: true })
  @IsString({
    message: i18nValidationMessage('validation.IS_STRING', {
      property: 'SEARCH',
    }),
  })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.IS_NOT_EMPTY', {
      property: 'SEARCH',
    }),
  })
  @IsOptional()
  search?: string;

  @Field(() => String, { nullable: true })
  @IsString({
    message: i18nValidationMessage('validation.IS_STRING', {
      property: 'ORDER_BY',
    }),
  })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.IS_NOT_EMPTY', {
      property: 'ORDER_BY',
    }),
  })
  @IsOptional()
  orderBy?: string;

  @Field(() => String, { nullable: true })
  @IsIn(['ASC', 'DESC', 'asc', 'desc'], {
    message: i18nValidationMessage('validation.IS_IN', {
      property: 'ORDER_DIR',
    }),
  })
  @IsString({
    message: i18nValidationMessage('validation.IS_STRING', {
      property: 'ORDER_DIR',
    }),
  })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.IS_NOT_EMPTY', {
      property: 'ORDER_DIR',
    }),
  })
  @IsOptional()
  orderDir?: 'ASC' | 'DESC' | 'asc' | 'desc';
}
