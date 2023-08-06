export class CreateNotificationDto {
  name: string;
  property?: object;
  notifiableType?: string;
  notifiableId?: string;
  userId?: string;
  readAt?: Date;
}
