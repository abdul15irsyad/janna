import { ObjectType, Field } from '@nestjs/graphql';
import { BaseEntity } from '../../shared/entities/base.entity';
import { Column, Entity } from 'typeorm';

@Entity('actions')
@ObjectType()
export class Action extends BaseEntity {
  @Field(() => String)
  @Column('varchar')
  name: string;

  @Field(() => String)
  @Column('varchar', { unique: true })
  slug: string;
}
