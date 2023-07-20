import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  IsUUID,
  ValidateBy,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { User } from '../entities/user.entity';
import { IsNotExists } from '../../shared/validators/is-not-exists.validator';
import { IsExists } from '../../shared/validators/is-exists.validator';
import { Role } from '../../role/entities/role.entity';

export class CreateUserDto {
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
  @IsNotEmpty({
    message: i18nValidationMessage('validation.IS_NOT_EMPTY', {
      property: 'CONFIRM_PASSWORD',
    }),
  })
  confirmPassword: string;

  @IsExists(
    { entity: Role },
    {
      message: i18nValidationMessage('validation.IS_EXISTS', {
        property: 'ROLE_ID',
      }),
    },
  )
  @IsUUID(4, {
    message: i18nValidationMessage('validation.IS_UUID', {
      property: 'ROLE_ID',
    }),
  })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.IS_NOT_EMPTY', {
      property: 'ROLE_ID',
    }),
  })
  roleId: string;
}
