import { CACHE_MANAGER, Controller, Get, Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { AppService } from './app.service';

@Controller()
export class AppController {
    @Inject() private appService: AppService;
    @Inject(CACHE_MANAGER) private cacheManager: Cache;

    @Get()
    async root() {
        let rootMessage = await this.cacheManager.get('rootMessage');
        if (!rootMessage) {
            rootMessage = this.appService.rootMessage();
            await this.cacheManager.set('rootMessage', rootMessage, 15 * 1000);
        };

        return {
            message: rootMessage,
        };
    }
}
