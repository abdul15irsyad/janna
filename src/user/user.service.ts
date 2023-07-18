import { Injectable } from '@nestjs/common';
import { BaseService } from '../shared/services/base.service';
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

@Injectable()
export class UserService extends BaseService<User> {
  protected relations: FindOptionsRelations<User> = {};

  constructor(
    @InjectRepository(User)
    private UserRepo: Repository<User>,
  ) {
    super(UserRepo);
  }

  async findWithPagination({
    page,
    limit,
    search,
    orderBy,
    orderDir,
  }: FindAllUser = {}) {
    page = page ?? 1;
    orderBy = orderBy ?? 'createdAt';
    orderDir = orderDir ?? 'asc';
    const filter: FindOptionsWhere<User> = {};
    const findOptionsWhere: FindOptionsWhere<User> | FindOptionsWhere<User>[] =
      search ? [{ name: ILike(`%${search}%`), ...filter }] : filter;
    const totalAllData = await this.UserRepo.countBy(findOptionsWhere);
    const data = await this.UserRepo.find({
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
