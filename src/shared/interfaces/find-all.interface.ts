import { FindOptionsOrderValue } from 'typeorm';

export interface FindAll {
  page?: number;
  limit?: number;
  search?: string;
  orderBy?: string;
  orderDir?: FindOptionsOrderValue;
}
