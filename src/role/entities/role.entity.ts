import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from '../../shared/entities/base.entity';
import { User } from '../../user/entities/user.entity';
import { Field, ObjectType } from '@nestjs/graphql';

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
}
