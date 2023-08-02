import {
  Body,
  Controller,
  Get,
  Inject,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { ProfileService } from '../services/profile.service';
import { AuthUser } from '../decorators/auth-user.decorator';
import { User } from '../../user/entities/user.entity';
import { handleError } from '../../shared/utils/error.util';
import { JwtAuthGuard } from '../guards/auth.guard';
import { UpdateAuthUserDto } from '../dto/update-auth-user.dto';
import { UpdateAuthUserPasswordDto } from '../dto/update-auth-user-password.dto';
import { I18n, I18nContext } from 'nestjs-i18n';
import { I18nTranslations } from '../../i18n/i18n.generated';

@UseGuards(JwtAuthGuard)
@Controller('auth/user')
export class ProfileController {
  constructor(@Inject(ProfileService) private profileService: ProfileService) {}

  @Get()
  async authUser(
    @AuthUser() authUser: User,
    @I18n() i18n: I18nContext<I18nTranslations>,
  ) {
    try {
      return {
        message: i18n.t('common.GET_AUTH_USER', { args: {} }),
        data: authUser,
      };
    } catch (error) {
      handleError(error);
    }
  }

  @Patch()
  async update(
    @AuthUser() authUser: User,
    @I18n() i18n: I18nContext<I18nTranslations>,
    @Body() updateAuthUserDto?: UpdateAuthUserDto,
  ) {
    try {
      const { name, username, email } = updateAuthUserDto;

      const updatedUser = await this.profileService.update({
        id: authUser.id,
        name,
        username,
        email,
      });

      return {
        message: i18n.t('common.UPDATE_AUTH_USER_SUCCESSFULL', { args: {} }),
        data: updatedUser,
      };
    } catch (error) {
      handleError(error);
    }
  }

  @Patch('password')
  async updatePassword(
    @AuthUser() authUser: User,
    @I18n() i18n: I18nContext<I18nTranslations>,
    @Body() updateAuthUserPasswordInput?: UpdateAuthUserPasswordDto,
  ) {
    try {
      const { oldPassword, newPassword } = updateAuthUserPasswordInput;
      await this.profileService.updatePassword({
        id: authUser.id,
        oldPassword,
        newPassword,
      });
      return {
        message: i18n.t('common.UPDATE_AUTH_USER_PASSWORD_SUCCESSFULL', {
          args: {},
        }),
      };
    } catch (error) {
      handleError(error);
    }
  }
}
