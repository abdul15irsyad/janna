import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { User } from './entities/user.entity';
import { Inject, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { FindAllUserDto } from './dto/find-all-user.dto';
import { handleError } from '../shared/utils/error.util';
import { PaginatedUser } from './object-types/paginated-user.object-type';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { PermissionGuard } from '../permission/guards/permission.guard';

@UseGuards(JwtAuthGuard)
@Resolver(() => User)
export class UserResolver {
  constructor(@Inject(UserService) private userService: UserService) {}

  @UseGuards(new PermissionGuard({ actionSlug: 'create', moduleSlug: 'user' }))
  @Mutation(() => User, { name: 'createUser' })
  async create(
    @Args('createUserInput', { type: () => CreateUserDto })
    createUserDto: CreateUserDto,
  ) {
    try {
      const newUser = await this.userService.create(createUserDto);
      return newUser;
    } catch (error) {
      handleError(error);
    }
  }

  @UseGuards(new PermissionGuard({ actionSlug: 'read', moduleSlug: 'user' }))
  @Query(() => PaginatedUser, { name: 'users' })
  async findAll(
    @Args('findAllUserInput', { type: () => FindAllUserDto, nullable: true })
    findAllUserDto?: FindAllUserDto,
  ) {
    try {
      const { data, totalAllData, totalPage } = await this.userService.findAll(
        findAllUserDto,
      );
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

  @UseGuards(new PermissionGuard({ actionSlug: 'read', moduleSlug: 'user' }))
  @Query(() => User, { name: 'user' })
  async findOne(@Args('id', { type: () => String }, ParseUUIDPipe) id: string) {
    try {
      const user = await this.userService.findOneById(id);
      return user;
    } catch (error) {
      handleError(error);
    }
  }

  @UseGuards(new PermissionGuard({ actionSlug: 'update', moduleSlug: 'user' }))
  @Mutation(() => User, { name: 'updateUser' })
  async update(@Args('updateUserInput') updateUserInput: UpdateUserDto) {
    try {
      const updatedUser = await this.userService.update(
        updateUserInput.id,
        updateUserInput,
      );
      return updatedUser;
    } catch (error) {
      handleError(error);
    }
  }

  @UseGuards(new PermissionGuard({ actionSlug: 'delete', moduleSlug: 'user' }))
  @Mutation(() => Boolean, { name: 'deleteUser' })
  async remove(@Args('id', { type: () => String }, ParseUUIDPipe) id: string) {
    try {
      return await this.userService.remove(id);
    } catch (error) {
      handleError(error);
    }
  }
}
