import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

@InputType()
export class LoginDto {
  @Field(() => String)
  @IsString({
    message: i18nValidationMessage('validation.IS_STRING', {
      property: 'EMAIL',
    }),
  })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.IS_NOT_EMPTY', {
      property: 'EMAIL',
    }),
  })
  email: string;

  @Field(() => String)
  @IsString({
    message: i18nValidationMessage('validation.IS_STRING', {
      property: 'PASSWORD',
    }),
  })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.IS_NOT_EMPTY', {
      property: 'PASSWORD',
    }),
  })
  password: string;
}
