import { ObjectType } from '@nestjs/graphql';
import { LoginObject } from './login.objects';

@ObjectType()
export class RefreshTokenObject extends LoginObject {}
