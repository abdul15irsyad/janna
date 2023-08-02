import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Inject, UseGuards } from '@nestjs/common';
import { User } from '../../user/entities/user.entity';
import { handleError } from '../../shared/utils/error.util';
import { AuthUser } from '../decorators/auth-user.decorator';
import { JwtAuthGuard } from '../guards/auth.guard';
import { UpdateAuthUserDto } from '../dto/update-auth-user.dto';
import { ProfileService } from '../services/profile.service';
import { UpdateAuthUserPasswordDto } from '../dto/update-auth-user-password.dto';

@UseGuards(JwtAuthGuard)
@Resolver()
export class ProfileResolver {
  constructor(@Inject(ProfileService) private profileService: ProfileService) {}

  @Query(() => User)
  async authUser(@AuthUser() authUser: User) {
    try {
      return authUser;
    } catch (error) {
      handleError(error);
    }
  }

  @Mutation(() => User, { name: 'updateAuthUser' })
  async update(
    @AuthUser() authUser: User,
    @Args('updateAuthUserInput', {
      type: () => UpdateAuthUserDto,
      nullable: true,
    })
    updateAuthUserInput?: UpdateAuthUserDto,
  ) {
    try {
      const { name, username, email } = updateAuthUserInput;

      const updatedUser = await this.profileService.update({
        id: authUser.id,
        name,
        username,
        email,
      });

      return updatedUser;
    } catch (error) {
      handleError(error);
    }
  }

  @Mutation(() => Boolean, { name: 'updateAuthUserPassword' })
  async updatePassword(
    @AuthUser() authUser: User,
    @Args('updateAuthUserPasswordInput', {
      type: () => UpdateAuthUserPasswordDto,
    })
    updateAuthUserPasswordInput?: UpdateAuthUserPasswordDto,
  ) {
    try {
      const { oldPassword, newPassword } = updateAuthUserPasswordInput;
      await this.profileService.updatePassword({
        id: authUser.id,
        oldPassword,
        newPassword,
      });
      return true;
    } catch (error) {
      handleError(error);
    }
  }
}
