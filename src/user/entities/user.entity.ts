import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../shared/entities/base.entity';
import { Role } from '../../role/entities/role.entity';

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

  @Column('uuid', { name: 'role_id' })
  roleId: string;

  @ManyToOne(() => Role, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'role_id' })
  role: Role;
}
