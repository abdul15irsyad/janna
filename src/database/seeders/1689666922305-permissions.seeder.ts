import { DataSource, DeepPartial } from 'typeorm';
import { Seeder } from '@jorgebodega/typeorm-seeding';
import { SeederEntity } from '../entities/seeder.entity';
import { v4 as uuidv4 } from 'uuid';
import { Permission } from '../../permission/entities/permission.entity';
import { Action } from '../../permission/entities/action.entity';
import { Module } from '../../permission/entities/module.entity';

export default class PermissionsSeeder extends Seeder {
  public async run(datasource: DataSource): Promise<void> {
    // if seeder already executed
    if (
      await datasource
        .getRepository(SeederEntity)
        .findOneBy({ name: PermissionsSeeder.name })
    )
      return;

    // action seeder
    const actions: DeepPartial<Action>[] = [
      {
        id: 'cb399fa8-3f2f-4f18-8490-9714c186d363',
        name: 'Create',
        slug: 'create',
      },
      {
        id: 'a165aee9-a34e-4e51-8909-21304b65e01a',
        name: 'Read',
        slug: 'read',
      },
      {
        id: 'a2786daf-dfa7-4794-b234-faec3203038e',
        name: 'Update',
        slug: 'update',
      },
      {
        id: '02bbce1d-4648-4b30-9cac-fb8b56ee9403',
        name: 'Delete',
        slug: 'delete',
      },
    ];
    await datasource.getRepository(Action).save(
      actions.map((action) => ({
        ...action,
        id: action.id ?? uuidv4(),
      })),
      { chunk: 30 },
    );

    // module seeder
    const modules: DeepPartial<Module>[] = [
      {
        id: '86b81e2c-629a-4e6f-993b-1dcb531cfeac',
        name: 'User',
        slug: 'user',
      },
      {
        id: '9fc72f6f-7310-4e3d-8769-9d77f33b0ee3',
        name: 'Role',
        slug: 'role',
      },
      {
        id: 'b9972b65-9ef3-412a-aa6a-4fb35fc0f8a9',
        name: 'Permission',
        slug: 'permission',
      },
    ];
    await datasource.getRepository(Module).save(
      modules.map((module) => ({
        ...module,
        id: module.id ?? uuidv4(),
      })),
      { chunk: 30 },
    );

    // permission seeder
    const permissions: DeepPartial<Permission>[] = [
      {
        id: '7405d682-bead-459d-ba93-3fb902aede21',
        action: actions.find((action) => action.slug === 'create'),
        module: modules.find((module) => module.slug === 'user'),
      },
      {
        id: '746f0297-b300-4d2c-bd8d-667f82ebca6d',
        action: actions.find((action) => action.slug === 'read'),
        module: modules.find((module) => module.slug === 'user'),
      },
      {
        id: '4391e396-07f2-4eb4-82b6-8f192b55defb',
        action: actions.find((action) => action.slug === 'update'),
        module: modules.find((module) => module.slug === 'user'),
      },
      {
        id: '20c69074-cfb6-4465-864e-70cd93859e2f',
        action: actions.find((action) => action.slug === 'delete'),
        module: modules.find((module) => module.slug === 'user'),
      },
      {
        id: 'cfe96485-1cb3-4b79-974d-d3385625d169',
        action: actions.find((action) => action.slug === 'create'),
        module: modules.find((module) => module.slug === 'role'),
      },
      {
        id: 'ccbed246-f553-4ca5-9655-fd1078179936',
        action: actions.find((action) => action.slug === 'read'),
        module: modules.find((module) => module.slug === 'role'),
      },
      {
        id: '50340c25-61a5-4b5c-9385-ef60bf1b9fdc',
        action: actions.find((action) => action.slug === 'update'),
        module: modules.find((module) => module.slug === 'role'),
      },
      {
        id: 'ddf8af74-df27-4eba-8724-f3e51c113e35',
        action: actions.find((action) => action.slug === 'delete'),
        module: modules.find((module) => module.slug === 'role'),
      },
      {
        id: '54e7347b-0f3b-4cdf-9f06-42cc3dd9ee71',
        action: actions.find((action) => action.slug === 'read'),
        module: modules.find((module) => module.slug === 'permission'),
      },
    ];
    await datasource.getRepository(Permission).save(
      permissions.map((permission) => ({
        ...permission,
        id: permission.id ?? uuidv4(),
      })),
      { chunk: 30 },
    );

    // add to seeders table
    await datasource
      .getRepository(SeederEntity)
      .save({ name: PermissionsSeeder.name });
  }
}
