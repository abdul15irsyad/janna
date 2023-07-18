import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from '../../shared/entities/base.entity';
import { User } from '../../user/entities/user.entity';

@Entity('roles')
export class Role extends BaseEntity {
  @Column('varchar')
  name: string;

  @Column('varchar')
  slug: string;

  @OneToMany(() => User, (user: User) => user.role)
  users: User[];
}
