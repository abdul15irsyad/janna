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
import { FindAllPermissionDto } from './dto/find-all-permission.dto';
import { handleError } from '../shared/utils/error.util';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { PermissionGuard } from './guards/permission.guard';
import { useCache } from '../shared/utils/cache.util';
import { cleanNull, setMeta } from '../shared/utils/object.util';
import { isEmpty } from 'class-validator';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { I18nTranslations } from '../i18n/i18n.generated';

@UseGuards(JwtAuthGuard)
@Resolver(() => Permission)
export class PermissionResolver {
  constructor(
    @Inject(PermissionService) private permissionService: PermissionService,
    private i18n: I18nService<I18nTranslations>,
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
      const permissions = await useCache(
        `permissions:${JSON.stringify(cleanNull(findAllPermissionInput))}`,
        () => this.permissionService.findWithPagination(findAllPermissionInput),
      );
      return {
        meta: setMeta({ page: findAllPermissionInput?.page, ...permissions }),
        data: permissions.data,
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
      const permission = await useCache(`permission:${id}`, () =>
        this.permissionService.findOneBy({ id }),
      );
      if (isEmpty(permission))
        throw new NotFoundException(
          this.i18n.t('error.NOT_FOUND', {
            args: { property: 'PERMISSION' },
            lang: I18nContext.current().lang,
          }),
        );
      return permission;
    } catch (error) {
      handleError(error);
    }
  }
}
