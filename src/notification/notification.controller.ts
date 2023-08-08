import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Inject,
  Param,
  ParseUUIDPipe,
  Patch,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { handleError } from '../shared/utils/error.util';
import { I18n, I18nContext } from 'nestjs-i18n';
import { I18nTranslations } from '../i18n/i18n.generated';
import { FindAllNotificationDto } from './dto/find-all-notification.dto';
import { AuthUser } from '../auth/decorators/auth-user.decorator';
import { User } from '../user/entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { SocketGateway } from 'src/shared/socket.gateway';

@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationController {
  constructor(
    private notificationService: NotificationService,
    @Inject(SocketGateway)
    private socketGateway: SocketGateway,
  ) {}

  @Get()
  async findAll(
    @AuthUser() authUser: User,
    @I18n() i18n: I18nContext<I18nTranslations>,
    @Body() findAllNotificationDto?: FindAllNotificationDto,
  ) {
    try {
      this.socketGateway.server
        .to(
          this.socketGateway.users
            .filter((user) => user.role.slug === 'super-administrator')
            .map((user) => user.client.id),
        )
        .emit('onNewNotification', { message: 'only to super administrator' });
      const { data, totalAllData, totalPage } =
        await this.notificationService.findAll(
          authUser.id,
          findAllNotificationDto,
        );
      return {
        message: i18n.t('common.READ_ALL', {
          args: { property: 'NOTIFICATION' },
        }),
        meta: {
          currentPage:
            data.length > 0 ? findAllNotificationDto?.page ?? 1 : null,
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
    @AuthUser() authUser: User,
    @Param('id', ParseUUIDPipe) id: string,
    @I18n() i18n: I18nContext<I18nTranslations>,
  ) {
    try {
      const user = await this.notificationService.findOneById(authUser.id, id);
      return {
        message: i18n.t('common.READ', {
          args: { property: 'NOTIFICATION' },
        }),
        data: user,
      };
    } catch (error) {
      handleError(error);
    }
  }

  @Patch('/mark-all-as-read')
  async markAllAsRead(
    @AuthUser() authUser: User,
    @I18n() i18n: I18nContext<I18nTranslations>,
  ) {
    try {
      await this.notificationService.markAllAsRead(authUser.id);
      return {
        message: i18n.t('common.MARK_ALL_AS_READ', {
          args: { property: 'NOTIFICATION' },
        }),
      };
    } catch (error) {
      handleError(error);
    }
  }
}
