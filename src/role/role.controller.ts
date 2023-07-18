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
import { FindAllUserDto } from 'src/user/dto/find-all-user.dto';

@Controller('roles')
export class RoleController {
  constructor(
    @Inject(RoleService) private roleService: RoleService,
    @Inject(UserService) private userService: UserService,
  ) {}

  @Post()
  async create(@Body() createRoleDto: CreateRoleDto) {
    try {
      const newRole = await this.roleService.create({
        ...createRoleDto,
        slug: slugify(createRoleDto.name, { lower: true, strict: true }),
      });
      return {
        message: 'create role successfull',
        data: newRole,
      };
    } catch (error) {
      handleError(error);
    }
  }

  @Get()
  async findAll(@Query() findAllRoleDto?: FindAllRoleDto) {
    try {
      const { data, totalAllData, totalPage } =
        await this.roleService.findWithPagination(findAllRoleDto);
      return {
        message: 'read all roles',
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

  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @I18n() i18n: I18nContext<I18nTranslations>,
  ) {
    try {
      const role = await this.roleService.findOneBy({ id });
      if (isEmpty(role))
        throw new NotFoundException(
          i18n.t('error.NOT_FOUND', {
            args: { property: 'role' },
          }),
        );
      return {
        message: 'read role',
        data: role,
      };
    } catch (error) {
      handleError(error);
    }
  }

  @Get(':id/users')
  async findRoleUsers(
    @Param('id', ParseUUIDPipe) id: string,
    @I18n() i18n: I18nContext<I18nTranslations>,
    @Query() findAllUserDto?: FindAllUserDto,
  ) {
    try {
      const role = await this.roleService.findOneBy({ id });
      if (isEmpty(role))
        throw new NotFoundException(
          i18n.t('error.NOT_FOUND', {
            args: { property: 'role' },
          }),
        );
      const { totalPage, totalAllData, data } =
        await this.userService.findWithPagination({
          ...findAllUserDto,
          roleId: id,
        });
      return {
        message: 'read role users',
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

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateRoleDto: UpdateRoleDto,
    @I18n() i18n: I18nContext<I18nTranslations>,
  ) {
    try {
      const role = await this.roleService.findOneBy({ id });
      if (isEmpty(role))
        throw new NotFoundException(
          i18n.t('error.NOT_FOUND', {
            args: { property: 'role' },
          }),
        );
      const updatedRole = await this.roleService.update(id, {
        ...updateRoleDto,
        slug: slugify(updateRoleDto.name, { lower: true, strict: true }),
      });
      return {
        message: 'update role successfull',
        data: updatedRole,
      };
    } catch (error) {
      handleError(error);
    }
  }

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
            args: { property: 'role' },
          }),
        );
      const usersCount = await this.roleService.countBy({ id });
      if (usersCount > 0)
        throw new BadRequestException(
          i18n.t('error.CANNOT_DELETE_HAVE_CHILDREN', {
            args: { property: 'role', children: 'user' },
          }),
        );
      await this.roleService.softDelete(id);
      return {
        message: 'delete role successfull',
      };
    } catch (error) {
      handleError(error);
    }
  }
}
