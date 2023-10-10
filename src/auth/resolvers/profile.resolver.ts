import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import {
  BadRequestException,
  UseGuards,
  ValidationError,
} from '@nestjs/common';
import { User } from '../../user/entities/user.entity';
import { handleError } from '../../shared/utils/error.util';
import { AuthUser } from '../decorators/auth-user.decorator';
import { JwtAuthGuard } from '../guards/auth.guard';
import { UpdateAuthUserDto } from '../dto/update-auth-user.dto';
import { UpdateAuthUserPasswordDto } from '../dto/update-auth-user-password.dto';
import { isNotEmpty } from 'class-validator';
import { UserService } from '../../user/user.service';
import { Not } from 'typeorm';
import { RedisService } from '../../redis/redis.service';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { I18nTranslations } from '../../i18n/i18n.generated';
import { compareSync } from 'bcrypt';
import { hashPassword } from '../../shared/utils/password.util';

@UseGuards(JwtAuthGuard)
@Resolver()
export class ProfileResolver {
  constructor(
    private userService: UserService,
    private redisService: RedisService,
    private i18n: I18nService<I18nTranslations>,
  ) {}

  @Query(() => User)
  async authUser(@AuthUser() authUser: User) {
    try {
      return authUser;
    } catch (error) {
      handleError(error);
    }
  }

  @Mutation(() => User, { name: 'updateAuthUser' })
  async update(
    @AuthUser() authUser: User,
    @Args('updateAuthUserInput', {
      type: () => UpdateAuthUserDto,
      nullable: true,
    })
    updateAuthUserInput?: UpdateAuthUserDto,
  ) {
    try {
      const { name, username, email } = updateAuthUserInput;
      const errors: ValidationError[] = [];
      const checkUsername = isNotEmpty(username)
        ? await this.userService.findOneBy({ id: Not(authUser.id), username })
        : null;
      if (isNotEmpty(checkUsername)) {
        errors.push({
          property: 'username',
          children: [],
          constraints: {
            IsNotExists: this.i18n.t('validation.IS_NOT_EXISTS', {
              args: { property: 'USERNAME' },
              lang: I18nContext.current().lang,
            }),
          },
        });
      }
      const checkEmail = isNotEmpty(email)
        ? await this.userService.findOneBy({ id: Not(authUser.id), email })
        : null;
      if (isNotEmpty(checkEmail)) {
        errors.push({
          property: 'email',
          children: [],
          constraints: {
            IsNotExists: this.i18n.t('validation.IS_NOT_EXISTS', {
              args: { property: 'EMAIL' },
              lang: I18nContext.current().lang,
            }),
          },
        });
      }
      if (errors.length > 0) throw new BadRequestException(errors);

      const updatedUser = await this.userService.update(authUser.id, {
        name,
        username,
        email,
      });

      // delete user cache
      const cacheKey = await this.redisService.keys('users:*');
      await this.redisService.del([
        ...cacheKey,
        `user:${authUser.id}`,
        `auth:${authUser.id}`,
      ]);

      return updatedUser;
    } catch (error) {
      handleError(error);
    }
  }

  @Mutation(() => Boolean, { name: 'updateAuthUserPassword' })
  async updatePassword(
    @AuthUser() authUser: User,
    @Args('updateAuthUserPasswordInput', {
      type: () => UpdateAuthUserPasswordDto,
    })
    updateAuthUserPasswordInput?: UpdateAuthUserPasswordDto,
  ) {
    try {
      const { oldPassword, newPassword } = updateAuthUserPasswordInput;
      const userWithPassword = await this.userService.findOne({
        where: { id: authUser.id },
        select: { id: true, password: true },
      });

      if (!compareSync(oldPassword, userWithPassword.password))
        throw new BadRequestException(
          this.i18n.t('error.OLD_PASSWORD_IS_INCORRECT', {
            args: {},
            lang: I18nContext.current().lang,
          }),
        );

      // update user password
      await this.userService.update(authUser.id, {
        password: hashPassword(newPassword),
      });
      return true;
    } catch (error) {
      handleError(error);
    }
  }
}
