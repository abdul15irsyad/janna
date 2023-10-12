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
import { UserService } from '../user/user.service';
import { JWTType } from '../auth/enum/jwt-type.enum';
import { isEmpty } from 'class-validator';
import { ConfigService } from '@nestjs/config';

type UserWithSocket = User & { socketIds?: string[] };

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
    private configService: ConfigService,
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
        { secret: this.configService.get<string>('auth.JWT_SECRET') },
      );
      const newUser: UserWithSocket =
        this.users.find((user) => user.id === payload.id) ??
        (await this.userService.findOneBy({ id: payload.id }));
      newUser.socketIds = newUser.socketIds ?? [];
      if (!newUser.socketIds.find((socketId) => socketId === client.id))
        newUser.socketIds = [...newUser.socketIds, client.id];
      this.users = this.users.map((user) =>
        user.id === newUser.id ? newUser : user,
      );
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
      { secret: this.configService.get<string>('auth.JWT_SECRET') },
    );
    const authUser = this.users.find((user) => user.id === payload.id);
    if (isEmpty(authUser)) return null;
    return authUser;
  }
}
