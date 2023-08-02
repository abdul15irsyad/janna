import { Module, forwardRef } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { UserModule } from '../user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { JWT_SECRET } from './auth.config';
import { RoleModule } from '../role/role.module';
import { JwtStrategy } from './auth.strategy';
import { PassportModule } from '@nestjs/passport';
import { TokenModule } from '../token/token.module';
import { AuthController } from './controllers/auth.controller';
import { AuthResolver } from './resolvers/auth.resolver';
import { ProfileService } from './services/profile.service';
import { ProfileResolver } from './resolvers/profile.resolver';
import { ProfileController } from './controllers/profile.controller';

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
  controllers: [AuthController, ProfileController],
  providers: [
    AuthService,
    JwtStrategy,
    ProfileService,
    AuthResolver,
    ProfileResolver,
  ],
})
export class AuthModule {}
