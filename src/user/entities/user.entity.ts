import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../shared/entities/base.entity';

@Entity('users')
export class User extends BaseEntity {
  @Column('varchar')
  name: string;

  @Column('varchar')
  username: string;

  @Column('varchar')
  email: string;

  @Column('timestamptz', { name: 'email_verified_at', nullable: true })
  emailVerifiedAt?: Date;

  @Column('varchar', { select: false })
  password: string;
}
