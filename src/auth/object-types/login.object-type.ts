import { Field, ObjectType } from '@nestjs/graphql';
import { GrantType } from '../enum/grant-type.enum';

@ObjectType({ isAbstract: true })
export abstract class TokenObject {
  @Field(() => String)
  token!: string;

  @Field(() => Number)
  expiresIn: number;
}

@ObjectType()
export class AccessToken extends TokenObject {
  @Field(() => String)
  grantType: GrantType;
}

@ObjectType()
export class RefreshToken extends TokenObject {}

@ObjectType()
export class LoginObject {
  @Field(() => AccessToken)
  accessToken: AccessToken;

  @Field(() => RefreshToken)
  refreshToken: RefreshToken;
}
