import { IsEnum } from 'class-validator';
import { TokenType } from '../enum/token-type.enum';
import { i18nValidationMessage } from 'nestjs-i18n';

export class CreateTokenDto {
  @IsEnum(TokenType, { message: i18nValidationMessage('validation.IS_ENUM') })
  type: TokenType;

  usedAt?: Date;

  expiredAt: Date;

  userId: string;
}
