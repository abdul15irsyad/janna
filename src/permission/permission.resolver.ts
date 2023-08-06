import { Args, Query, Resolver } from '@nestjs/graphql';
import { Permission } from './entities/permission.entity';
import { Inject, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { PermissionService } from './permission.service';
import { PaginatedPermission } from './object-types/paginated-permission.object-type';
import { FindAllPermissionDto } from './dto/find-all-permission.dto';
import { handleError } from '../shared/utils/error.util';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { PermissionGuard } from './guards/permission.guard';

@UseGuards(JwtAuthGuard)
@Resolver(() => Permission)
export class PermissionResolver {
  constructor(
    @Inject(PermissionService) private permissionService: PermissionService,
  ) {}

  @UseGuards(
    new PermissionGuard({ actionSlug: 'read', moduleSlug: 'permission' }),
  )
  @Query(() => PaginatedPermission, { name: 'permissions' })
  async findAll(
    @Args('findAllPermissionInput', {
      type: () => FindAllPermissionDto,
      nullable: true,
    })
    findAllPermissionInput?: FindAllPermissionDto,
  ) {
    try {
      const { data, totalAllData, totalPage } =
        await this.permissionService.findAll(findAllPermissionInput);
      return {
        meta: {
          currentPage:
            data.length > 0 ? findAllPermissionInput?.page ?? 1 : null,
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

  @UseGuards(
    new PermissionGuard({ actionSlug: 'read', moduleSlug: 'permission' }),
  )
  @Query(() => Permission, { name: 'permission' })
  async findOne(@Args('id', { type: () => String }, ParseUUIDPipe) id: string) {
    try {
      const permission = await this.permissionService.findOne(id);
      return permission;
    } catch (error) {
      handleError(error);
    }
  }
}
