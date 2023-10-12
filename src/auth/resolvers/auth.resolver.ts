import { HttpStatus, UnauthorizedException, UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { AuthService } from '../services/auth.service';
import { LoginObject } from '../object-types/login.object-type';
import { LoginDto } from '../dto/login.dto';
import { handleError } from '../../shared/utils/error.util';
import { isEmpty } from 'class-validator';
import { Request } from 'express';
import { RefreshTokenObject } from '../object-types/refresh-token.object-type';
import { User } from '../../user/entities/user.entity';
import { RegisterDto } from '../dto/register.dto';
import { CustomThrottlerGuard } from '../../shared/guards/throttle.guard';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { UserService } from '../../user/user.service';
import { compareSync } from 'bcrypt';
import { hashPassword } from '../../shared/utils/password.util';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { I18nTranslations } from '../../i18n/i18n.generated';
import { JwtService } from '@nestjs/jwt';
import { JWTType } from '../enum/jwt-type.enum';
import { GrantType } from '../enum/grant-type.enum';
import { TokenExpiredError } from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { RoleService } from '../../role/role.service';
import { RedisService } from '../../redis/redis.service';
import { SocketService } from '../../socket/socket.service';
import { ConfigService } from '@nestjs/config';

@UseGuards(CustomThrottlerGuard)
@Resolver()
export class AuthResolver {
  constructor(
    private authService: AuthService,
    private userService: UserService,
    private roleService: RoleService,
    private redisService: RedisService,
    private socketService: SocketService,
    private jwtService: JwtService,
    private i18n: I18nService<I18nTranslations>,
    private configService: ConfigService,
    @InjectQueue('mail') private readonly mailQueue: Queue,
  ) {}

  @Mutation(() => LoginObject)
  async login(
    @Args('loginInput', { type: () => LoginDto }) loginInput: LoginDto,
  ): Promise<LoginObject> {
    try {
      const { email, password } = loginInput;
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
          this.i18n.t('error.EMAIL_OR_PASSWORD_INCORRECT', {
            args: {},
            lang: I18nContext.current().lang,
          }),
        );
      }
      // create json web token
      const accessToken = this.jwtService.sign(
        { id: authUser.id, type: JWTType.ACCESS_TOKEN },
        {
          expiresIn: this.configService.get<number>(
            'auth.ACCESS_TOKEN_EXPIRED',
          ),
        },
      );
      const refreshToken = this.jwtService.sign(
        { id: authUser.id, type: JWTType.REFRESH_TOKEN },
        {
          expiresIn: this.configService.get<number>(
            'auth.REFRESH_TOKEN_EXPIRED',
          ),
        },
      );

      return {
        accessToken: {
          token: accessToken,
          expiresIn: this.configService.get<number>(
            'auth.ACCESS_TOKEN_EXPIRED',
          ),
          grantType: GrantType.PASSWORD,
        },
        refreshToken: {
          token: refreshToken,
          expiresIn: this.configService.get<number>(
            'auth.REFRESH_TOKEN_EXPIRED',
          ),
        },
      };
    } catch (error) {
      handleError(error);
    }
  }

  @Mutation(() => RefreshTokenObject)
  async refreshToken(@Context() context: { req: Request }) {
    try {
      // get bearer token
      const token = this.authService.getBearerTokenFromHeaders(
        context?.req?.headers,
      );
      if (isEmpty(token)) throw new UnauthorizedException();

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
        {
          expiresIn: this.configService.get<number>(
            'auth.ACCESS_TOKEN_EXPIRED',
          ),
        },
      );
      const newRefreshToken = this.jwtService.sign(
        { id: payload.id, type: JWTType.REFRESH_TOKEN },
        {
          expiresIn: this.configService.get<number>(
            'auth.REFRESH_TOKEN_EXPIRED',
          ),
        },
      );

      return {
        accessToken: {
          token: newAccessToken,
          expiresIn: this.configService.get<number>(
            'auth.ACCESS_TOKEN_EXPIRED',
          ),
          grantType: GrantType.REFRESH_TOKEN,
        },
        refreshToken: {
          token: newRefreshToken,
          expiresIn: this.configService.get<number>(
            'auth.REFRESH_TOKEN_EXPIRED',
          ),
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
      handleError(error);
    }
  }

  @Mutation(() => User)
  async register(
    @Args('registerInput', { type: () => RegisterDto })
    registerInput: RegisterDto,
  ) {
    try {
      const userRole = await this.roleService.findOneBy({ slug: 'user' });
      const newUser = await this.userService.create({
        ...registerInput,
        id: uuidv4(),
        password: hashPassword(registerInput.password),
        role: userRole,
      });

      // delete user cache
      const cacheKeys = await this.redisService.keys(`users:*`);
      await this.redisService.del(cacheKeys);

      await this.mailQueue.add('register', { user: newUser });
      this.socketService.emitNotification(
        await this.userService.find({
          where: {
            role: { slug: 'super-administrator' },
          },
        }),
        {
          message: 'ada orang daftar woi',
        },
      );

      return newUser;
    } catch (error) {
      handleError(error);
    }
  }
}
