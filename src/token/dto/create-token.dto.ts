import { IsEnum } from 'class-validator';
import { TokenType } from '../enum/token-type.enum';
import { i18nValidationMessage } from 'nestjs-i18n';
import { I18nTranslations } from '../../i18n/i18n.generated';

export class CreateTokenDto {
  @IsEnum(TokenType, {
    message: i18nValidationMessage<I18nTranslations>('validation.IS_ENUM'),
  })
  type: TokenType;

  usedAt?: Date;

  expiredAt: Date;

  userId: string;
}
