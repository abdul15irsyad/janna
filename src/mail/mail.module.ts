import { MailerModule } from '@nestjs-modules/mailer';
import { Module, forwardRef } from '@nestjs/common';
// import { join } from 'path';
import { MailService } from './mail.service';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { UserModule } from '../user/user.module';
import { MailConsumer } from './mail.consumer';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        // transport: 'smtps://user@example.com:topsecret@smtp.example.com',
        // or
        transport: {
          host: configService.get<string>('mail.SMTP_HOST'),
          port: configService.get<number>('mail.SMTP_PORT'),
          // secure: false,
          auth: {
            user: configService.get<string>('mail.SMTP_USER'),
            pass: configService.get<string>('mail.SMTP_PASS'),
          },
        },
        defaults: {
          from: '"No Reply" <noreply@example.com>',
        },
        template: {
          dir: __dirname + '/templates',
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
        options: {
          partials: {
            dir: __dirname + '/templates/partials',
            options: {
              strict: true,
            },
          },
          layouts: {
            dir: __dirname + '/templates/layouts',
            options: {
              strict: true,
            },
          },
        },
      }),
    }),
    forwardRef(() => UserModule),
  ],
  providers: [MailService, MailConsumer],
  exports: [MailService],
})
export class MailModule {}
