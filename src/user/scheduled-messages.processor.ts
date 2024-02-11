import { Injectable, Logger } from '@nestjs/common';
import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { InjectConnection, InjectModel } from '@nestjs/sequelize';
import { Sequelize, Transaction } from 'sequelize';

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
  ) {}

  @Process()
  async process(job: Job<unknown>) {
    this.logger.debug('Start processing job', JSON.stringify(job.data));

    return {};
  }

}