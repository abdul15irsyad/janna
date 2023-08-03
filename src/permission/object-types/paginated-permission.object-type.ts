import { PaginatedResponse } from '../../shared/object-types/paginated-response.object-type';
import { Permission } from '../entities/permission.entity';

export const PaginatedPermission = PaginatedResponse(Permission);
export type PaginatedPermission = InstanceType<typeof PaginatedPermission>;
