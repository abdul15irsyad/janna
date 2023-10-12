import { AppController } from './app.controller';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from './app.module';
import { INestApplication } from '@nestjs/common';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { I18nTranslations } from './i18n/i18n.generated';

describe('AppController', () => {
  let app: INestApplication;
  let appController: AppController;
  let i18n: I18nService<I18nTranslations>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();

    i18n = app.get<I18nService<I18nTranslations>>(
      I18nService<I18nTranslations>,
    );
    appController = app.get<AppController>(AppController);
    jest
      .spyOn(I18nContext, 'current')
      .mockImplementation(
        () => new I18nContext<I18nTranslations | any>('en', i18n),
      );
  });

  describe('root', () => {
    it('should return root message', async () => {
      expect(await appController.root()).toStrictEqual({
        message: 'Janna - NestJS Boilerplate',
      });
    });
  });

  describe('hello world', () => {
    it('should return hello world message', async () => {
      expect(await appController.hello()).toStrictEqual({
        message: 'Hello World',
      });
    });
  });
});
