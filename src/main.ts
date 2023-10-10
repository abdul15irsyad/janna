import { Logger, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NODE_ENV, ORIGINS, PORT } from './app.config';
import { AppModule } from './app.module';
import { I18nValidationPipe } from 'nestjs-i18n';
import datasource from './database/database.datasource';
import { I18nValidationExceptionFilter } from './shared/filters/i18n-validation-exception.filter';
import { graphqlUploadExpress } from 'graphql-upload-ts';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Main');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });
  app.enableCors({ origin: ORIGINS, methods: '*' });
  app.useGlobalFilters(new I18nValidationExceptionFilter());
  app.useGlobalPipes(
    new I18nValidationPipe({
      whitelist: true,
      transform: true,
      stopAtFirstError: true,
    }),
  );
  app.use(
    graphqlUploadExpress({
      maxFileSize: 50_000,
      maxFiles: 10,
    }),
  );
  await datasource.initialize();
  await app.listen(PORT, () =>
    logger.log(`Application running on port ${PORT}, environment ${NODE_ENV}`),
  );
}
bootstrap();
