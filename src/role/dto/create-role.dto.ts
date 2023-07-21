import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

@InputType()
export class CreateRoleDto {
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
}
