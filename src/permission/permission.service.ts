import { Injectable } from '@nestjs/common';
import { Permission } from './entities/permission.entity';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FindOptionsRelations,
  FindOptionsWhere,
  ILike,
  Repository,
} from 'typeorm';
import { parseOrderBy } from '../shared/utils/string.util';
import { FindAllPermission } from './interfaces/find-all-permission.interface';
import { BaseService } from '../shared/services/base.service';

@Injectable()
export class PermissionService extends BaseService<Permission> {
  protected relations: FindOptionsRelations<Permission> = {
    action: true,
    module: true,
  };

  constructor(
    @InjectRepository(Permission)
    private permissionRepo: Repository<Permission>,
  ) {
    super(permissionRepo);
  }

  async findWithPagination({
    page,
    limit,
    search,
    orderBy,
    orderDir,
    moduleId,
    actionId,
  }: FindAllPermission = {}) {
    page = page ?? 1;
    orderBy =
      orderBy === 'actionName'
        ? 'action.name'
        : orderBy === 'moduleName'
        ? 'module.name'
        : undefined;
    orderDir = orderDir ?? 'asc';
    const filter: FindOptionsWhere<Permission> = {
      moduleId: moduleId ?? undefined,
      actionId: actionId ?? undefined,
    };
    const findOptionsWhere:
      | FindOptionsWhere<Permission>
      | FindOptionsWhere<Permission>[] = search
      ? [
          {
            action: {
              name: ILike(`%${search}%`),
            },
            ...filter,
          },
          {
            module: {
              name: ILike(`%${search}%`),
            },
            ...filter,
          },
        ]
      : filter;
    const totalAllData = await this.permissionRepo.countBy(findOptionsWhere);
    const data = await this.permissionRepo.find({
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
