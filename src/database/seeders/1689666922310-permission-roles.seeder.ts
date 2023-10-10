import { DataSource } from 'typeorm';
import { Seeder } from '@jorgebodega/typeorm-seeding';
import { SeederEntity } from '../entities/seeder.entity';
import { Role } from '../../role/entities/role.entity';
import { Permission } from '../../permission/entities/permission.entity';
import { SUPER_ADMINISTRATOR } from '../../role/role.config';

export default class PermissionRolesSeeder extends Seeder {
  public async run(datasource: DataSource): Promise<void> {
    // if seeder already executed
    if (
      await datasource
        .getRepository(SeederEntity)
        .findOneBy({ name: PermissionRolesSeeder.name })
    )
      return;

    const roles = await datasource.getRepository(Role).find();
    const permissions = await datasource
      .getRepository(Permission)
      .find({ relations: { module: true, action: true } });

    for (const role of roles) {
      if (role.slug === SUPER_ADMINISTRATOR) role.permissions = permissions;
    }

    await datasource.getRepository(Role).save(roles);

    // add to seeders table
    await datasource
      .getRepository(SeederEntity)
      .save({ name: PermissionRolesSeeder.name });
  }
}
