import { Injectable } from '@nestjs/common';
import { User } from './entities/user.entity';
import {
  FindOptionsRelations,
  FindOptionsWhere,
  ILike,
  Repository,
} from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { parseOrderBy } from '../shared/utils/string.util';
import { FindAllUser } from './interfaces/find-all-user.interface';
import { BaseService } from '../shared/services/base.service';

@Injectable()
export class UserService extends BaseService<User> {
  protected relations: FindOptionsRelations<User> = {
    role: true,
  };

  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {
    super(userRepo);
  }

  async findWithPagination({
    page,
    limit,
    search,
    orderBy,
    orderDir,
    roleId,
  }: FindAllUser = {}) {
    page = page ?? 1;
    orderBy = orderBy ?? 'createdAt';
    orderDir = orderDir ?? 'desc';
    const filter: FindOptionsWhere<User> = {
      roleId: roleId ?? undefined,
    };
    const findOptionsWhere: FindOptionsWhere<User> | FindOptionsWhere<User>[] =
      search
        ? [
            { name: ILike(`%${search}%`), ...filter },
            { username: ILike(`%${search}%`), ...filter },
            { email: ILike(`%${search}%`), ...filter },
          ]
        : filter;
    const totalAllData = await this.userRepo.countBy(findOptionsWhere);
    const data = await this.userRepo.find({
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
