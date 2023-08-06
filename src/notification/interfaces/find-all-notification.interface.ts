import { FindAll } from '../../shared/interfaces/find-all.interface';

export interface FindAllNotification extends FindAll {
  userId?: string;
  readStatus?: boolean;
}
