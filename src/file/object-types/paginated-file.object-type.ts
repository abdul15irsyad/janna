import { PaginatedResponse } from '../../shared/object-types/paginated-response.object-type';
import { File } from '../entities/file.entity';

export const PaginatedFile = PaginatedResponse(File);
export type PaginatedFile = InstanceType<typeof PaginatedFile>;
