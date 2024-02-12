
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken, getConnectionToken } from '@nestjs/sequelize';
import {
  getQueueToken,
} from '@nestjs/bull';
import { Queue } from 'bull';

import { HttpModule, HttpService } from '@nestjs/axios';


import { User } from './entities/user.entity';
import { ScheduledMessages } from './entities/scheduled-message.entity';

import { UserService } from './user.service';
import { ScheduledMesssagesTaskService } from './scheduled-messsages-task.service';
import { ScheduledMessagesProcessor } from './scheduled-messages.processor';
import { UserController } from './user.controller';

export interface Module {
  transaction: any;
  user_model: typeof User;
  scheduled_messages_model: typeof ScheduledMessages;
  user_service: UserService;
  http_service: HttpService;
  scheduled_messages_task_service: ScheduledMesssagesTaskService;
  scheduled_messages_processor: ScheduledMessagesProcessor;
  scheduled_message_queue: Queue,
  user_controller: UserController;
}

export const setupModule = async (): Promise<Module> => {
  const mockUserModel = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByPk: jest.fn(),
  };
  const mockScheduledMessagesModel = {
    findOne: jest.fn(),
    upsert: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
  };
  const transaction = { LOCK: { UPDATE: 'update' } };
  const mockSequelize = {
    transaction: jest.fn().mockImplementation(async (fn) => {
      return await fn(transaction);
    }),
  };
  const mockQueue = {
    addBulk: jest.fn(),
  };

  const module: TestingModule = await Test.createTestingModule({
    imports: [
      HttpModule,
    ],
    controllers: [UserController],
    providers: [
      {
        provide: getModelToken(User),
        useValue: mockUserModel,
      },
      {
        provide: getModelToken(ScheduledMessages),
        useValue: mockScheduledMessagesModel,
      },
      {
        provide: getConnectionToken({}),
        useValue: mockSequelize
      },
      {
        provide: getQueueToken('scheduled-messages'),
        useValue: mockQueue,
      },
      UserService,
      ScheduledMesssagesTaskService,
      ScheduledMessagesProcessor,
    ],
  }).compile();

  const user_model = module.get<typeof User>(getModelToken(User));
  const scheduled_messages_model = module.get<typeof ScheduledMessages>(getModelToken(ScheduledMessages));
  const user_service = module.get<UserService>(UserService);
  const scheduled_messages_task_service = module.get<ScheduledMesssagesTaskService>(ScheduledMesssagesTaskService);
  const scheduled_messages_processor = module.get<ScheduledMessagesProcessor>(ScheduledMessagesProcessor);
  const scheduled_message_queue = module.get<Queue>(getQueueToken('scheduled-messages'));
  const http_service = module.get<HttpService>(HttpService);
  const user_controller = module.get<UserController>(UserController);

  return {
    transaction,
    user_model,
    scheduled_messages_model,

    scheduled_message_queue,

    user_service,
    http_service,

    scheduled_messages_task_service,
    scheduled_messages_processor,

    user_controller,
  }
};


it('should be defined', async () => {
  expect((await setupModule()).user_service).toBeDefined();
});