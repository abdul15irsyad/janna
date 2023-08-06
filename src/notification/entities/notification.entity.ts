import { Field, ObjectType, createUnionType } from '@nestjs/graphql';
import { BaseEntity } from '../../shared/entities/base.entity';
import { AfterLoad, Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Exclude, Transform } from 'class-transformer';
import { isEmpty, isJSON } from 'class-validator';
import { User } from '../../user/entities/user.entity';
import datasource from '../../database/database.datasource';
import { Role } from '../../role/entities/role.entity';
import { Permission } from '../../permission/entities/permission.entity';

const Notifiable = createUnionType({
  name: 'Notifiable',
  types: () => [User, Role, Permission],
});

@ObjectType()
@Entity('notifications')
export class Notification extends BaseEntity {
  @Field(() => String)
  @Column('varchar')
  name: string;

  @Column('json', { nullable: true })
  @Transform(({ value }) => (isJSON(value) ? JSON.parse(value) : value))
  args?: object;

  @Field(() => String)
  desc: string;

  @Field(() => String)
  @Exclude()
  @Column('varchar', {
    name: 'notifiable_type',
    nullable: true,
    comment: 'polymorphism entity',
  })
  notifiableType?: string;

  @Field(() => String)
  @Exclude()
  @Column('uuid', {
    name: 'notifiable_id',
    nullable: true,
    comment: 'polymorphism id',
  })
  notifiableId?: string;

  @Field(() => Notifiable, { nullable: true })
  notifiable?: any;

  @Field(() => String)
  @Column('uuid', { name: 'user_id', nullable: true })
  userId?: string;

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @Field(() => Date)
  @Column('timestamp with time zone', { name: 'read_at', nullable: true })
  readAt?: Date;

  @AfterLoad()
  async afterLoad() {
    // set notifiable
    if (isEmpty(this.notifiableType) || isEmpty(this.notifiableId)) return;
    this.notifiable = await datasource
      .getRepository(this.notifiableType)
      .findOneBy({ id: this.notifiableId });
  }
}
