import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { handleError } from '../shared/utils/error.util';
import { FormDataRequest } from 'nestjs-form-data';
import { RegisterDto } from './dto/register.dto';
import { RoleService } from '../role/role.service';
import { UserService } from '../user/user.service';
import { ThrottlerGuard } from '@nestjs/throttler';
import { RedisService } from '../redis/redis.service';
import { isEmpty } from 'class-validator';
import { compareSync } from 'bcrypt';
import { hashPassword } from '../shared/utils/password.util';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { JWTType } from './enum/jwt-type.enum';
import { ACCESS_TOKEN_EXPIRED, REFRESH_TOKEN_EXPIRED } from './auth.config';
import { GrantType } from './enum/grant-type.enum';
import { I18n, I18nContext } from 'nestjs-i18n';
import { I18nTranslations } from '../i18n/i18n.generated';
import { Request } from 'express';
import { AuthService } from './auth.service';

@UseGuards(ThrottlerGuard)
@UseInterceptors(ClassSerializerInterceptor)
@Controller('auth')
export class AuthController {
  constructor(
    @Inject(AuthService) private authService: AuthService,
    @Inject(RoleService) private roleService: RoleService,
    @Inject(UserService) private userService: UserService,
    @Inject(RedisService) private redisService: RedisService,
    @Inject(JwtService) private jwtService: JwtService,
  ) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @I18n() i18n: I18nContext<I18nTranslations>,
  ) {
    try {
      const { email, password } = loginDto;
      const authUser = await this.userService.findOne({
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
          i18n.t('error.EMAIL_OR_PASSWORD_INCORRECT', { args: {} }),
        );
      }
      // if (isEmpty(authUser.emailVerifiedAt))
      //   throw new UnauthorizedException(i18n.t('error.EMAIL_HAS_NOT_BEEN_VERIFIED'));

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
        message: 'login successfull',
        data: {
          accessToken: {
            token: accessToken,
            expiresIn: ACCESS_TOKEN_EXPIRED,
            grantType: GrantType.PASSWORD,
          },
          refreshToken: {
            token: refreshToken,
            expiresIn: REFRESH_TOKEN_EXPIRED,
          },
        },
      };
    } catch (error) {
      handleError(error);
    }
  }

  @HttpCode(HttpStatus.OK)
  @Post('refresh-token')
  async refreshToken(
    @Req() req: Request,
    @I18n() i18n: I18nContext<I18nTranslations>,
  ) {
    try {
      const headers = req?.headers;
      const authorization = headers?.authorization;
      if (!authorization) throw new UnauthorizedException();
      if (authorization.split(' ')[0] !== 'Bearer')
        throw new UnauthorizedException();
      const refreshToken = authorization.split(' ')[1];
      const payload = this.authService.validateJwt(refreshToken);
      if (payload.type !== JWTType.REFRESH_TOKEN)
        throw new UnauthorizedException(
          i18n.t('error.THE_TOKEN_IS_NOT_REFRESH_TOKEN'),
        );

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
        message: 'refresh token successfull',
        data: {
          accessToken: {
            token: newAccessToken,
            expiresIn: ACCESS_TOKEN_EXPIRED,
            grantType: GrantType.REFRESH_TOKEN,
          },
          refreshToken: {
            token: newRefreshToken,
            expiresIn: REFRESH_TOKEN_EXPIRED,
          },
        },
      };
    } catch (error) {
      handleError(error);
    }
  }

  @HttpCode(HttpStatus.OK)
  @Post('register')
  @FormDataRequest()
  async register(@Body() registerDto: RegisterDto) {
    try {
      const { name, email, username, password } = registerDto;

      const roleUser = await this.roleService.findOneBy({ slug: 'user' });
      const newUser = await this.userService.create({
        name,
        username,
        email,
        password,
        roleId: roleUser.id,
      });

      // delete user cache
      const cacheKeys = await this.redisService.keys(`users:*`);
      await this.redisService.del(cacheKeys);

      return {
        message: 'register successfull',
        data: newUser,
      };
    } catch (error) {
      handleError(error);
    }
  }
}
