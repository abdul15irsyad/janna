import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { User } from './entities/user.entity';
import {
  BadRequestException,
  NotFoundException,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { FindAllUserDto } from './dto/find-all-user.dto';
import { handleError } from '../shared/utils/error.util';
import { PaginatedUser } from './object-types/paginated-user.object-type';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { PermissionGuard } from '../permission/guards/permission.guard';
import { isEmpty } from 'class-validator';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { I18nTranslations } from '../i18n/i18n.generated';
import { hashPassword } from '../shared/utils/password.util';
import { useCache } from '../shared/utils/cache.util';
import { cleanNull } from '../shared/utils/object.util';
import { SUPER_ADMINISTRATOR } from '../role/role.config';
import { RedisService } from '../redis/redis.service';

@UseGuards(JwtAuthGuard)
@Resolver(() => User)
export class UserResolver {
  constructor(
    private userService: UserService,
    private redisService: RedisService,
    private i18n: I18nService<I18nTranslations>,
  ) {}

  @UseGuards(new PermissionGuard({ actionSlug: 'create', moduleSlug: 'user' }))
  @Mutation(() => User, { name: 'createUser' })
  async create(
    @Args('createUserInput', { type: () => CreateUserDto })
    createUserDto: CreateUserDto,
  ) {
    try {
      const newUser = await this.userService.create({
        ...createUserDto,
        password: hashPassword(createUserDto.password),
      });
      // delete cache
      const cacheKeys = await this.redisService.keys(`users:*`);
      await this.redisService.del(cacheKeys);
      return newUser;
    } catch (error) {
      handleError(error);
    }
  }

  @UseGuards(new PermissionGuard({ actionSlug: 'read', moduleSlug: 'user' }))
  @Query(() => PaginatedUser, { name: 'users' })
  async findAll(
    @Args('findAllUserInput', { type: () => FindAllUserDto, nullable: true })
    findAllUserDto?: FindAllUserDto,
  ) {
    try {
      const { data, totalAllData, totalPage } = await useCache(
        `users:${JSON.stringify(cleanNull(findAllUserDto))}`,
        () => this.userService.findWithPagination(findAllUserDto),
      );
      return {
        meta: {
          currentPage: data.length > 0 ? findAllUserDto?.page ?? 1 : null,
          totalPage,
          totalData: data.length,
          totalAllData,
        },
        data,
      };
    } catch (error) {
      handleError(error);
    }
  }

  @UseGuards(new PermissionGuard({ actionSlug: 'read', moduleSlug: 'user' }))
  @Query(() => User, { name: 'user' })
  async findOne(@Args('id', { type: () => String }, ParseUUIDPipe) id: string) {
    try {
      const user = await useCache(`user:${id}`, () =>
        this.userService.findOneBy({ id }),
      );
      if (isEmpty(user))
        throw new NotFoundException(
          this.i18n.t('error.NOT_FOUND', {
            args: { property: 'USER' },
            lang: I18nContext.current().lang,
          }),
        );
      return user;
    } catch (error) {
      handleError(error);
    }
  }

  @UseGuards(new PermissionGuard({ actionSlug: 'update', moduleSlug: 'user' }))
  @Mutation(() => User, { name: 'updateUser' })
  async update(@Args('updateUserInput') updateUserInput: UpdateUserDto) {
    try {
      const user = await this.userService.findOneBy({ id: updateUserInput.id });
      if (isEmpty(user))
        throw new NotFoundException(
          this.i18n.t('error.NOT_FOUND', {
            args: { property: 'USER' },
            lang: I18nContext.current().lang,
          }),
        );

      const updatedUser = await this.userService.update(updateUserInput.id, {
        ...updateUserInput,
        password: hashPassword(updateUserInput.password),
      });

      // delete cache
      const cacheKeys = await this.redisService.keys(`users:*`);
      cacheKeys.push(`user:${updateUserInput.id}`);
      cacheKeys.push(`auth:${updateUserInput.id}`);
      await this.redisService.del(cacheKeys);

      return updatedUser;
    } catch (error) {
      handleError(error);
    }
  }

  @UseGuards(new PermissionGuard({ actionSlug: 'delete', moduleSlug: 'user' }))
  @Mutation(() => Boolean, { name: 'deleteUser' })
  async remove(@Args('id', { type: () => String }, ParseUUIDPipe) id: string) {
    try {
      const user = await this.userService.findOneBy({ id });
      if (isEmpty(user))
        throw new NotFoundException(
          this.i18n.t('error.NOT_FOUND', {
            args: { property: 'USER' },
            lang: I18nContext.current().lang,
          }),
        );
      if (user.role.slug === SUPER_ADMINISTRATOR)
        throw new BadRequestException(
          this.i18n.t('error.CANNOT_DELETE_SUPER_ADMINISTRATOR_USER', {
            args: {},
            lang: I18nContext.current().lang,
          }),
        );

      // delete cache
      const cacheKeys = await this.redisService.keys(`users:*`);
      cacheKeys.push(`user:${id}`);
      cacheKeys.push(`auth:${id}`);
      await this.redisService.del(cacheKeys);

      await this.userService.softDelete(id);
      return true;
    } catch (error) {
      handleError(error);
    }
  }
}
