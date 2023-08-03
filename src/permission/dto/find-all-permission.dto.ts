import { Field, InputType } from '@nestjs/graphql';
import { FindAllDto } from '../../shared/dto/find-all.dto';
import { IsIn, IsOptional, IsString } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

@InputType()
export class FindAllPermissionDto extends FindAllDto {
  @Field(() => String, { nullable: true })
  @IsIn(['moduleName', 'actionName', 'createdAt'], {
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
  orderBy?: 'moduleName' | 'actionName' | 'createdAt';
}
