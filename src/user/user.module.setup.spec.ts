
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken, getConnectionToken } from '@nestjs/sequelize';

import { User } from './entities/user.entity';
import { ScheduledMessages } from './entities/scheduled-message.entity';

import { UserService } from './user.service';

export interface Module {
  transaction: any,
  user_model: typeof User,
  scheduled_messages_model: typeof ScheduledMessages,
  user_service: UserService,
}

export const setupModule = async (): Promise<Module> => {
  const mockUserModel = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
  };
  const mockScheduledMessagesModel = {
    findOne: jest.fn(),
    upsert: jest.fn(),
  };
  const transaction = { LOCK: { UPDATE: 'update' } };
  const mockSequelize = {
    transaction: jest.fn().mockImplementation(async (fn) => {
      return await fn(transaction);
    }),
  };

  const module: TestingModule = await Test.createTestingModule({
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
      UserService
    ],
  }).compile();

  const user_model = module.get<typeof User>(getModelToken(User));
  const scheduled_messages_model = module.get<typeof ScheduledMessages>(getModelToken(ScheduledMessages));
  const user_service = module.get<UserService>(UserService);

  return {
    transaction,
    user_model,
    scheduled_messages_model,
    user_service,
  }
};
