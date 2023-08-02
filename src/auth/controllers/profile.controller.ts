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

@UseGuards(JwtAuthGuard)
@Controller('auth/user')
export class ProfileController {
  constructor(@Inject(ProfileService) private profileService: ProfileService) {}

  @Get()
  async authUser(@AuthUser() authUser: User) {
    try {
      return {
        message: 'get auth user',
        data: authUser,
      };
    } catch (error) {
      handleError(error);
    }
  }

  @Patch()
  async update(
    @AuthUser() authUser: User,
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
        message: 'update auth user successfull',
        data: updatedUser,
      };
    } catch (error) {
      handleError(error);
    }
  }

  @Patch('password')
  async updatePassword(
    @AuthUser() authUser: User,
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
        message: 'update auth user password successfull',
      };
    } catch (error) {
      handleError(error);
    }
  }
}
