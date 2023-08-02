import { Injectable } from '@nestjs/common';
import {
  DeepPartial,
  FindManyOptions,
  FindOneOptions,
  FindOptionsRelations,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { BaseEntity } from '../entities/base.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export abstract class BaseService<T extends BaseEntity> {
  protected repository: Repository<T>;
  protected relations: FindOptionsRelations<T>;

  constructor(repository: Repository<T>) {
    this.repository = repository;
  }

  async create(entity: DeepPartial<T>): Promise<T> {
    const createdEntity = this.repository.create({ id: uuidv4(), ...entity });
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

  async findOne(options: FindOneOptions<T>) {
    return this.repository.findOne(options);
  }

  async findOneBy(
    where: FindOptionsWhere<T> | FindOptionsWhere<T>[],
  ): Promise<T> {
    return this.findOne({ where, relations: this.relations });
  }

  async update(id: any, entity: DeepPartial<T>): Promise<T> {
    await this.repository.save({ id, ...entity });
    return this.findOneBy({ id });
  }

  async delete(id: any): Promise<void> {
    await this.repository.delete(id);
  }

  async softDelete(id: string | FindOptionsWhere<T>): Promise<void> {
    await this.repository.softDelete(id);
  }
}
