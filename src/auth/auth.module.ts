import { Module, forwardRef } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { JWT_SECRET } from './auth.config';
import { RoleModule } from '../role/role.module';
import { JwtStrategy } from './auth.strategy';
import { PassportModule } from '@nestjs/passport';
import { TokenModule } from '../token/token.module';
import { AuthController } from './auth.controller';
import { AuthResolver } from './auth.resolver';

@Module({
  imports: [
    JwtModule.register({
      secret: JWT_SECRET,
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    forwardRef(() => UserModule),
    forwardRef(() => RoleModule),
    forwardRef(() => TokenModule),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, AuthResolver],
})
export class AuthModule {}
