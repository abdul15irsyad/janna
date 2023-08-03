import { Column, Entity, JoinTable, ManyToMany, OneToMany } from 'typeorm';
import { BaseEntity } from '../../shared/entities/base.entity';
import { User } from '../../user/entities/user.entity';
import { Field, ObjectType } from '@nestjs/graphql';
import { Permission } from '../../permission/entities/permission.entity';

@ObjectType()
@Entity('roles')
export class Role extends BaseEntity {
  @Field(() => String)
  @Column('varchar')
  name: string;

  @Field(() => String)
  @Column('varchar')
  slug: string;

  @OneToMany(() => User, (user: User) => user.role)
  users: User[];

  @ManyToMany(() => Permission, (permission: Permission) => permission.roles)
  @JoinTable({
    name: 'permission_roles',
    joinColumn: {
      name: 'role_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'permission_id',
      referencedColumnName: 'id',
    },
  })
  permissions: Permission[];
}
