import { Injectable } from '@nestjs/common';
import { Role } from './entities/role.entity';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FindOptionsRelations,
  FindOptionsWhere,
  ILike,
  Repository,
} from 'typeorm';
import { parseOrderBy } from '../shared/utils/string.util';
import { FindAllRole } from './interfaces/find-all-role.interface';
import { BaseService } from '../shared/services/base.service';

@Injectable()
export class RoleService extends BaseService<Role> {
  protected relations: FindOptionsRelations<Role> = {};

  constructor(@InjectRepository(Role) private roleRepo: Repository<Role>) {
    super(roleRepo);
  }

  async findWithPagination({
    page,
    limit,
    search,
    orderBy,
    orderDir,
  }: FindAllRole = {}) {
    page = page ?? 1;
    orderBy = orderBy ?? 'createdAt';
    orderDir = orderDir ?? 'asc';
    const filter: FindOptionsWhere<Role> = {};
    const findOptionsWhere: FindOptionsWhere<Role> | FindOptionsWhere<Role>[] =
      search ? [{ name: ILike(`%${search}%`), ...filter }] : filter;
    const totalAllData = await this.roleRepo.countBy(findOptionsWhere);
    const data = await this.roleRepo.find({
      where: findOptionsWhere,
      take: limit,
      skip: limit ? (page - 1) * limit : undefined,
      order: parseOrderBy(orderBy, orderDir),
      relations: this.relations,
    });
    const totalPage = limit
      ? Math.ceil(totalAllData / limit)
      : data.length > 0
      ? 1
      : null;
    return {
      totalPage,
      totalAllData,
      data,
    };
  }
}
