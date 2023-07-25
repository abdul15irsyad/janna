import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<Account>(err, user: boolean | Account, info) {
    // You can throw an exception based on either "info" or "err" arguments
    if (err || !user) {
      if (info instanceof jwt.TokenExpiredError)
        throw new UnauthorizedException('Token Expired');
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
