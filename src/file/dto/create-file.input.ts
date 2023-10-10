import { InputType, Field } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';
import { FileUpload, GraphQLUpload } from 'graphql-upload-ts';

@InputType()
export class CreateFileInput {
  @Field(() => GraphQLUpload, { nullable: true })
  @IsOptional()
  file?: Promise<FileUpload>;
}
