import { Controller, Get, Inject } from '@nestjs/common';
import { AppService } from './app.service';
import { handleError } from './shared/utils/error.util';

@Controller()
export class AppController {
  @Inject(AppService) private appService: AppService;

  @Get()
  async root() {
    try {
      const rootMessage = this.appService.rootMessage();
      return {
        message: rootMessage,
      };
    } catch (error) {
      handleError({ error });
    }
  }
}
