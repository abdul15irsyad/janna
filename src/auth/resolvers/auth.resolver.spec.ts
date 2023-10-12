import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { AuthResolver } from './auth.resolver';
import { I18nTranslations } from '../../i18n/i18n.generated';
import { UserService } from '../../user/user.service';
import { User } from '../../user/entities/user.entity';
import { hashPassword } from '../../shared/utils/password.util';
import { randomUUID } from 'crypto';
import { GrantType } from '../enum/grant-type.enum';
import { AppModule } from '../../app.module';

describe('AuthResolver', () => {
  let app: INestApplication;
  let authResolver: AuthResolver;
  let userService: UserService;
  let i18n: I18nService<I18nTranslations>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();

    i18n = app.get<I18nService<I18nTranslations>>(
      I18nService<I18nTranslations>,
    );
    authResolver = app.get<AuthResolver>(AuthResolver);
    userService = app.get<UserService>(UserService);
    jest
      .spyOn(I18nContext, 'current')
      .mockImplementation(
        () => new I18nContext<I18nTranslations | any>('en', i18n),
      );
  });

  describe('login', () => {
    it('should return login response', async () => {
      const email = 'irsyadabdul@email.com';
      const password = 'Qwerty123';
      const existingUser = {
        id: randomUUID(),
        email,
        password: hashPassword(password),
      } as User;
      jest.spyOn(userService, 'findOne').mockResolvedValueOnce(existingUser);
      const res = await authResolver.login({ email, password });
      expect(res).toStrictEqual({
        accessToken: expect.objectContaining({
          token: expect.any(String),
          expiresIn: expect.any(Number),
          grantType: expect.stringMatching(Object.values(GrantType).join('|')),
        }),
        refreshToken: expect.objectContaining({
          token: expect.any(String),
          expiresIn: expect.any(Number),
        }),
      });
    });
  });
});
