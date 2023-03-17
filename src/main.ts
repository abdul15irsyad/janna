import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { PORT } from './app.config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Main');
  await app.listen(PORT, () => logger.log(`Nest application running on port ${PORT}`));
}
bootstrap();