import { PaginatedResponse } from '../../shared/object-types/paginated-response.object-type';
import { User } from '../entities/user.entity';

export const PaginatedUser = PaginatedResponse(User);
export type PaginatedUser = InstanceType<typeof PaginatedUser>;
