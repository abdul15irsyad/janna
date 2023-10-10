import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../shared/entities/base.entity';
import { Role } from '../../role/entities/role.entity';
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
@Entity('users')
export class User extends BaseEntity {
  @Field(() => String)
  @Column('varchar')
  name: string;

  @Field(() => String)
  @Index({ unique: true, where: 'deleted_at is null' })
  @Column('varchar')
  username: string;

  @Field(() => String)
  @Index({ unique: true, where: 'deleted_at is null' })
  @Column('varchar')
  email: string;

  @Field(() => Date, { nullable: true })
  @Column('timestamptz', { name: 'email_verified_at', nullable: true })
  emailVerifiedAt?: Date;

  @Column('varchar', { select: false })
  password: string;

  @Field(() => String)
  @Column('uuid', { name: 'role_id' })
  roleId: string;

  @Field(() => Role, { nullable: true })
  @ManyToOne(() => Role, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'role_id' })
  role: Role;
}
