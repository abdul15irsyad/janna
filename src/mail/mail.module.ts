import { MailerModule } from '@nestjs-modules/mailer';
import { Module, forwardRef } from '@nestjs/common';
// import { join } from 'path';
import { MailService } from './mail.service';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { SMTP_HOST, SMTP_PASS, SMTP_PORT, SMTP_USER } from './mail.config';
import { UserModule } from '../user/user.module';
import { MailConsumer } from './mail.consumer';

@Module({
  imports: [
    MailerModule.forRoot({
      // transport: 'smtps://user@example.com:topsecret@smtp.example.com',
      // or
      transport: {
        host: SMTP_HOST,
        port: SMTP_PORT,
        // secure: false,
        auth: {
          user: SMTP_USER,
          pass: SMTP_PASS,
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
    forwardRef(() => UserModule),
  ],
  providers: [MailService, MailConsumer],
  exports: [MailService],
})
export class MailModule {}
