import {
  ExecutionContext,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ThrottlerGuard } from '@nestjs/throttler';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { I18nTranslations } from '../../i18n/i18n.generated';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  @Inject(I18nService) private i18nService: I18nService<I18nTranslations>;

  getRequestResponse(context: ExecutionContext) {
    const host = context.getType<string>();
    switch (host) {
      case 'http':
        const http = context.switchToHttp();
        return { req: http.getRequest(), res: http.getResponse() };
      case 'graphql':
        const gqlCtx = GqlExecutionContext.create(context);
        const ctx = gqlCtx.getContext();
        return { req: ctx.req, res: ctx.res };
    }
  }

  throwThrottlingException(): void {
    throw new HttpException(
      {
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
        message: this.i18nService.t('error.TOO_MANY_REQUESTS', {
          lang: I18nContext.current().lang,
        }),
        error: 'Too Many Requests',
      },
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }
}
