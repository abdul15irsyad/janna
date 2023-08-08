import { Global, Module, forwardRef } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from 'src/user/user.module';

@Global()
@Module({
  imports: [JwtModule, forwardRef(() => UserModule)],
  providers: [SocketGateway],
  exports: [SocketGateway],
})
export class SharedModule {}
