import { DataSource, DeepPartial } from 'typeorm';
import { Seeder } from '@jorgebodega/typeorm-seeding';
import { faker } from '@faker-js/faker/locale/id_ID';
import { NODE_ENV } from '../../app.config';
import dayjs from 'dayjs';
import { SeederEntity } from '../entities/seeder.entity';
import { User } from '../../user/entities/user.entity';
import { v4 as uuidv4 } from 'uuid';
import { hashPassword } from '../../shared/utils/password.util';
import { Role } from '../../role/entities/role.entity';

export default class UsersSeeder extends Seeder {
  public async run(datasource: DataSource): Promise<void> {
    // if seeder already executed
    if (
      await datasource
        .getRepository(SeederEntity)
        .findOneBy({ name: UsersSeeder.name })
    )
      return;

    const roles = await datasource.getRepository(Role).find();

    const users: DeepPartial<User>[] = [];
    users.push({
      id: '02eee6ce-a2a2-4b5e-bb55-cfc51dfd9516',
      name: 'Super Administrator',
      username: 'superadministrator',
      email: 'abdul15irsyad@gmail.com',
      emailVerifiedAt: dayjs().toDate(),
      password: 'x0TcLtjV22xXtDI',
      role: roles.find((role) => role.slug === 'super-administrator'),
    });
    if (NODE_ENV !== 'production') {
      users.push({
        id: '4bb84107-c197-43a0-9545-de815fc438a1',
        name: 'Teguh Irawan',
        username: 'teguh',
        email: 'teguh@email.com',
        password: 'Qwerty123',
        role: roles.find((role) => role.slug === 'user'),
      });
      for (let i = users.length; i < 20; i++) {
        const fullName = faker.name.fullName();
        users.push({
          name: fullName,
          username: fullName.replace(' ', '').toLowerCase(),
          email: faker.internet
            .email(fullName.split(' ')[0], fullName.split(' ')[1])
            .toLowerCase(),
          emailVerifiedAt: null,
          role: roles.find((role) => role.slug === 'user'),
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
