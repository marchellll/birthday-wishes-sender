import { Injectable, Logger } from '@nestjs/common';
import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { InjectConnection, InjectModel } from '@nestjs/sequelize';
import { Sequelize, Transaction } from 'sequelize';
import { HttpService } from '@nestjs/axios';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';
import { DateTime } from 'luxon';

import { User } from './entities/user.entity';
import { ScheduledMessages } from './entities/scheduled-message.entity';

@Injectable() @Processor('scheduled-messages')
export class ScheduledMessagesProcessor {
  private readonly logger = new Logger(ScheduledMessagesProcessor.name);

  constructor(
    @InjectModel(User)
    private user_model: typeof User,

    @InjectModel(ScheduledMessages)
    private scheduled_message_model: typeof ScheduledMessages,

    @InjectConnection()
    private sequelize: Sequelize,

    private readonly http_service: HttpService,
  ) {}

  @Process()
  async process(job: Job<any>) {
    this.logger.debug('Start processing job', JSON.stringify(job.data));

    const {
      scheduled_message_id,
      user_id,
    } = job.data;

    await this.sequelize.transaction(async (transaction) => {
      const [message, user] = await Promise.all([
        this.scheduled_message_model.findByPk(scheduled_message_id, {
          transaction,
          lock: Transaction.LOCK.UPDATE,
        }),
        this.user_model.findByPk(user_id),
      ]);

      // maybe validate here? if today is still birthday?
      // if not, we can just delete the message

      // this service is suck.
      // It doesnt have any idempotency key,
      // or any way to check if the message is sent.
      // If our request timed out, we will be clueless,
      // we can't know if the message is sent or not
      const { data } = await firstValueFrom(
        this.http_service.post<any>(
            'https://email-service.digitalenvision.com.au/send-email',
            {
              email: message.recipient,
              message: message.body,
            },
          )
          .pipe(
            catchError((error: AxiosError) => {
              this.logger.error(error.response.data);
              // retry, either using queue or naturally when the next cron runs
              throw 'An error happened!';
            }),
          ),
      );

      this.logger.debug('Finished sending email', JSON.stringify({
        data,
        user,
        message,
      }));

      const new_scheduled_at = DateTime.fromJSDate(message.scheduled_at).plus({ year: 1 }).toJSDate();
      await message.update({
        scheduled_at: new_scheduled_at,
      }, {
        transaction,
      });
    });

    return {};
  }

}