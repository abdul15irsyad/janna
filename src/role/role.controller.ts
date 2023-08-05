import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Inject,
  ParseUUIDPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { handleError } from '../shared/utils/error.util';
import { I18n, I18nContext } from 'nestjs-i18n';
import { I18nTranslations } from '../i18n/i18n.generated';
import { FindAllRoleDto } from './dto/find-all-role.dto';
import { FindAllUserDto } from '../user/dto/find-all-user.dto';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { PermissionGuard } from '../permission/guards/permission.guard';

@UseGuards(JwtAuthGuard)
@Controller('roles')
export class RoleController {
  constructor(@Inject(RoleService) private roleService: RoleService) {}

  @UseGuards(new PermissionGuard({ actionSlug: 'create', moduleSlug: 'role' }))
  @Post()
  async create(
    @Body() createRoleDto: CreateRoleDto,
    @I18n() i18n: I18nContext<I18nTranslations>,
  ) {
    try {
      const newRole = await this.roleService.create(createRoleDto);
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
      const { data, totalAllData, totalPage } = await this.roleService.findAll(
        findAllRoleDto,
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
      const role = await this.roleService.findOne(id);
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
      const { data, totalPage, totalAllData } =
        await this.roleService.findRoleUsers(id, findAllUserDto);
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
      const updatedRole = await this.roleService.update(id, updateRoleDto);
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
      await this.roleService.remove(id);
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
