import { CreateRoleDto } from './create-role.dto';
import { IsNotEmpty } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { Field, InputType, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateRoleDto extends PartialType(CreateRoleDto) {
  @Field(() => String)
  @IsNotEmpty({
    message: i18nValidationMessage('validation.IS_NOT_EMPTY', {
      property: 'ID',
    }),
  })
  id: string;
}
