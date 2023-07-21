import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { Role } from './entities/role.entity';
import {
  BadRequestException,
  Inject,
  NotFoundException,
  ParseUUIDPipe,
} from '@nestjs/common';
import { RoleService } from './role.service';
import { handleError } from '../shared/utils/error.util';
import { RedisService } from '../redis/redis.service';
import { CreateRoleDto } from './dto/create-role.dto';
import slugify from 'slugify';
import { FindAllRoleDto } from './dto/find-all-role.dto';
import { useCache } from '../shared/utils/cache.util';
import { cleanNull } from '../shared/utils/object.util';
import { I18n, I18nContext } from 'nestjs-i18n';
import { I18nTranslations } from '../i18n/i18n.generated';
import { isEmpty, isNotEmpty } from 'class-validator';
import { UpdateRoleDto } from './dto/update-role.dto';
import { UserService } from '../user/user.service';
import { FindAllUserDto } from '../user/dto/find-all-user.dto';
import { PaginatedRole } from './object-types/paginated-role.object-type';
import { PaginatedUser } from '../user/object-types/paginated-user.object-type';

@Resolver(() => Role)
export class RoleResolver {
  constructor(
    @Inject(RoleService) private roleService: RoleService,
    @Inject(UserService) private userService: UserService,
    @Inject(RedisService) private redisService: RedisService,
  ) {}

  @Mutation(() => Role, { name: 'createRole' })
  async create(
    @Args('createRoleInput', { type: () => CreateRoleDto })
    createRoleDto: CreateRoleDto,
  ) {
    try {
      const newRole = await this.roleService.create({
        ...createRoleDto,
        slug: slugify(createRoleDto.name, { lower: true, strict: true }),
      });
      // delete cache
      const cacheKeys = await this.redisService.keys(`roles:*`);
      await this.redisService.del(cacheKeys);
      return newRole;
    } catch (error) {
      handleError(error);
    }
  }

  @Query(() => PaginatedRole, { name: 'roles' })
  async findAll(
    @Args('findAllRoleInput', { type: () => FindAllRoleDto, nullable: true })
    findAllRoleDto?: FindAllRoleDto,
  ) {
    try {
      const { data, totalAllData, totalPage } = await useCache(
        `roles:${JSON.stringify(cleanNull(findAllRoleDto))}`,
        () => this.roleService.findWithPagination(findAllRoleDto),
      );
      return {
        meta: {
          currentPage: data.length > 0 ? findAllRoleDto?.page ?? 1 : null,
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

  @Query(() => Role, { name: 'role' })
  async findOne(
    @Args('id', { type: () => String }, ParseUUIDPipe) id: string,
    @I18n() i18n: I18nContext<I18nTranslations>,
  ) {
    try {
      const role = await useCache(`role:${id}`, () =>
        this.roleService.findOneBy({ id }),
      );
      if (isEmpty(role))
        throw new NotFoundException(
          i18n.t('error.NOT_FOUND', {
            args: { property: 'ROLE' },
          }),
        );
      return role;
    } catch (error) {
      handleError(error);
    }
  }

  @Mutation(() => Role, { name: 'updateRole' })
  async update(
    @Args('updateRoleInput', { type: () => UpdateRoleDto })
    updateRoleDto: UpdateRoleDto,
    @I18n() i18n: I18nContext<I18nTranslations>,
  ) {
    try {
      const { id } = updateRoleDto;
      const role = await useCache(`role:${id}`, () =>
        this.roleService.findOneBy({ id }),
      );
      if (isEmpty(role))
        throw new NotFoundException(
          i18n.t('error.NOT_FOUND', {
            args: { property: 'ROLE' },
          }),
        );
      const updatedRole = await this.roleService.update(id, {
        ...updateRoleDto,
        slug: slugify(updateRoleDto.name, { lower: true, strict: true }),
      });
      // delete cache
      const cacheKeys = await this.redisService.keys(`roles:*`);
      await this.redisService.del([...cacheKeys, `role:${id}`]);
      return updatedRole;
    } catch (error) {
      handleError(error);
    }
  }

  @Mutation(() => Boolean, { name: 'deleteRole' })
  async remove(
    @Args('id', { type: () => String }, ParseUUIDPipe) id: string,
    @I18n() i18n: I18nContext<I18nTranslations>,
  ) {
    try {
      const role = await this.roleService.findOneBy({ id });
      if (isEmpty(role))
        throw new NotFoundException(
          i18n.t('error.NOT_FOUND', {
            args: { property: 'ROLE' },
          }),
        );
      const usersCount = await this.userService.countBy({ roleId: id });
      if (usersCount > 0)
        throw new BadRequestException(
          i18n.t('error.CANNOT_DELETE_HAVE_CHILDREN', {
            args: { property: 'ROLE', children: 'USER' },
          }),
        );
      await this.roleService.softDelete(id);
      // delete cache
      const cacheKeys = await this.redisService.keys(`roles:*`);
      await this.redisService.del([...cacheKeys, `role:${id}`]);
      return true;
    } catch (error) {
      handleError(error);
    }
  }

  @ResolveField(() => PaginatedUser, { nullable: true })
  async users(
    @Parent() role: Role,
    @Args('findAllUserInput', { type: () => FindAllUserDto, nullable: true })
    findAllUserDto: FindAllUserDto,
  ) {
    try {
      if (isNotEmpty(role.users)) return role.users;
      const { totalPage, totalAllData, data } =
        await this.userService.findWithPagination({
          ...findAllUserDto,
          roleId: role.id,
        });
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
}
