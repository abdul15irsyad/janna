import { DataSource, DeepPartial } from 'typeorm';
import { Seeder } from '@jorgebodega/typeorm-seeding';
import { SeederEntity } from '../entities/seeder.entity';
import { v4 as uuidv4 } from 'uuid';
import { PermissionRole } from '../../permission/entities/permission-role.entity';
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

    const permissionRoles: DeepPartial<PermissionRole>[] = [];
    for (const permission of permissions) {
      permissionRoles.push({
        role: roles.find((role) => role.slug === SUPER_ADMINISTRATOR),
        permission,
      });
    }
    await datasource.getRepository(PermissionRole).save(
      permissionRoles.map((permissionRole) => ({
        ...permissionRole,
        id: uuidv4(),
      })),
      { chunk: 30 },
    );

    // add to seeders table
    await datasource
      .getRepository(SeederEntity)
      .save({ name: PermissionRolesSeeder.name });
  }
}
