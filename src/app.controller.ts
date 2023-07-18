import { Controller, Get, Inject, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { handleError } from './shared/utils/error.util';
import { MailService } from './mail/mail.service';
import { I18n, I18nContext, i18nValidationMessage } from 'nestjs-i18n';
import { I18nTranslations } from './i18n/i18n.generated';
import { IsNotEmpty } from 'class-validator';

class RootDto {
  @IsNotEmpty({ message: i18nValidationMessage('validation.IS_NOT_EMPTY') })
  test: string;
}

@Controller()
export class AppController {
  @Inject(AppService) private appService: AppService;
  @Inject(MailService) private mailService: MailService;

  @Get()
  async root(
    @Query() rootDto: RootDto,
    @I18n() i18n: I18nContext<I18nTranslations>,
  ) {
    try {
      const rootMessage = this.appService.rootMessage();
      const helloWorld = this.appService.helloWorld();

      return {
        message: rootMessage,
        helloWorld,
        helloWorld2: i18n.t('common.HELLO_WORLD'),
      };
    } catch (error) {
      handleError({ error });
    }
  }
}
