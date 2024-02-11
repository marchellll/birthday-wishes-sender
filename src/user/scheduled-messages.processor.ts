import { Injectable, Logger } from '@nestjs/common';

import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';


@Processor('scheduled-messages')
export class ScheduledMessagesProcessor {
  private readonly logger = new Logger(ScheduledMessagesProcessor.name);

  @Process()
  async process(job: Job<unknown>) {
    this.logger.debug('Start processing job', JSON.stringify(job.data));

    return {};
  }

}