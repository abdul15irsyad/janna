import { Injectable } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';
import { User } from '../user/entities/user.entity';
import { DeepPartial } from 'typeorm';
import { NEW_NOTIFICATION } from './socket.config';

@Injectable()
export class SocketService {
  constructor(private socketGateway: SocketGateway) {}

  async emitNotification(
    toUsers: User[],
    notification: DeepPartial<Notification>,
  ) {
    this.socketGateway.server
      .to(
        this.socketGateway.users
          .filter((user) => toUsers.find((toUser) => toUser.id === user.id))
          .map((user) => user.socketIds)
          .flat(),
      )
      .emit(NEW_NOTIFICATION, notification);
  }
}
