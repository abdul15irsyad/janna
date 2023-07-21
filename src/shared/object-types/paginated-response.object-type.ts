import { Field, Int, ObjectType } from '@nestjs/graphql';

type ClassType<T = any> = new (...args: any[]) => T;

@ObjectType({ isAbstract: true })
export abstract class Meta {
  @Field(() => Int, { nullable: true })
  currentPage?: number;

  @Field(() => Int, { nullable: true })
  totalPage?: number;

  @Field(() => Int, { nullable: true })
  totalData?: number;

  @Field(() => Number, { nullable: true })
  totalAllData?: number;
}

export function PaginatedResponse<TItem>(TItemClass: ClassType<TItem>) {
  // `isAbstract` decorator option is mandatory to prevent registering in schema
  @ObjectType(`Paginated${TItemClass?.name}`, { isAbstract: true })
  abstract class PaginatedResponseClass {
    // here we use the runtime argument
    @Field(() => [TItemClass])
    // and here the generic type
    data: TItem[];

    @Field(() => Meta, { nullable: true })
    meta?: Meta;
  }
  return PaginatedResponseClass;
}
