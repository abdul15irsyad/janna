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
import { ThrottlerGuard } from '@nestjs/throttler';
import { LoginDto } from '../dto/login.dto';
import { Request } from 'express';
import { AuthService } from '../services/auth.service';
import { isEmpty } from 'class-validator';

@UseGuards(ThrottlerGuard)
@UseInterceptors(ClassSerializerInterceptor)
@Controller('auth')
export class AuthController {
  constructor(@Inject(AuthService) private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    try {
      const { email, password } = loginDto;
      const { accessToken, refreshToken } = await this.authService.login(
        email,
        password,
      );

      return {
        message: 'login successfull',
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
  async refreshToken(@Req() req: Request) {
    try {
      // get bearer token
      const token = this.authService.getBearerTokenFromHeaders(req?.headers);
      if (isEmpty(token)) throw new UnauthorizedException();

      const { accessToken, refreshToken } = await this.authService.refreshToken(
        token,
      );

      return {
        message: 'refresh token successfull',
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
  async register(@Body() registerDto: RegisterDto) {
    try {
      const newUser = await this.authService.register(registerDto);

      return {
        message: 'register successfull',
        data: newUser,
      };
    } catch (error) {
      handleError(error);
    }
  }
}
