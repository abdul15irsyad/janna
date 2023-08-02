import { CreateUserDto } from './create-user.dto';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { IsNotExists } from '../../shared/validators/is-not-exists.validator';
import { User } from '../entities/user.entity';
import { Field, InputType, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateUserDto extends PartialType(CreateUserDto) {
  @Field(() => String)
  @IsNotEmpty({
    message: i18nValidationMessage('validation.IS_NOT_EMPTY', {
      property: 'ID',
    }),
  })
  id: string;

  @Field(() => String, { nullable: true })
  @IsNotExists(
    { entity: User, field: 'username', isExcludeId: true },
    {
      message: i18nValidationMessage('validation.IS_NOT_EXISTS', {
        property: 'USERNAME',
      }),
    },
  )
  @IsString({
    message: i18nValidationMessage('validation.IS_STRING', {
      property: 'USERNAME',
    }),
  })
  @IsOptional()
  username: string;

  @Field(() => String, { nullable: true })
  @IsNotExists(
    { entity: User, field: 'email', isExcludeId: true },
    {
      message: i18nValidationMessage('validation.IS_NOT_EXISTS', {
        property: 'EMAIL',
      }),
    },
  )
  @IsEmail(
    {},
    {
      message: i18nValidationMessage('validation.IS_EMAIL', {
        property: 'EMAIL',
      }),
    },
  )
  @IsString({
    message: i18nValidationMessage('validation.IS_STRING', {
      property: 'EMAIL',
    }),
  })
  @IsOptional()
  email: string;
}
