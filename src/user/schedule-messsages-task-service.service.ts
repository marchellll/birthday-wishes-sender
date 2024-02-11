import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectConnection, InjectModel } from '@nestjs/sequelize';
import { Sequelize, Op, Transaction } from 'sequelize';
import { DateTime } from 'luxon';
import * as _ from 'lodash';

import { User } from './entities/user.entity';
import { ScheduledMessages } from './entities/scheduled-message.entity';


@Injectable()
export class ScheduleMesssagesTaskServiceService {
  private readonly logger = new Logger(ScheduleMesssagesTaskServiceService.name);

  constructor(
    @InjectModel(ScheduledMessages)
    private scheduled_message_model: typeof ScheduledMessages,

    @InjectConnection()
    private sequelize: Sequelize,
  ) {}

  @Cron(CronExpression.EVERY_30_SECONDS)
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
          id: {
            [Op.gt]: last_id,
          },
        },
        order: [['id', 'ASC']],
        limit: 50, // TODO: make configurable
      });

      if (messages.length === 0) {
        this.logger.debug(`Message empty`);
        break;
      }

      await Promise.all(messages.map(async (message) => {
        this.logger.debug(`Sending message to ${message.recipient}`);
        // TODO: publish to queue
      }));

      last_id = _.get(messages, messages.length - 1, { id: 0 }).id;

    } while (messages.length > 0);
  }
}
