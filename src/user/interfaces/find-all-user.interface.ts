import { FindAll } from '../../shared/interfaces/find-all.interface';

export interface FindAllUser extends FindAll {
  roleId?: string;
}
