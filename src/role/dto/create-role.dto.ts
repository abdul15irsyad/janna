import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { I18nTranslations } from '../../i18n/i18n.generated';

@InputType()
export class CreateRoleDto {
  @Field(() => String)
  @IsString({
    message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING', {
      property: 'NAME',
    }),
  })
  @IsNotEmpty({
    message: i18nValidationMessage<I18nTranslations>(
      'validation.IS_NOT_EMPTY',
      {
        property: 'NAME',
      },
    ),
  })
  name: string;
}
