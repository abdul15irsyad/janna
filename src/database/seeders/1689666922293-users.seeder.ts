import { DataSource, DeepPartial } from 'typeorm';
import { Seeder } from '@jorgebodega/typeorm-seeding';
import { faker } from '@faker-js/faker/locale/id_ID';
import { NODE_ENV } from '../../app.config';
import dayjs from 'dayjs';
import { SeederEntity } from '../entities/seeder.entity';
import { User } from '../../user/entities/user.entity';
import { v4 as uuidv4 } from 'uuid';
import { random } from '../../shared/utils/array.util';
import { hashPassword } from '../../shared/utils/password.util';

export default class UsersSeeder extends Seeder {
  public async run(datasource: DataSource): Promise<void> {
    // if seeder already executed
    if (
      await datasource
        .getRepository(SeederEntity)
        .findOneBy({ name: UsersSeeder.name })
    )
      return;

    const users: DeepPartial<User>[] = [];
    if (NODE_ENV !== 'production') {
      users.push({
        id: '02eee6ce-a2a2-4b5e-bb55-cfc51dfd9516',
        name: 'Super Administrator',
        username: 'superadministrator',
        email: 'info@bukapeta.com',
        emailVerifiedAt: dayjs().toDate(),
        password: 'x0TcLtjV22xXtDI',
      });
      for (let i = users.length; i < 20; i++) {
        const fullName = faker.name.fullName();
        users.push({
          name: fullName,
          username: fullName.replace(' ', '').toLowerCase(),
          email: faker.internet
            .email(fullName.split(' ')[0], fullName.split(' ')[1])
            .toLowerCase(),
          emailVerifiedAt: random([null, dayjs().toDate()]),
        });
      }
    }
    await datasource.getRepository(User).save(
      users.map((user) => ({
        ...user,
        id: user.id ?? uuidv4(),
        password: hashPassword(user.password ?? 'Qwerty123'),
      })),
      { chunk: 30 },
    );

    // add to seeders table
    await datasource
      .getRepository(SeederEntity)
      .save({ name: UsersSeeder.name });
  }
}
