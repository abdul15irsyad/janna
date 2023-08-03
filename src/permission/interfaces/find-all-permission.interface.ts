import { FindAll } from '../../shared/interfaces/find-all.interface';

export interface FindAllPermission extends FindAll {
  actionId?: string;
  moduleId?: string;
}
