import { DataSource, DeepPartial } from 'typeorm';
import { Seeder } from '@jorgebodega/typeorm-seeding';
import { NODE_ENV } from '../../app.config';
import dayjs from 'dayjs';
import { SeederEntity } from '../entities/seeder.entity';
import { Notification } from '../../notification/entities/notification.entity';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../../user/entities/user.entity';
import { SUPER_ADMINISTRATOR } from '../../role/role.config';
import { random } from '../../shared/utils/array.util';
import { randomDate } from '../../shared/utils/date.util';

export default class NotificationsSeeder extends Seeder {
  public async run(datasource: DataSource): Promise<void> {
    // if seeder already executed
    if (
      await datasource
        .getRepository(SeederEntity)
        .findOneBy({ name: NotificationsSeeder.name })
    )
      return;

    const users = await datasource
      .getRepository(User)
      .find({ relations: { role: true } });

    const notifications: DeepPartial<Notification>[] = [];
    if (NODE_ENV !== 'production') {
      for (const user of users.filter((user) => user.role.slug === 'user')) {
        notifications.push({
          name: 'REGISTERED',
          args: { property: 'USER' },
          notifiableType: 'User',
          notifiableId: user.id,
          user: users.find((user) => user.role.slug === SUPER_ADMINISTRATOR),
          readAt: random([
            null,
            randomDate(dayjs().subtract(5, 'days').toDate(), dayjs().toDate()),
          ]),
        });
      }
    }
    await datasource.getRepository(Notification).save(
      notifications.map((notification) => ({
        ...notification,
        id: uuidv4(),
      })),
      { chunk: 30 },
    );

    // add to seeders table
    await datasource
      .getRepository(SeederEntity)
      .save({ name: NotificationsSeeder.name });
  }
}
