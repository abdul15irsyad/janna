import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { handleError } from './shared/utils/error.util';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

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

  @Get('hello')
  async hello() {
    try {
      const helloWorld = this.appService.helloWorld();
      return {
        message: helloWorld,
      };
    } catch (error) {
      handleError({ error });
    }
  }
}
