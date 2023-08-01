import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  ValidateBy,
} from 'class-validator';
import { User } from '../../user/entities/user.entity';
import { IsNotExists } from '../../shared/validators/is-not-exists.validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class RegisterDto {
  @Field(() => String)
  @IsString({
    message: i18nValidationMessage('validation.IS_STRING', {
      property: 'NAME',
    }),
  })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.IS_NOT_EMPTY', {
      property: 'NAME',
    }),
  })
  name: string;

  @Field(() => String)
  @IsNotExists(
    { entity: User, field: 'username' },
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
  @IsNotEmpty({
    message: i18nValidationMessage('validation.IS_NOT_EMPTY', {
      property: 'USERNAME',
    }),
  })
  username: string;

  @Field(() => String)
  @IsNotExists(
    { entity: User, field: 'email' },
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
  @IsNotEmpty({
    message: i18nValidationMessage('validation.IS_NOT_EMPTY', {
      property: 'EMAIL',
    }),
  })
  email: string;

  @Field(() => String)
  @IsStrongPassword(
    { minSymbols: 0 },
    {
      message: i18nValidationMessage('validation.IS_STRONG_PASSWORD', {
        property: 'PASSWORD',
      }),
    },
  )
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

  @Field(() => String)
  @ValidateBy(
    {
      name: 'matchPassword',
      validator: {
        validate: (value, { object }) => value === (object as any).password,
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
