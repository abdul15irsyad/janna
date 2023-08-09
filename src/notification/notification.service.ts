import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { FindAllNotificationDto } from './dto/find-all-notification.dto';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FindOptionsRelations,
  FindOptionsWhere,
  IsNull,
  Not,
  Repository,
} from 'typeorm';
import { isEmpty, isNotEmpty } from 'class-validator';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { I18nTranslations } from '../i18n/i18n.generated';
import { FindAllNotification } from './interfaces/find-all-notification.interface';
import { parseOrderBy } from '../shared/utils/string.util';
import { Notification } from './entities/notification.entity';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';

@Injectable()
export class NotificationService {
  private relations: FindOptionsRelations<Notification> = {
    user: true,
  };

  constructor(
    @InjectRepository(Notification)
    private notificationRepo: Repository<Notification>,
    private i18n: I18nService<I18nTranslations>,
  ) {}

  async create(createNotificationDto: CreateNotificationDto) {
    const newNotification = this.notificationRepo.create({
      ...createNotificationDto,
      id: uuidv4(),
    });
    await this.notificationRepo.save(newNotification);
    return this.findOneById(newNotification.userId, newNotification.id);
  }

  async findAll(
    authUserId: string,
    findAllNotificationDto?: FindAllNotificationDto,
  ) {
    const findAll = await this.findWithPagination({
      userId: authUserId,
      ...findAllNotificationDto,
    });
    return findAll;
  }

  async findWithPagination({
    page,
    limit,
    orderBy,
    orderDir,
    userId,
    readStatus,
  }: FindAllNotification = {}) {
    page = page ?? 1;
    orderBy = orderBy ?? 'createdAt';
    orderDir = orderDir ?? 'desc';
    const filter: FindOptionsWhere<Notification> = {
      userId: userId ?? undefined,
      readAt: isNotEmpty(readStatus)
        ? readStatus
          ? Not(IsNull())
          : IsNull()
        : undefined,
    };
    const findOptionsWhere:
      | FindOptionsWhere<Notification>
      | FindOptionsWhere<Notification>[] = filter;
    const totalAllData = await this.notificationRepo.countBy(findOptionsWhere);
    const data = (
      await this.notificationRepo.find({
        where: findOptionsWhere,
        take: limit,
        skip: limit ? (page - 1) * limit : undefined,
        order: parseOrderBy(orderBy, orderDir),
        relations: this.relations,
      })
    ).map((item) => {
      item.desc = this.i18n.t('notification.REGISTERED', {
        args: { property: (item.args as any).property as string },
        lang: I18nContext.current().lang,
      });
      return item;
    });
    const totalPage = limit
      ? Math.ceil(totalAllData / limit)
      : data.length > 0
      ? 1
      : null;
    return {
      totalPage,
      totalAllData,
      data,
    };
  }

  async findOneById(authUserId: string, id: string) {
    const notification = await this.notificationRepo.findOne({
      where: { id, userId: authUserId },
      relations: this.relations,
    });
    notification.desc = this.i18n.t('notification.REGISTERED', {
      args: { property: (notification.args as any).property as string },
      lang: I18nContext.current().lang,
    });
    if (isEmpty(notification))
      throw new NotFoundException(
        this.i18n.t('error.NOT_FOUND', {
          args: { property: 'NOTIFICATION' },
          lang: I18nContext.current().lang,
        }),
      );
    return notification;
  }

  async markAllAsRead(authUserId: string) {
    await this.notificationRepo.update(
      { userId: authUserId },
      { readAt: dayjs().toDate() },
    );
    return true;
  }
}
