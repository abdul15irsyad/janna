import { IsBoolean, IsOptional, isBooleanString } from 'class-validator';
import { FindAllDto } from '../../shared/dto/find-all.dto';
import { i18nValidationMessage } from 'nestjs-i18n';
import { Transform } from 'class-transformer';
import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class FindAllNotificationDto extends FindAllDto {
  @Field(() => Boolean, { nullable: true })
  @IsBoolean({ message: i18nValidationMessage('validation.IS_BOOLEAN') })
  @Transform(({ value }) =>
    isBooleanString(value) ? Boolean(JSON.parse(value)) : value,
  )
  @IsOptional()
  readStatus?: boolean;
}
