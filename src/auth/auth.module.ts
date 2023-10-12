import { Module, forwardRef } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { UserModule } from '../user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { RoleModule } from '../role/role.module';
import { JwtStrategy } from './jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { TokenModule } from '../token/token.module';
import { AuthResolver } from './resolvers/auth.resolver';
import { ProfileResolver } from './resolvers/profile.resolver';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('auth.JWT_SECRET'),
      }),
    }),
    PassportModule.register({}),
    forwardRef(() => UserModule),
    forwardRef(() => RoleModule),
    forwardRef(() => TokenModule),
    BullModule.registerQueue({
      name: 'mail',
    }),
  ],
  providers: [AuthService, JwtStrategy, AuthResolver, ProfileResolver],
})
export class AuthModule {}
