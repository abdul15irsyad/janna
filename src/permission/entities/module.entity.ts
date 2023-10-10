import { ObjectType, Field } from '@nestjs/graphql';
import { BaseEntity } from '../../shared/entities/base.entity';
import { Column, Entity, Index } from 'typeorm';

@Entity('modules')
@ObjectType()
export class Module extends BaseEntity {
  @Field(() => String)
  @Column('varchar')
  name: string;

  @Field(() => String)
  @Index({ unique: true, where: 'deleted_at is null' })
  @Column('varchar', { unique: true })
  slug: string;

  @Field(() => String, { nullable: true })
  @Column('text', { nullable: true })
  desc?: string;
}
