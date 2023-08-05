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
import { handleError } from '../../shared/utils/error.util';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { Request } from 'express';
import { AuthService } from '../services/auth.service';
import { isEmpty } from 'class-validator';
import { I18n, I18nContext } from 'nestjs-i18n';
import { I18nTranslations } from '../../i18n/i18n.generated';
import { CustomThrottlerGuard } from '../../shared/guards/throttle.guard';

@UseGuards(CustomThrottlerGuard)
@UseInterceptors(ClassSerializerInterceptor)
@Controller('auth')
export class AuthController {
  constructor(@Inject(AuthService) private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @I18n() i18n: I18nContext<I18nTranslations>,
  ) {
    try {
      const { email, password } = loginDto;
      const { accessToken, refreshToken } = await this.authService.login(
        email,
        password,
      );

      return {
        message: i18n.t('common.LOGIN_SUCCESSFULL', { args: {} }),
        data: {
          accessToken,
          refreshToken,
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
      // get bearer token
      const token = this.authService.getBearerTokenFromHeaders(req?.headers);
      if (isEmpty(token)) throw new UnauthorizedException();

      const { accessToken, refreshToken } = await this.authService.refreshToken(
        token,
      );

      return {
        message: i18n.t('common.REFRESH_TOKEN_SUCCESSFULL', { args: {} }),
        data: {
          accessToken,
          refreshToken,
        },
      };
    } catch (error) {
      handleError(error);
    }
  }

  @HttpCode(HttpStatus.OK)
  @Post('register')
  async register(
    @Body() registerDto: RegisterDto,
    @I18n() i18n: I18nContext<I18nTranslations>,
  ) {
    try {
      const newUser = await this.authService.register(registerDto);

      return {
        message: i18n.t('common.REGISTER_SUCCESSFULL', { args: {} }),
        data: newUser,
      };
    } catch (error) {
      handleError(error);
    }
  }
}
