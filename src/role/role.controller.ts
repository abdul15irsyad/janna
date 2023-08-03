import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Inject,
  NotFoundException,
  ParseUUIDPipe,
  Query,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import slugify from 'slugify';
import { handleError } from '../shared/utils/error.util';
import { I18n, I18nContext } from 'nestjs-i18n';
import { I18nTranslations } from '../i18n/i18n.generated';
import { isEmpty } from 'class-validator';
import { FindAllRoleDto } from './dto/find-all-role.dto';
import { UserService } from '../user/user.service';
import { FindAllUserDto } from '../user/dto/find-all-user.dto';
import { useCache } from '../shared/utils/cache.util';
import { RedisService } from '../redis/redis.service';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { SUPER_ADMINISTRATOR } from './role.config';
import { PermissionGuard } from '../permission/guards/permission.guard';

@UseGuards(JwtAuthGuard)
@Controller('roles')
export class RoleController {
  constructor(
    @Inject(RoleService) private roleService: RoleService,
    @Inject(UserService) private userService: UserService,
    @Inject(RedisService) private redisService: RedisService,
  ) {}

  @UseGuards(new PermissionGuard({ actionSlug: 'create', moduleSlug: 'role' }))
  @Post()
  async create(
    @Body() createRoleDto: CreateRoleDto,
    @I18n() i18n: I18nContext<I18nTranslations>,
  ) {
    try {
      const newRole = await this.roleService.create({
        ...createRoleDto,
        slug: slugify(createRoleDto.name, { lower: true, strict: true }),
      });
      // delete cache
      const cacheKeys = await this.redisService.keys(`roles:*`);
      await this.redisService.del(cacheKeys);
      return {
        message: i18n.t('common.CREATE_SUCCESSFULL', {
          args: { property: 'ROLE' },
        }),
        data: newRole,
      };
    } catch (error) {
      handleError(error);
    }
  }

  @UseGuards(new PermissionGuard({ actionSlug: 'read', moduleSlug: 'role' }))
  @Get()
  async findAll(
    @I18n() i18n: I18nContext<I18nTranslations>,
    @Query() findAllRoleDto?: FindAllRoleDto,
  ) {
    try {
      const { data, totalAllData, totalPage } = await useCache(
        `roles:${JSON.stringify(findAllRoleDto)}`,
        () => this.roleService.findWithPagination(findAllRoleDto),
      );
      return {
        message: i18n.t('common.READ_ALL', {
          args: { property: 'ROLE' },
        }),
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
  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
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
      return {
        message: i18n.t('common.READ', {
          args: { property: 'ROLE' },
        }),
        data: role,
      };
    } catch (error) {
      handleError(error);
    }
  }

  @UseGuards(new PermissionGuard({ actionSlug: 'read', moduleSlug: 'role' }))
  @Get(':id/users')
  async findRoleUsers(
    @Param('id', ParseUUIDPipe) id: string,
    @I18n() i18n: I18nContext<I18nTranslations>,
    @Query() findAllUserDto?: FindAllUserDto,
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
      const { totalPage, totalAllData, data } =
        await this.userService.findWithPagination({
          ...findAllUserDto,
          roleId: id,
        });
      return {
        message: i18n.t('common.READ_ROLE_USERS', {
          args: { property: 'ROLE' },
        }),
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

  @UseGuards(new PermissionGuard({ actionSlug: 'update', moduleSlug: 'role' }))
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateRoleDto: UpdateRoleDto,
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
      if (role.slug === SUPER_ADMINISTRATOR)
        throw new BadRequestException(
          i18n.t('error.CANNOT_UPDATE_ROLE_SUPER_ADMINISTRATOR', {
            args: {},
          }),
        );
      const updatedRole = await this.roleService.update(id, {
        ...updateRoleDto,
        slug: slugify(updateRoleDto.name, { lower: true, strict: true }),
      });
      // delete cache
      const cacheKeys = await this.redisService.keys(`roles:*`);
      await this.redisService.del([...cacheKeys, `role:${id}`]);
      return {
        message: i18n.t('common.UPDATE_SUCCESSFULL', {
          args: { property: 'ROLE' },
        }),
        data: updatedRole,
      };
    } catch (error) {
      handleError(error);
    }
  }

  @UseGuards(new PermissionGuard({ actionSlug: 'delete', moduleSlug: 'role' }))
  @Delete(':id')
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
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
      if (role.slug === SUPER_ADMINISTRATOR)
        throw new BadRequestException(
          i18n.t('error.CANNOT_DELETE_ROLE_SUPER_ADMINISTRATOR', {
            args: {},
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
      return {
        message: i18n.t('common.DELETE_SUCCESSFULL', {
          args: { property: 'ROLE' },
        }),
      };
    } catch (error) {
      handleError(error);
    }
  }
}
