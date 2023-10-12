import { Logger, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { I18nValidationPipe } from 'nestjs-i18n';
import datasource from './database/database.datasource';
import { I18nValidationExceptionFilter } from './shared/filters/i18n-validation-exception.filter';
import { ConfigService } from '@nestjs/config';
import { NodeEnvironment } from './app.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const logger = new Logger('Main');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });
  app.enableCors({
    origin: configService.get<string[]>('app.ORIGINS'),
    methods: '*',
  });
  app.useGlobalFilters(new I18nValidationExceptionFilter());
  app.useGlobalPipes(
    new I18nValidationPipe({
      whitelist: true,
      transform: true,
      stopAtFirstError: true,
    }),
  );
  const port = configService.get<number>('app.PORT');
  const nodeEnv = configService.get<NodeEnvironment>('app.NODE_ENV');
  await datasource.initialize();
  await app.listen(port, () =>
    logger.log(`Application running on port ${port}, environment ${nodeEnv}`),
  );
}
bootstrap();
