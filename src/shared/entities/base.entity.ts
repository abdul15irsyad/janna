import { Field, ObjectType } from '@nestjs/graphql';
import {
  BeforeInsert,
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@ObjectType({ isAbstract: true })
export abstract class BaseEntity {
  @Field(() => String)
  @PrimaryColumn('uuid')
  id: string;

  @BeforeInsert()
  setId() {
    this.id = uuidv4();
  }

  @Field(() => Date)
  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @Field(() => Date)
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;

  @Field(() => Date)
  @DeleteDateColumn({
    name: 'deleted_at',
    nullable: true,
    type: 'timestamp with time zone',
    select: false,
  })
  deletedAt?: Date;
}
