import { MailerService } from '@nestjs-modules/mailer';
import { Inject, Injectable } from '@nestjs/common';
import { APP_NAME, BASE_URL } from '../app.config';
import dayjs from 'dayjs';
import { SendForgotPasswordEmail } from './interfaces/send-forgot-password-email.interface';

@Injectable()
export class MailService {
  @Inject(MailerService) private mailerService: MailerService;

  async sendForgotPasswordEmail({ to }: SendForgotPasswordEmail) {
    await this.mailerService.sendMail({
      to,
      from: '"Support Team" <support@example.com>', // override default from
      subject: 'Forgot Password',
      template: './forgot-password',
      context: {
        year: dayjs().year(),
        appName: APP_NAME,
        userName: 'abdul15irsyad',
        link: `${BASE_URL}/auth/reset-password?token=fhawfwjekahrj`,
        linkExpiredAt: dayjs().toString(),
      },
    });
  }
}
