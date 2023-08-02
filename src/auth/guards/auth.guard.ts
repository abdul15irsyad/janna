import {
  ExecutionContext,
  HttpStatus,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TokenExpiredError } from 'passport-jwt/node_modules/jsonwebtoken';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { I18nTranslations } from '../../i18n/i18n.generated';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    @Inject(I18nService) private i18n: I18nService<I18nTranslations>,
  ) {
    super();
  }

  getRequest(context: ExecutionContext) {
    const host = context.getType<string>();
    switch (host) {
      case 'http':
        return context.switchToHttp().getRequest();
      case 'graphql':
        const ctx = GqlExecutionContext.create(context);
        return ctx.getContext().req;
    }
  }

  handleRequest<User>(err: any, user: User, info: any) {
    // You can throw an exception based on either "info" or "err" arguments
    if (err || !user) {
      if (info instanceof TokenExpiredError)
        throw new UnauthorizedException({
          statusCode: HttpStatus.UNAUTHORIZED,
          code: 'TOKEN_EXPIRED',
          message: this.i18n.t('error.TOKEN_EXPIRED', {
            lang: I18nContext.current().lang,
          }),
        });
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
