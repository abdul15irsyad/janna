import { ObjectType } from '@nestjs/graphql';
import { LoginObject } from './login.object-type';

@ObjectType()
export class RefreshTokenObject extends LoginObject {}
