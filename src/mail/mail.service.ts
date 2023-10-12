import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import dayjs from 'dayjs';
import { SendForgotPasswordEmail } from './interfaces/send-forgot-password-email.interface';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  constructor(
    private mailerService: MailerService,
    private configService: ConfigService,
  ) {}

  async sendForgotPasswordEmail({ to }: SendForgotPasswordEmail) {
    await this.mailerService.sendMail({
      to,
      from: '"Support Team" <support@example.com>', // override default from
      subject: 'Forgot Password',
      template: './forgot-password',
      context: {
        year: dayjs().year(),
        appName: this.configService.get<string>('app.APP_NAME'),
        userName: 'abdul15irsyad',
        link: `${this.configService.get<string>(
          'app.BASE_URL',
        )}/auth/reset-password?token=fhawfwjekahrj`,
        linkExpiredAt: dayjs().toString(),
      },
    });
  }
}
