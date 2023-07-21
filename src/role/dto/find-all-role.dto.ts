import { IsIn, IsOptional, IsString } from 'class-validator';
import { FindAllDto } from '../../shared/dto/find-all.dto';
import { i18nValidationMessage } from 'nestjs-i18n';
import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class FindAllRoleDto extends FindAllDto {
  @Field(() => String, { nullable: true })
  @IsIn(['name', 'createdAt'], {
    message: i18nValidationMessage('validation.IS_IN', {
      property: 'ORDER_BY',
    }),
  })
  @IsString({
    message: i18nValidationMessage('validation.IS_STRING', {
      property: 'ORDER_BY',
    }),
  })
  @IsOptional()
  orderBy?: 'name' | 'createdAt';
}
