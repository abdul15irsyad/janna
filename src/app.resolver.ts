import { Query, Resolver } from '@nestjs/graphql';
import { Inject, InternalServerErrorException } from '@nestjs/common';
import { AppService } from './app.service';
import { handleError } from './shared/utils/error.util';

@Resolver()
export class AppResolver {
  constructor(@Inject(AppService) private appService: AppService) {}

  @Query(() => String)
  root() {
    return this.appService.rootMessage();
  }

  @Query(() => String)
  error() {
    try {
      throw new InternalServerErrorException('test error');
    } catch (error) {
      handleError(error);
    }
  }
}
