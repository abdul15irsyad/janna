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
  UseGuards,
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
import { JwtAuthGuard } from '../auth/guards/auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UserController {
  constructor(@Inject(UserService) private userService: UserService) {}

  @Post()
  async create(
    @Body() createUserDto: CreateUserDto,
    @I18n() i18n: I18nContext<I18nTranslations>,
  ) {
    try {
      const newUser = await this.userService.create({
        ...createUserDto,
        password: hashPassword(createUserDto.password),
      });
      return {
        message: i18n.t('common.CREATE_SUCCESSFULL', {
          args: { property: 'USER' },
        }),
        data: newUser,
      };
    } catch (error) {
      handleError(error);
    }
  }

  @Get()
  async findAll(
    @I18n() i18n: I18nContext<I18nTranslations>,
    @Query() findAllUserDto?: FindAllUserDto,
  ) {
    try {
      const { data, totalAllData, totalPage } =
        await this.userService.findWithPagination(findAllUserDto);
      return {
        message: i18n.t('common.READ_ALL', {
          args: { property: 'USER' },
        }),
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
        message: i18n.t('common.READ', {
          args: { property: 'USER' },
        }),
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
        message: i18n.t('common.UPDATE_SUCCESSFULL', {
          args: { property: 'USER' },
        }),
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
        message: i18n.t('common.DELETE_SUCCESSFULL', {
          args: { property: 'USER' },
        }),
      };
    } catch (error) {
      handleError(error);
    }
  }
}
