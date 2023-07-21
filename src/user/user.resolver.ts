import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { User } from './entities/user.entity';
import { Inject, NotFoundException, ParseUUIDPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { FindAllUserDto } from './dto/find-all-user.dto';
import { handleError } from '../shared/utils/error.util';
import { PaginatedUser } from './object-types/paginated-user.object-type';
import { I18n, I18nContext } from 'nestjs-i18n';
import { I18nTranslations } from '../i18n/i18n.generated';
import { isEmpty } from 'class-validator';
import { CreateUserDto } from './dto/create-user.dto';
import { hashPassword } from '../shared/utils/password.util';

@Resolver(() => User)
export class UserResolver {
  constructor(@Inject(UserService) private userService: UserService) {}

  @Mutation(() => User, { name: 'createUser' })
  async create(
    @Args('createUserInput', { type: () => CreateUserDto })
    createUserDto: CreateUserDto,
  ) {
    try {
      console.log('resolver');
      const newUser = await this.userService.create({
        ...createUserDto,
        password: hashPassword(createUserDto.password),
      });
      return newUser;
    } catch (error) {
      console.error(error);
      handleError(error);
    }
  }

  @Query(() => PaginatedUser, { name: 'users' })
  async findAll(
    @Args('findAllUserInput', { type: () => FindAllUserDto, nullable: true })
    findAllUserDto?: FindAllUserDto,
  ) {
    try {
      const { data, totalAllData, totalPage } =
        await this.userService.findWithPagination(findAllUserDto);
      return {
        meta: {
          currentPage: data.length > 0 ? findAllUserDto?.page ?? 1 : null,
          totalPage,
          totalData: data.length,
          totalAllData,
        },
        data,
      };
    } catch (error) {
      handleError(error);
    }
  }

  @Query(() => User, { name: 'user' })
  async findOne(
    @Args('id', { type: () => String }, ParseUUIDPipe) id: string,
    @I18n() i18n: I18nContext<I18nTranslations>,
  ) {
    try {
      const user = await this.userService.findOneBy({ id });
      if (isEmpty(user))
        throw new NotFoundException(
          i18n.t('error.NOT_FOUND', {
            args: { property: 'USER' },
          }),
        );
      return user;
    } catch (error) {
      handleError(error);
    }
  }
}
