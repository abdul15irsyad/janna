import { Global, Module, forwardRef } from '@nestjs/common';
import { SocketGateway } from '../socket/socket.gateway';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';
import { SocketService } from './socket.service';

@Global()
@Module({
  imports: [JwtModule, forwardRef(() => UserModule)],
  providers: [SocketGateway, SocketService],
  exports: [SocketGateway, SocketService],
})
export class SocketModule {}
