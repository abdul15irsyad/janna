import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  ValidateBy,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { User } from '../entities/user.entity';
import { IsNotExists } from '../../shared/validators/is-not-exists.validator';

export class CreateUserDto {
  @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
  @IsNotEmpty({ message: i18nValidationMessage('validation.IS_NOT_EMPTY') })
  name: string;

  @IsNotExists(
    { entity: User, field: 'username' },
    { message: i18nValidationMessage('validation.IS_NOT_EXISTS') },
  )
  @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
  @IsNotEmpty({ message: i18nValidationMessage('validation.IS_NOT_EMPTY') })
  username: string;

  @IsNotExists(
    { entity: User, field: 'email' },
    { message: i18nValidationMessage('validation.IS_NOT_EXISTS') },
  )
  @IsEmail({}, { message: i18nValidationMessage('validation.IS_EMAIL') })
  @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
  @IsNotEmpty({ message: i18nValidationMessage('validation.IS_NOT_EMPTY') })
  email: string;

  @IsStrongPassword(
    { minSymbols: 0 },
    { message: i18nValidationMessage('validation.IS_STRONG_PASSWORD') },
  )
  @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
  @IsNotEmpty({ message: i18nValidationMessage('validation.IS_NOT_EMPTY') })
  password: string;

  @ValidateBy(
    {
      name: 'matchPassword',
      validator: {
        validate: (value, { object }) => value === (object as any).password,
      },
    },
    { message: i18nValidationMessage('validation.MATCH_PASSWORD') },
  )
  @IsNotEmpty({
    message: i18nValidationMessage('validation.IS_NOT_EMPTY'),
  })
  confirmPassword: string;
}
