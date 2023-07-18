import { DataSource, DeepPartial } from 'typeorm';
import { Seeder } from '@jorgebodega/typeorm-seeding';
import { SeederEntity } from '../entities/seeder.entity';
import { v4 as uuidv4 } from 'uuid';
import { Role } from '../../role/entities/role.entity';
import slugify from 'slugify';

export default class RolesSeeder extends Seeder {
  public async run(datasource: DataSource): Promise<void> {
    // if seeder already executed
    if (
      await datasource
        .getRepository(SeederEntity)
        .findOneBy({ name: RolesSeeder.name })
    )
      return;

    const roles: DeepPartial<Role>[] = [
      {
        id: '4654802a-beff-43ac-b095-5dfb7e094b4e',
        name: 'Super Administrator',
      },
      {
        id: 'b3127901-ec8b-4e65-a4e4-be838fefb5a7',
        name: 'User',
      },
    ];
    await datasource.getRepository(Role).save(
      roles.map((role) => ({
        ...role,
        id: role.id ?? uuidv4(),
        slug: slugify(role.name, { lower: true, strict: true }),
      })),
      { chunk: 30 },
    );

    // add to seeders table
    await datasource
      .getRepository(SeederEntity)
      .save({ name: RolesSeeder.name });
  }
}
