import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Inject,
  Query,
  NotFoundException,
  ParseUUIDPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { handleError } from '../shared/utils/error.util';
import { I18n, I18nContext } from 'nestjs-i18n';
import { I18nTranslations } from '../i18n/i18n.generated';
import { FindAllUserDto } from './dto/find-all-user.dto';
import { isEmpty } from 'class-validator';
import { hashPassword } from '../shared/utils/password.util';

@Controller('users')
export class UserController {
  constructor(@Inject(UserService) private userService: UserService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    try {
      const newUser = await this.userService.create({
        ...createUserDto,
        password: hashPassword(createUserDto.password),
      });
      return {
        message: 'create user successfull',
        data: newUser,
      };
    } catch (error) {
      handleError(error);
    }
  }

  @Get()
  async findAll(@Query() findAllUserDto?: FindAllUserDto) {
    try {
      const { data, totalAllData, totalPage } =
        await this.userService.findWithPagination(findAllUserDto);
      return {
        message: 'read all users',
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

  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
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
      return {
        message: 'read user',
        data: user,
      };
    } catch (error) {
      handleError(error);
    }
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
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
      const updatedUser = await this.userService.update(id, {
        ...updateUserDto,
        password: updateUserDto.password
          ? hashPassword(updateUserDto.password)
          : undefined,
      });
      return {
        message: 'update user successfull',
        data: updatedUser,
      };
    } catch (error) {
      handleError(error);
    }
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
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
      await this.userService.softDelete(id);
      return {
        message: 'delete user successfull',
      };
    } catch (error) {
      handleError(error);
    }
  }
}
