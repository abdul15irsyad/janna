import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JWT_SECRET } from './auth.config';
import { handleError } from '../shared/utils/error.util';
import { REDIS_TTL } from '../redis/redis.config';
import datasource from '../database/database.datasource';
import { User } from '../user/entities/user.entity';
import { RedisService } from '../redis/redis.service';
import { JWTType } from './enum/jwt-type.enum';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(UserService)
    private userService: UserService,
    @Inject(RedisService)
    private redisService: RedisService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: JWT_SECRET,
    });
  }

  async validate({ id, type }: { id: string; type: JWTType }) {
    try {
      if (type !== JWTType.ACCESS_TOKEN) throw new UnauthorizedException();
      const cacheKey = `auth:${id}`;
      const cachedAuthUser = await this.redisService.get(cacheKey);
      if (cachedAuthUser) {
        const parsedAuthUser = datasource
          .getRepository(User)
          .create(JSON.parse(cachedAuthUser));
        return parsedAuthUser;
      }
      const user = await this.userService.findOne(id);
      if (!user) throw new UnauthorizedException();
      else
        await this.redisService.setex(
          cacheKey,
          REDIS_TTL,
          JSON.stringify(user),
        );
      return user;
    } catch (error) {
      handleError(error);
    }
  }
}
