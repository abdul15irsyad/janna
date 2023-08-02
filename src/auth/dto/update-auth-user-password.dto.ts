import { Field, InputType } from '@nestjs/graphql';
import {
  IsStrongPassword,
  IsString,
  IsNotEmpty,
  ValidateBy,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

@InputType()
export class UpdateAuthUserPasswordDto {
  @Field(() => String)
  @IsString({
    message: i18nValidationMessage('validation.IS_STRING', {
      property: 'OLD_PASSWORD',
    }),
  })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.IS_NOT_EMPTY', {
      property: 'OLD_PASSWORD',
    }),
  })
  oldPassword: string;

  @Field(() => String)
  @IsStrongPassword(
    { minSymbols: 0 },
    {
      message: i18nValidationMessage('validation.IS_STRONG_PASSWORD', {
        property: 'NEW_PASSWORD',
      }),
    },
  )
  @IsString({
    message: i18nValidationMessage('validation.IS_STRING', {
      property: 'NEW_PASSWORD',
    }),
  })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.IS_NOT_EMPTY', {
      property: 'NEW_PASSWORD',
    }),
  })
  newPassword: string;

  @Field(() => String)
  @ValidateBy(
    {
      name: 'matchPassword',
      validator: {
        validate: (value, { object }) => value === (object as any).newPassword,
      },
    },
    {
      message: i18nValidationMessage('validation.MATCH_PASSWORD', {
        property: 'CONFIRM_PASSWORD',
      }),
    },
  )
  @IsString({
    message: i18nValidationMessage('validation.IS_STRING', {
      property: 'CONFIRM_PASSWORD',
    }),
  })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.IS_NOT_EMPTY', {
      property: 'CONFIRM_PASSWORD',
    }),
  })
  confirmPassword: string;
}
