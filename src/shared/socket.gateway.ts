import { InternalServerErrorException, Logger } from '@nestjs/common';
import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { User } from '../user/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { JWT_SECRET } from '../auth/auth.config';
import { UserService } from '../user/user.service';
import { JWTType } from '../auth/enum/jwt-type.enum';

type UserWithSocket = User & { client: Socket };

@WebSocketGateway()
export class SocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;
  logger: Logger;
  users: UserWithSocket[] = [];

  constructor(
    private jwtService: JwtService,
    private userService: UserService,
  ) {
    this.logger = new Logger(SocketGateway.name);
  }

  afterInit() {
    this.logger.log('Gateway Initialized');
  }

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.headers.authorization.split(' ')[1];
      const payload: { id: string; type: JWTType } = this.jwtService.verify(
        token,
        { secret: JWT_SECRET },
      );
      if (!this.users.find((user) => user.id === payload.id)) {
        const authUser = await this.userService.findOneById(payload.id);
        if (!this.users.find((user) => user.id === authUser.id)) {
          (authUser as UserWithSocket).client = client;
          this.users.push(authUser as UserWithSocket);
        }
      }
    } catch (error) {
      client.disconnect();
      if (error instanceof InternalServerErrorException) console.error(error);
    }
  }

  async handleDisconnect(client: Socket) {
    const authUser = await this.getAuthUser(client);
    this.users = this.users.filter((user) => user.id !== authUser.id);
  }

  @SubscribeMessage('newNotification')
  handleNewNotification(@MessageBody() body: any) {
    console.log(body);
    this.server.sockets.emit('onNewNotification', body);
  }

  async getAuthUser(client: Socket) {
    const token = client.handshake.headers.authorization.split(' ')[1];
    const payload: { id: string; type: JWTType } = this.jwtService.verify(
      token,
      { secret: JWT_SECRET },
    );
    const authUser = this.users.find((user) => user.id === payload.id);
    if (authUser) return authUser;

    const newUser = await this.userService.findOneById(payload.id);
    if (!this.users.find((user) => user.id === newUser.id)) {
      (authUser as UserWithSocket).client = client;
      this.users.push(authUser as UserWithSocket);
    }
    return newUser;
  }
}
