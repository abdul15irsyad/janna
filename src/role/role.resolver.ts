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
  NotFoundException,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { RoleService } from './role.service';
import { handleError } from '../shared/utils/error.util';
import { CreateRoleDto } from './dto/create-role.dto';
import { FindAllRoleDto } from './dto/find-all-role.dto';
import { isEmpty } from 'class-validator';
import { UpdateRoleDto } from './dto/update-role.dto';
import { FindAllUserDto } from '../user/dto/find-all-user.dto';
import { PaginatedRole } from './object-types/paginated-role.object-type';
import { PaginatedUser } from '../user/object-types/paginated-user.object-type';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { PermissionGuard } from '../permission/guards/permission.guard';
import { useCache } from '../shared/utils/cache.util';
import { cleanNull } from '../shared/utils/object.util';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { I18nTranslations } from '../i18n/i18n.generated';
import { RedisService } from '../redis/redis.service';
import { SUPER_ADMINISTRATOR } from './role.config';
import slugify from 'slugify';
import { UserService } from '../user/user.service';

@UseGuards(JwtAuthGuard)
@Resolver(() => Role)
export class RoleResolver {
  constructor(
    private roleService: RoleService,
    private userService: UserService,
    private redisService: RedisService,
    private i18n: I18nService<I18nTranslations>,
  ) {}

  @UseGuards(new PermissionGuard({ actionSlug: 'create', moduleSlug: 'role' }))
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

  @UseGuards(new PermissionGuard({ actionSlug: 'read', moduleSlug: 'role' }))
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

  @UseGuards(new PermissionGuard({ actionSlug: 'read', moduleSlug: 'role' }))
  @Query(() => Role, { name: 'role' })
  async findOne(@Args('id', { type: () => String }, ParseUUIDPipe) id: string) {
    try {
      const role = await this.roleService.findOneBy({ id });
      if (isEmpty(role))
        throw new NotFoundException(
          this.i18n.t('error.NOT_FOUND', {
            args: { property: 'ROLE' },
            lang: I18nContext.current().lang,
          }),
        );
      return role;
    } catch (error) {
      handleError(error);
    }
  }

  @UseGuards(new PermissionGuard({ actionSlug: 'update', moduleSlug: 'role' }))
  @Mutation(() => Role, { name: 'updateRole' })
  async update(
    @Args('updateRoleInput', { type: () => UpdateRoleDto })
    updateRoleDto: UpdateRoleDto,
  ) {
    try {
      const role = await this.roleService.findOneBy({ id: updateRoleDto.id });
      if (role.slug === SUPER_ADMINISTRATOR)
        throw new BadRequestException(
          this.i18n.t('error.CANNOT_UPDATE_ROLE_SUPER_ADMINISTRATOR', {
            args: {},
            lang: I18nContext.current().lang,
          }),
        );
      const updatedUser = await this.roleService.update(updateRoleDto.id, {
        ...updateRoleDto,
        slug: slugify(updateRoleDto.name, { lower: true, strict: true }),
      });
      // delete cache
      const cacheKeys = [];
      cacheKeys.push(...(await this.redisService.keys(`roles:*`)));
      cacheKeys.push(...(await this.redisService.keys(`users:*`)));
      cacheKeys.push(`role:${updateRoleDto.id}`);
      await this.redisService.del(cacheKeys);

      return updatedUser;
    } catch (error) {
      handleError(error);
    }
  }

  @UseGuards(new PermissionGuard({ actionSlug: 'delete', moduleSlug: 'role' }))
  @Mutation(() => Boolean, { name: 'deleteRole' })
  async remove(@Args('id', { type: () => String }, ParseUUIDPipe) id: string) {
    try {
      const role = await this.roleService.findOneBy({ id });
      if (role.slug === SUPER_ADMINISTRATOR)
        throw new BadRequestException(
          this.i18n.t('error.CANNOT_DELETE_ROLE_SUPER_ADMINISTRATOR', {
            args: {},
            lang: I18nContext.current().lang,
          }),
        );
      const usersCount = await this.userService.countBy({ roleId: id });
      if (usersCount > 0)
        throw new BadRequestException(
          this.i18n.t('error.CANNOT_DELETE_HAVE_CHILDREN', {
            args: { property: 'ROLE', children: 'USER' },
            lang: I18nContext.current().lang,
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
      const options = {
        ...findAllUserDto,
        roleId: role.id,
      };
      const { totalPage, totalAllData, data } = await useCache(
        `users:${JSON.stringify(cleanNull(options))}`,
        () => this.userService.findWithPagination(options),
      );
      return {
        meta: {
          currentPage: totalAllData > 0 ? findAllUserDto?.page ?? 1 : null,
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
