import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(@Inject(JwtService) private jwtService: JwtService) {}

  validateJwt(token: string) {
    if (!token) return null;
    return this.jwtService.verify(token);
  }
}
