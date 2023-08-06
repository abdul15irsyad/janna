import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { Role } from './entities/role.entity';
import { Inject, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { RoleService } from './role.service';
import { handleError } from '../shared/utils/error.util';
import { CreateRoleDto } from './dto/create-role.dto';
import { FindAllRoleDto } from './dto/find-all-role.dto';
import { isNotEmpty } from 'class-validator';
import { UpdateRoleDto } from './dto/update-role.dto';
import { FindAllUserDto } from '../user/dto/find-all-user.dto';
import { PaginatedRole } from './object-types/paginated-role.object-type';
import { PaginatedUser } from '../user/object-types/paginated-user.object-type';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { PermissionGuard } from '../permission/guards/permission.guard';

@UseGuards(JwtAuthGuard)
@Resolver(() => Role)
export class RoleResolver {
  constructor(@Inject(RoleService) private roleService: RoleService) {}

  @UseGuards(new PermissionGuard({ actionSlug: 'create', moduleSlug: 'role' }))
  @Mutation(() => Role, { name: 'createRole' })
  async create(
    @Args('createRoleInput', { type: () => CreateRoleDto })
    createRoleDto: CreateRoleDto,
  ) {
    try {
      const newRole = await this.roleService.create(createRoleDto);
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
      const { data, totalAllData, totalPage } = await this.roleService.findAll(
        findAllRoleDto,
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
      const role = await this.roleService.findOneById(id);
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
      const updatedRole = await this.roleService.update(
        updateRoleDto.id,
        updateRoleDto,
      );
      return updatedRole;
    } catch (error) {
      handleError(error);
    }
  }

  @UseGuards(new PermissionGuard({ actionSlug: 'delete', moduleSlug: 'role' }))
  @Mutation(() => Boolean, { name: 'deleteRole' })
  async remove(@Args('id', { type: () => String }, ParseUUIDPipe) id: string) {
    try {
      await this.roleService.remove(id);
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
        await this.roleService.findRoleUsers(role.id, findAllUserDto);
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
