import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';

@Processor('mail')
export class MailConsumer {
  private readonly logger = new Logger(MailConsumer.name);

  @Process('register')
  async register(job: Job<unknown>) {
    this.logger.debug(`processed a job : ${JSON.stringify(job)}`);
  }
}
