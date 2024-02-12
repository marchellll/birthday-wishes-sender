import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';

import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';

import { DateTime } from 'luxon';
import * as _ from 'lodash';

import { ScheduledMessages } from './entities/scheduled-message.entity';


@Injectable()
export class ScheduledMesssagesTaskService {
  private readonly logger = new Logger(ScheduledMesssagesTaskService.name);

  constructor(
    @InjectModel(ScheduledMessages)
    private scheduled_message_model: typeof ScheduledMessages,

    @InjectQueue('scheduled-messages')
    private schedule_message_queue: Queue,
  ) {}

  // 10 minutes is the assumed equilibirum
  // it is not too fast so, 2 jobs (hopefully) won't overlap
  // and not too slow, so the message won't be too late
  // @Cron(CronExpression.EVERY_30_SECONDS) // for testing
  @Cron(CronExpression.EVERY_10_MINUTES)
  async handleCron() {
    this.logger.debug('Sending scheduled messages');

    const now = DateTime.now().toJSDate();

    let last_id = 0;
    let messages = [];

    do {
      messages = await this.scheduled_message_model.findAll({
        where: {
          scheduled_at: {
            [Op.lte]: now,
          },
          // start from the last id
          // so no skipped/duplicated message
          id: {
            [Op.gt]: last_id,
          },
        },
        order: [['id', 'ASC']],
        // TODO: make configurable
        // memory is limited, so we need to limit the query
        limit: 100,
      });

      if (_.isEmpty(messages)) {
        this.logger.debug(`Message empty`);
        break;
      }

      const result = await this.schedule_message_queue.addBulk(messages.map((message) => ({
        data: {
          scheduled_message_id: message.id,
          user_id: message.user_id,
        },
      })));

      this.logger.debug(`Processed ${result.length} messages`);
      this.logger.debug(result);

      last_id = _.get(messages, messages.length - 1, { id: 0 }).id;

    } while (messages.length > 0);
  }
}
