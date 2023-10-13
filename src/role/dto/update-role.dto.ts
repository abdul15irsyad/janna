import { CreateRoleDto } from './create-role.dto';
import { IsNotEmpty } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { Field, InputType, PartialType } from '@nestjs/graphql';
import { I18nTranslations } from '../../i18n/i18n.generated';

@InputType()
export class UpdateRoleDto extends PartialType(CreateRoleDto) {
  @Field(() => String)
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
