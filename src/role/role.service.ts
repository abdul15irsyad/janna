import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
import { CreateRoleDto } from './dto/create-role.dto';
import { v4 as uuidv4 } from 'uuid';
import slugify from 'slugify';
import { RedisService } from '../redis/redis.service';
import { FindAllRoleDto } from './dto/find-all-role.dto';
import { useCache } from '../shared/utils/cache.util';
import { cleanNull } from '../shared/utils/object.util';
import { isEmpty } from 'class-validator';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { I18nTranslations } from '../i18n/i18n.generated';
import { FindAllUserDto } from '../user/dto/find-all-user.dto';
import { UserService } from '../user/user.service';
import { UpdateRoleDto } from './dto/update-role.dto';
import { SUPER_ADMINISTRATOR } from './role.config';
import { User } from '../user/entities/user.entity';

@Injectable()
export class RoleService {
  protected relations: FindOptionsRelations<Role> = {};

  constructor(
    @InjectRepository(Role) private roleRepo: Repository<Role>,
    @InjectRepository(User) private userRepo: Repository<User>,
    private redisService: RedisService,
    private i18n: I18nService<I18nTranslations>,
    private userService: UserService,
  ) {}

  async create(createRoleDto: CreateRoleDto) {
    const newRole = this.roleRepo.create({
      ...createRoleDto,
      id: uuidv4(),
      slug: slugify(createRoleDto.name, { lower: true, strict: true }),
    });
    await this.roleRepo.save(newRole);
    // delete cache
    const cacheKeys = await this.redisService.keys(`roles:*`);
    await this.redisService.del(cacheKeys);
    return this.roleRepo.findOne({
      where: { id: newRole.id },
      relations: this.relations,
    });
  }

  async findAll(findAllRoleDto?: FindAllRoleDto) {
    const findAll = await useCache(
      `roles:${JSON.stringify(cleanNull(findAllRoleDto))}`,
      () => this.findWithPagination(findAllRoleDto),
    );
    return findAll;
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

  async findOne(id: string) {
    const role = await useCache(`role:${id}`, () =>
      this.roleRepo.findOne({ where: { id }, relations: this.relations }),
    );
    if (isEmpty(role))
      throw new NotFoundException(
        this.i18n.t('error.NOT_FOUND', {
          args: { property: 'ROLE' },
          lang: I18nContext.current().lang,
        }),
      );
    return role;
  }

  async findRoleUsers(id: string, findAllUserDto: FindAllUserDto) {
    const role = await this.findOne(id);
    const findRoleUsers = await this.userService.findWithPagination({
      ...findAllUserDto,
      roleId: role.id,
    });
    return findRoleUsers;
  }

  async update(id: string, { name }: UpdateRoleDto) {
    const role = await this.findOne(id);
    if (role.slug === SUPER_ADMINISTRATOR)
      throw new BadRequestException(
        this.i18n.t('error.CANNOT_UPDATE_ROLE_SUPER_ADMINISTRATOR', {
          args: {},
          lang: I18nContext.current().lang,
        }),
      );
    await this.roleRepo.update(id, {
      name,
      slug: slugify(name, { lower: true, strict: true }),
    });
    // delete cache
    const cacheKeys = await this.redisService.keys(`roles:*`);
    await this.redisService.del([...cacheKeys, `role:${id}`]);

    return await this.findOne(id);
  }

  async remove(id: string) {
    const role = await this.findOne(id);
    if (role.slug === SUPER_ADMINISTRATOR)
      throw new BadRequestException(
        this.i18n.t('error.CANNOT_DELETE_ROLE_SUPER_ADMINISTRATOR', {
          args: {},
          lang: I18nContext.current().lang,
        }),
      );
    const usersCount = await this.userRepo.countBy({ roleId: id });
    if (usersCount > 0)
      throw new BadRequestException(
        this.i18n.t('error.CANNOT_DELETE_HAVE_CHILDREN', {
          args: { property: 'ROLE', children: 'USER' },
          lang: I18nContext.current().lang,
        }),
      );
    await this.roleRepo.softDelete(id);
    // delete cache
    const cacheKeys = await this.redisService.keys(`roles:*`);
    await this.redisService.del([...cacheKeys, `role:${id}`]);

    return true;
  }
}
