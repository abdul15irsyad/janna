import { Field, InputType } from '@nestjs/graphql';
import { IsString, IsOptional, IsEmail } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

@InputType()
export class UpdateAuthUserDto {
  @Field(() => String, { nullable: true })
  @IsString({
    message: i18nValidationMessage('validation.IS_STRING', {
      property: 'NAME',
    }),
  })
  @IsOptional()
  name: string;

  @Field(() => String, { nullable: true })
  @IsString({
    message: i18nValidationMessage('validation.IS_STRING', {
      property: 'USERNAME',
    }),
  })
  @IsOptional()
  username: string;

  @Field(() => String, { nullable: true })
  @IsEmail(
    {},
    {
      message: i18nValidationMessage('validation.IS_EMAIL', {
        property: 'EMAIL',
      }),
    },
  )
  @IsString({
    message: i18nValidationMessage('validation.IS_STRING', {
      property: 'EMAIL',
    }),
  })
  @IsOptional()
  email: string;
}
