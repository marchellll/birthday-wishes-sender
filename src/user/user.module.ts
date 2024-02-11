import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from './entities/user.entity';
import { ScheduledMessages } from './entities/scheduled-message.entity';

@Module({
  // 👇🏼 import User model, allow this module to use the entity
  imports: [SequelizeModule.forFeature([User, ScheduledMessages])],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
