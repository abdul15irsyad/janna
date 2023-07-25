import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';
import { TokenExpiredError } from 'jsonwebtoken';

@Injectable()
export class JwtGraphQLAuthGuard extends AuthGuard('jwt') {
  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req;
  }
  handleRequest<Account>(err, user: boolean | Account, info) {
    if (err || !user) {
      if (info instanceof TokenExpiredError)
        throw new UnauthorizedException('Token Expired');
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
