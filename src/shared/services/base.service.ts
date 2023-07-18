import { Injectable } from '@nestjs/common';
import {
  DeepPartial,
  FindManyOptions,
  FindOptionsRelations,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { BaseEntity } from '../entities/base.entity';

@Injectable()
export class BaseService<T extends BaseEntity> {
  protected repository: Repository<T>;
  protected relations: FindOptionsRelations<T>;

  constructor(repository: Repository<T>) {
    this.repository = repository;
  }

  async create(entity: DeepPartial<T>): Promise<T> {
    const createdEntity = this.repository.create(entity);
    await this.repository.save(createdEntity);
    return this.findOneBy({ id: createdEntity?.id as any });
  }

  async find(options?: FindManyOptions<T>): Promise<T[]> {
    return this.repository.find(options);
  }

  async countBy(
    where: FindOptionsWhere<T> | FindOptionsWhere<T>[],
  ): Promise<number> {
    return this.repository.countBy(where);
  }

  async findOneBy(
    where: FindOptionsWhere<T> | FindOptionsWhere<T>[],
  ): Promise<T> {
    return this.repository.findOne({ where, relations: this.relations });
  }

  async update(id: any, entity: DeepPartial<T>): Promise<T> {
    await this.repository.save({ id, ...entity });
    return this.repository.findOneBy({ id });
  }

  async delete(id: any): Promise<void> {
    await this.repository.delete(id);
  }

  async softDelete(id: any): Promise<void> {
    await this.repository.softDelete(id);
  }
}