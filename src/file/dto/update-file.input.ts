import { CreateFileInput } from './create-file.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateFileInput extends PartialType(CreateFileInput) {
  @Field(() => Int)
  id: number;
}
