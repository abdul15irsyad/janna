import { InputType } from '@nestjs/graphql';
import { FindAllDto } from '../../shared/dto/find-all.dto';

@InputType()
export class FindAllFileDto extends FindAllDto {}
