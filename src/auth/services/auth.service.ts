import { HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../../user/user.service';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { I18nTranslations } from '../../i18n/i18n.generated';
import { isEmpty } from 'class-validator';
import { compareSync } from 'bcrypt';
import { hashPassword } from '../../shared/utils/password.util';
import { JWTType } from '../enum/jwt-type.enum';
import { ACCESS_TOKEN_EXPIRED, REFRESH_TOKEN_EXPIRED } from '../auth.config';
import { GrantType } from '../enum/grant-type.enum';
import { IncomingHttpHeaders } from 'http';
import { RedisService } from '../../redis/redis.service';
import { TokenExpiredError } from 'jsonwebtoken';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from '../../role/entities/role.entity';
import { Repository } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Role) private roleRepo: Repository<Role>,
    @InjectRepository(User) private userRepo: Repository<User>,
    private jwtService: JwtService,
    private userService: UserService,
    private redisService: RedisService,
    private i18n: I18nService<I18nTranslations>,
  ) {}

  getBearerTokenFromHeaders(headers: IncomingHttpHeaders) {
    const authorization = headers?.authorization;
    if (isEmpty(authorization)) return null;
    if (authorization.split(' ')[0] !== 'Bearer') return null;
    return authorization.split(' ')[1];
  }

  async login(email: string, password: string) {
    const authUser = await this.userRepo.findOne({
      select: {
        id: true,
        password: true,
        // emailVerifiedAt: true,
      },
      where: [{ email }, { username: email }],
    });
    if (isEmpty(authUser) || !compareSync(password, authUser.password)) {
      if (isEmpty(authUser)) hashPassword(password);
      throw new UnauthorizedException(
        this.i18n.t('error.EMAIL_OR_PASSWORD_INCORRECT', {
          args: {},
          lang: I18nContext.current().lang,
        }),
      );
    }

    // if user's email not verified yet
    // if (isEmpty(authUser.emailVerifiedAt))
    //   throw new UnauthorizedException(
    //     this.i18n.t('error.EMAIL_HAS_NOT_BEEN_VERIFIED', {
    //       args: {},
    //       lang: I18nContext.current().lang,
    //     }),
    //   );

    // create json web token
    const accessToken = this.jwtService.sign(
      { id: authUser.id, type: JWTType.ACCESS_TOKEN },
      { expiresIn: ACCESS_TOKEN_EXPIRED },
    );
    const refreshToken = this.jwtService.sign(
      { id: authUser.id, type: JWTType.REFRESH_TOKEN },
      { expiresIn: REFRESH_TOKEN_EXPIRED },
    );

    return {
      accessToken: {
        token: accessToken,
        expiresIn: ACCESS_TOKEN_EXPIRED,
        grantType: GrantType.PASSWORD,
      },
      refreshToken: {
        token: refreshToken,
        expiresIn: REFRESH_TOKEN_EXPIRED,
      },
    };
  }

  async refreshToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      if (payload.type !== JWTType.REFRESH_TOKEN) {
        throw new UnauthorizedException(
          this.i18n.t('error.THE_TOKEN_IS_NOT_REFRESH_TOKEN', {
            args: {},
            lang: I18nContext.current().lang,
          }),
        );
      }

      // create json web token
      const newAccessToken = this.jwtService.sign(
        { id: payload.id, type: JWTType.ACCESS_TOKEN },
        { expiresIn: ACCESS_TOKEN_EXPIRED },
      );
      const newRefreshToken = this.jwtService.sign(
        { id: payload.id, type: JWTType.REFRESH_TOKEN },
        { expiresIn: REFRESH_TOKEN_EXPIRED },
      );

      return {
        accessToken: {
          token: newAccessToken,
          expiresIn: ACCESS_TOKEN_EXPIRED,
          grantType: GrantType.REFRESH_TOKEN,
        },
        refreshToken: {
          token: newRefreshToken,
          expiresIn: REFRESH_TOKEN_EXPIRED,
        },
      };
    } catch (error) {
      if (error instanceof TokenExpiredError)
        throw new UnauthorizedException({
          statusCode: HttpStatus.UNAUTHORIZED,
          code: 'TOKEN_EXPIRED',
          message: this.i18n.t('error.TOKEN_EXPIRED', {
            lang: I18nContext.current().lang,
          }),
        });
      throw error;
    }
  }

  async register({
    name,
    email,
    username,
    password,
  }: {
    name: string;
    email: string;
    username: string;
    password: string;
  }) {
    const userRole = await this.roleRepo.findOneBy({ slug: 'user' });
    const newUser = this.userRepo.create({
      id: uuidv4(),
      name,
      username,
      email,
      password: hashPassword(password),
      role: userRole,
    });
    await this.userRepo.save(newUser);

    // delete user cache
    const cacheKeys = await this.redisService.keys(`users:*`);
    await this.redisService.del(cacheKeys);

    return await this.userService.findOne(newUser.id);
  }
}
