import {
  Controller,
  Get,
  Param,
  Inject,
  UseGuards,
  Query,
} from '@nestjs/common';
import { PermissionService } from './permission.service';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { handleError } from '../shared/utils/error.util';
import { I18n, I18nContext } from 'nestjs-i18n';
import { I18nTranslations } from '../i18n/i18n.generated';
import { FindAllPermissionDto } from './dto/find-all-permission.dto';
import { PermissionGuard } from './guards/permission.guard';

@UseGuards(JwtAuthGuard)
@Controller('permissions')
export class PermissionController {
  constructor(
    @Inject(PermissionService) private permissionService: PermissionService,
  ) {}

  @UseGuards(
    new PermissionGuard({ actionSlug: 'read', moduleSlug: 'permission' }),
  )
  @Get()
  async findAll(
    @I18n() i18n: I18nContext<I18nTranslations>,
    @Query() findAllPermissionDto?: FindAllPermissionDto,
  ) {
    try {
      const { data, totalAllData, totalPage } =
        await this.permissionService.findAll(findAllPermissionDto);
      return {
        message: i18n.t('common.READ_ALL', {
          args: { property: 'PERMISSION' },
        }),
        meta: {
          currentPage: data.length > 0 ? findAllPermissionDto?.page ?? 1 : null,
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
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @I18n() i18n: I18nContext<I18nTranslations>,
  ) {
    try {
      const permission = await this.permissionService.findOne(id);
      return {
        message: i18n.t('common.READ', {
          args: { property: 'PERMISSION' },
        }),
        data: permission,
      };
    } catch (error) {
      handleError(error);
    }
  }
}
