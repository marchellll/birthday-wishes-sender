import { faker } from '@faker-js/faker';

import { setupModule, Module } from './user.module.setup.spec';
import { ScheduledMessages } from './entities/scheduled-message.entity';
import { ScheduledMesssagesTaskService } from './scheduled-messsages-task.service';

describe('ScheduledMesssagesTaskService', () => {
  let m: Module; // module
  let service: ScheduledMesssagesTaskService;

  let now: Date;

  beforeEach(async () => {
    // clean module everytime
    m = await setupModule();
    service = m.scheduled_messages_task_service;

    now = new Date();
    jest.useFakeTimers().setSystemTime(now);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('handleCron', () => {
    let find_all_mock: jest.Mock;
    let add_bulk_mock: jest.Mock;
    let messages: ScheduledMessages[];

    const messagesGen = (num: number) => Array.from({ length: num }, (_, i) => ({
      id: i + 1,
      user_id: 1,
      scheduled_at: new Date(now.getTime() - 1000),
    }));

    beforeEach(() => {
      // @ts-ignore
      messages = messagesGen(5);

      find_all_mock = (m.scheduled_messages_model.findAll as jest.Mock);
      add_bulk_mock = (m.scheduled_message_queue.addBulk as jest.Mock).mockImplementation(async (data) => {
        return data;
      });
    });

    describe('when there are no scheduled messages', () => {
      beforeEach(() => {
        find_all_mock.mockResolvedValueOnce([]);
      });

      test('should not do anything', async () => {
        await service.handleCron();

        expect(find_all_mock).toHaveBeenCalledTimes(1);
        expect(add_bulk_mock).not.toHaveBeenCalled();
      });
    });

    describe('when there are scheduled messages', () => {
      beforeEach(() => {
        find_all_mock.mockResolvedValueOnce(messages);
      });

      test('should add bulk to queue', async () => {
        await service.handleCron();

        expect(find_all_mock).toHaveBeenCalledTimes(2);
        expect(add_bulk_mock).toHaveBeenCalledTimes(1);
        expect(add_bulk_mock).toHaveBeenCalledWith(messages.map((message) => ({
          data: {
            scheduled_message_id: message.id,
            user_id: message.user_id,
          },
        })));
      });
    });

    describe('when there are plenty of scheduled messages', () => {
      let messagess: ScheduledMessages[][];

      beforeEach(() => {
        messagess = [
          // @ts-ignore
          messagesGen(100),
          // @ts-ignore
          messagesGen(1),
        ];
        find_all_mock.mockResolvedValueOnce(messagess[0]);
        find_all_mock.mockResolvedValueOnce(messagess[1]);
        find_all_mock.mockResolvedValueOnce([]);
      });

      test('should add bulk to queue', async () => {
        await service.handleCron();

        expect(find_all_mock).toHaveBeenCalledTimes(3);
        expect(add_bulk_mock).toHaveBeenCalledTimes(2);
        messagess.forEach((messages, index) => {
          expect(add_bulk_mock).toHaveBeenNthCalledWith(index + 1, messages.map((message) => ({
            data: {
              scheduled_message_id: message.id,
              user_id: message.user_id,
            },
          })));
        });
      });
    });
  });
});
