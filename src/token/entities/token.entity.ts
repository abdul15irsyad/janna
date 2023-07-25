import { ObjectType, Field } from '@nestjs/graphql';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { TokenType } from '../enum/token-type.enum';
import { User } from '../../user/entities/user.entity';
import { Transform } from 'class-transformer';
import { isDateString } from 'class-validator';
import dayjs from 'dayjs';
import { BaseEntity } from '../../shared/entities/base.entity';

@Entity({ name: 'tokens' })
@ObjectType()
export class Token extends BaseEntity {
  @Field(() => String)
  @Column('varchar', { unique: true })
  token: string;

  @Field(() => String)
  @Column('enum', {
    enumName: 'TokenType',
    enum: TokenType,
    comment: 'tipe token',
  })
  type: TokenType;

  @Field(() => Date, { nullable: true })
  @Column('timestamp with time zone', { name: 'used_at', nullable: true })
  @Transform(({ value }) =>
    isDateString(value) ? dayjs(value).toDate() : value,
  )
  usedAt: Date;

  @Field(() => Date, { nullable: true })
  @Column('timestamp with time zone', { name: 'expired_at', nullable: true })
  @Transform(({ value }) =>
    isDateString(value) ? dayjs(value).toDate() : value,
  )
  expiredAt: Date;

  @Column('uuid', { name: 'user_id' })
  userId: string;

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
