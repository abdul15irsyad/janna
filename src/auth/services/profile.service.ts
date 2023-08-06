import {
  BadRequestException,
  Injectable,
  ValidationError,
} from '@nestjs/common';
import { RedisService } from '../../redis/redis.service';
import { isNotEmpty } from 'class-validator';
import { Not, Repository } from 'typeorm';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { I18nTranslations } from '../../i18n/i18n.generated';
import { compareSync } from 'bcrypt';
import { hashPassword } from '../../shared/utils/password.util';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../user/entities/user.entity';
import { UserService } from '../../user/user.service';
import { UpdateAuthUserDto } from '../dto/update-auth-user.dto';
import { UpdateAuthUserPasswordDto } from '../dto/update-auth-user-password.dto';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    private userService: UserService,
    private redisService: RedisService,
    private i18n: I18nService<I18nTranslations>,
  ) {}

  async update(authUser: User, updateAuthUserDto: UpdateAuthUserDto) {
    const { id } = authUser;
    const { name, username, email } = updateAuthUserDto;
    const errors: ValidationError[] = [];
    const checkUsername = isNotEmpty(username)
      ? await this.userRepo.findOneBy({ id: Not(id), username })
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
      ? await this.userRepo.findOneBy({ id: Not(id), email })
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
    await this.userRepo.update(id, {
      name,
      username,
      email,
    });
    const updatedUser = await this.userService.findOne(id);

    // delete user cache
    const cacheKey = await this.redisService.keys('users:*');
    await this.redisService.del([...cacheKey, `user:${id}`, `auth:${id}`]);

    return updatedUser;
  }

  async updatePassword(
    authUser: User,
    updateAuthUserPasswordDto: UpdateAuthUserPasswordDto,
  ) {
    const { id } = authUser;
    const { oldPassword, newPassword } = updateAuthUserPasswordDto;
    const userWithPassword = await this.userRepo.findOne({
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
    await this.userRepo.update(id, {
      password: hashPassword(newPassword),
    });
    const updatedUser = await this.userService.findOne(id);

    return updatedUser;
  }
}
