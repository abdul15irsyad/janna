import {
  BadRequestException,
  Inject,
  Injectable,
  ValidationError,
} from '@nestjs/common';
import { UserService } from '../../user/user.service';
import { RedisService } from '../../redis/redis.service';
import { isNotEmpty } from 'class-validator';
import { Not } from 'typeorm';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { I18nTranslations } from '../../i18n/i18n.generated';
import { compareSync } from 'bcrypt';
import { hashPassword } from '../../shared/utils/password.util';

@Injectable()
export class ProfileService {
  constructor(
    @Inject(UserService) private userService: UserService,
    @Inject(RedisService) private redisService: RedisService,
    @Inject(I18nService) private i18n: I18nService<I18nTranslations>,
  ) {}

  async update({
    id,
    name,
    username,
    email,
  }: {
    id: string;
    name?: string;
    username?: string;
    email?: string;
  }) {
    const errors: ValidationError[] = [];
    const checkUsername = isNotEmpty(username)
      ? await this.userService.findOneBy([{ id: Not(id), username }])
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
      ? await this.userService.findOneBy([{ id: Not(id), email }])
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
    const updatedUser = await this.userService.update(id, {
      name,
      username,
      email,
    });

    // delete user cache
    const cacheKey = await this.redisService.keys('users:*');
    await this.redisService.del([...cacheKey, `user:${id}`, `auth:${id}`]);

    return updatedUser;
  }

  async updatePassword({
    id,
    oldPassword,
    newPassword,
  }: {
    id: string;
    oldPassword: string;
    newPassword: string;
  }) {
    const userWithPassword = await this.userService.findOne({
      where: { id },
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
    const updatedUser = await this.userService.update(id, {
      password: hashPassword(newPassword),
    });

    return updatedUser;
  }
}
