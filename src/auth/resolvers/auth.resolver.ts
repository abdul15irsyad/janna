import { Inject, UnauthorizedException } from '@nestjs/common';
import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { AuthService } from '../services/auth.service';
import { LoginObject } from '../objects/login.objects';
import { LoginDto } from '../dto/login.dto';
import { handleError } from '../../shared/utils/error.util';
import { isEmpty } from 'class-validator';
import { Request } from 'express';
import { RefreshTokenObject } from '../objects/refresh-token.object';
import { User } from '../../user/entities/user.entity';
import { RegisterDto } from '../dto/register.dto';

@Resolver()
export class AuthResolver {
  constructor(@Inject(AuthService) private authService: AuthService) {}

  @Mutation(() => LoginObject)
  async login(
    @Args('loginInput', { type: () => LoginDto }) loginInput: LoginDto,
  ): Promise<LoginObject> {
    try {
      const { email, password } = loginInput;
      const { accessToken, refreshToken } = await this.authService.login(
        email,
        password,
      );

      return {
        accessToken,
        refreshToken,
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

      const { accessToken, refreshToken } = await this.authService.refreshToken(
        token,
      );

      return {
        accessToken,
        refreshToken,
      };
    } catch (error) {
      handleError(error);
    }
  }

  @Mutation(() => User)
  async register(
    @Args('registerInput', { type: () => RegisterDto })
    registerInput: RegisterDto,
  ) {
    try {
      const newUser = await this.authService.register(registerInput);

      return newUser;
    } catch (error) {
      handleError(error);
    }
  }
}
