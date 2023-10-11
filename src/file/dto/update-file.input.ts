import { IsNotEmpty, IsUUID } from 'class-validator';
import { CreateFileDto } from './create-file.dto';
import { InputType, Field, PartialType } from '@nestjs/graphql';
import { i18nValidationMessage } from 'nestjs-i18n';

@InputType()
export class UpdateFileInput extends PartialType(CreateFileDto) {
  @Field(() => String)
  @IsUUID(4, {
    message: i18nValidationMessage('validatoin.IS_UUID', { property: 'ID' }),
  })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.IS_NOT_EMPTY', {
      property: 'ID',
    }),
  })
  id: string;
}
