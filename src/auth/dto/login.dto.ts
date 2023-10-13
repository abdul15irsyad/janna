import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { I18nTranslations } from '../../i18n/i18n.generated';

@InputType()
export class LoginDto {
  @Field(() => String)
  @IsString({
    message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING', {
      property: 'EMAIL',
    }),
  })
  @IsNotEmpty({
    message: i18nValidationMessage<I18nTranslations>(
      'validation.IS_NOT_EMPTY',
      {
        property: 'EMAIL',
      },
    ),
  })
  email: string;

  @Field(() => String)
  @IsString({
    message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING', {
      property: 'PASSWORD',
    }),
  })
  @IsNotEmpty({
    message: i18nValidationMessage<I18nTranslations>(
      'validation.IS_NOT_EMPTY',
      {
        property: 'PASSWORD',
      },
    ),
  })
  password: string;
}
