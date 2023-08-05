import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
import { CreateUserDto } from './dto/create-user.dto';
import { v4 as uuidv4 } from 'uuid';
import { hashPassword } from '../shared/utils/password.util';
import { FindAllUserDto } from './dto/find-all-user.dto';
import { isEmpty } from 'class-validator';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { I18nTranslations } from '../i18n/i18n.generated';
import { UpdateUserDto } from './dto/update-user.dto';
import { SUPER_ADMINISTRATOR } from '../role/role.config';

@Injectable()
export class UserService {
  protected relations: FindOptionsRelations<User> = {
    role: true,
  };

  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private i18n: I18nService<I18nTranslations>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const newUser = this.userRepo.create({
      ...createUserDto,
      id: uuidv4(),
      password: hashPassword(createUserDto.password),
    });
    await this.userRepo.save(newUser);
    return this.userRepo.findOne({
      where: { id: newUser.id },
      relations: this.relations,
    });
  }

  async findAll(findAllUserDto?: FindAllUserDto) {
    const findAll = await this.findWithPagination(findAllUserDto);
    return findAll;
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
    orderDir = orderDir ?? 'asc';
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

  async findOne(id: string) {
    const user = await this.userRepo.findOne({
      where: { id },
      relations: this.relations,
    });
    if (isEmpty(user))
      throw new NotFoundException(
        this.i18n.t('error.NOT_FOUND', {
          args: { property: 'USER' },
          lang: I18nContext.current().lang,
        }),
      );
    return user;
  }

  async update(
    id: string,
    { name, email, username, password, roleId }: UpdateUserDto,
  ) {
    const user = await this.findOne(id);
    if (user.role.slug === SUPER_ADMINISTRATOR)
      throw new BadRequestException(
        this.i18n.t('error.CANNOT_UPDATE_SUPER_ADMINISTRATOR_USER', {
          args: {},
          lang: I18nContext.current().lang,
        }),
      );
    await this.userRepo.update(id, {
      name,
      email,
      username,
      roleId,
      password: password ? hashPassword(password) : undefined,
    });
    const updatedUser = await this.userRepo.findOne({
      where: { id },
      relations: this.relations,
    });
    return updatedUser;
  }

  async remove(id: string) {
    const user = await this.findOne(id);
    if (user.role.slug === SUPER_ADMINISTRATOR)
      throw new BadRequestException(
        this.i18n.t('error.CANNOT_DELETE_SUPER_ADMINISTRATOR_USER', {
          args: {},
          lang: I18nContext.current().lang,
        }),
      );
    await this.userRepo.softDelete(id);
    return true;
  }
}
