import { IsNotEmpty, IsString } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class CreateRoleDto {
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
}
