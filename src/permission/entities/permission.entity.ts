import { Field, ObjectType } from '@nestjs/graphql';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
} from 'typeorm';
import { BaseEntity } from '../../shared/entities/base.entity';
import { Role } from '../../role/entities/role.entity';
import { Action } from './action.entity';
import { Module } from './module.entity';

@Entity('permissions')
@ObjectType()
export class Permission extends BaseEntity {
  @Column('uuid', { name: 'action_id' })
  actionId: string;

  @Field(() => Action, { nullable: true })
  @ManyToOne(() => Action, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'action_id' })
  action: Action;

  @Column('uuid', { name: 'module_id' })
  moduleId: string;

  @Field(() => Module, { nullable: true })
  @ManyToOne(() => Module, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'module_id' })
  module: Module;

  @ManyToMany(() => Role, (role: Role) => role.permissions, {
    onDelete: 'CASCADE',
    onUpdate: 'NO ACTION',
  })
  @JoinTable({
    name: 'permission_roles',
    joinColumn: {
      name: 'permission_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'role_id',
      referencedColumnName: 'id',
    },
  })
  roles: Role[];
}
