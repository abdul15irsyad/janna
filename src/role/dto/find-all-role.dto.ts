import { IsIn, IsOptional, IsString } from 'class-validator';
import { FindAllDto } from '../../shared/dto/find-all.dto';
import { i18nValidationMessage } from 'nestjs-i18n';
import { Field, InputType } from '@nestjs/graphql';
import { I18nTranslations } from '../../i18n/i18n.generated';

@InputType()
export class FindAllRoleDto extends FindAllDto {
  @Field(() => String, { nullable: true })
  @IsIn(['name', 'createdAt'], {
    message: i18nValidationMessage<I18nTranslations>('validation.IS_IN', {
      property: 'ORDER_BY',
    }),
  })
  @IsString({
    message: i18nValidationMessage<I18nTranslations>('validation.IS_STRING', {
      property: 'ORDER_BY',
    }),
  })
  @IsOptional()
  orderBy?: 'name' | 'createdAt';
}
