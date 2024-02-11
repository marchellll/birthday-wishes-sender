import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { BullModule } from '@nestjs/bull';

import { UserService } from './user.service';
import { UserController } from './user.controller';
import { ScheduledMesssagesTaskService } from './scheduled-messsages-task.service';
import { ScheduledMessagesProcessor} from './scheduled-messages.processor';

import { User } from './entities/user.entity';
import { ScheduledMessages } from './entities/scheduled-message.entity';


@Module({
  imports: [
  // 👇🏼 import User model, allow this module to use the entity
    SequelizeModule.forFeature([
      User,
      ScheduledMessages,
    ]),
    BullModule.registerQueue({
      name: 'scheduled-messages',
    }),
  ],
  controllers: [UserController],
  providers: [UserService, ScheduledMesssagesTaskService, ScheduledMessagesProcessor],
})
export class UserModule {}
