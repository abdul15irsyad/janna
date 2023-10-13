import { IsNotEmpty, IsUUID } from 'class-validator';
import { CreateFileDto } from './create-file.dto';
import { InputType, Field, PartialType } from '@nestjs/graphql';
import { i18nValidationMessage } from 'nestjs-i18n';
import { I18nTranslations } from '../../i18n/i18n.generated';

@InputType()
export class UpdateFileInput extends PartialType(CreateFileDto) {
  @Field(() => String)
  @IsUUID(4, {
    message: i18nValidationMessage<I18nTranslations>('validation.IS_UUID', {
      property: 'ID',
    }),
  })
  @IsNotEmpty({
    message: i18nValidationMessage<I18nTranslations>(
      'validation.IS_NOT_EMPTY',
      {
        property: 'ID',
      },
    ),
  })
  id: string;
}
