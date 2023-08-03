import { Args, Query, Resolver } from '@nestjs/graphql';
import { Permission } from './entities/permission.entity';
import {
  Inject,
  NotFoundException,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { PermissionService } from './permission.service';
import { PaginatedPermission } from './object-types/paginated-permission.object-type';
import { I18n, I18nContext } from 'nestjs-i18n';
import { I18nTranslations } from '../i18n/i18n.generated';
import { FindAllPermissionDto } from './dto/find-all-permission.dto';
import { useCache } from '../shared/utils/cache.util';
import { handleError } from '../shared/utils/error.util';
import { isEmpty } from 'class-validator';
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
    @I18n() i18n: I18nContext<I18nTranslations>,
    @Args('findAllPermissionInput', {
      type: () => FindAllPermissionDto,
      nullable: true,
    })
    findAllPermissionInput?: FindAllPermissionDto,
  ) {
    try {
      const { data, totalAllData, totalPage } = await useCache(
        `permissions:${JSON.stringify(findAllPermissionInput)}`,
        () => this.permissionService.findWithPagination(findAllPermissionInput),
      );
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
  async findOne(
    @Args('id', { type: () => String }, ParseUUIDPipe) id: string,
    @I18n() i18n: I18nContext<I18nTranslations>,
  ) {
    try {
      const permission = await useCache(`permission:${id}`, () =>
        this.permissionService.findOneBy({ id }),
      );
      if (isEmpty(permission))
        throw new NotFoundException(
          i18n.t('error.NOT_FOUND', {
            args: { property: 'PERMISSION' },
          }),
        );
      return permission;
    } catch (error) {
      handleError(error);
    }
  }
}
