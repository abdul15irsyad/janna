import { PaginatedResponse } from '../../shared/object-types/paginated-response.object-type';
import { Role } from '../entities/role.entity';

export const PaginatedRole = PaginatedResponse(Role);
export type PaginatedRole = InstanceType<typeof PaginatedRole>;
