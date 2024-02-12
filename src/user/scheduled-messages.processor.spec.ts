import { faker } from '@faker-js/faker';

import { setupModule, Module } from './user.module.setup.spec';

import { ScheduledMessages } from './entities/scheduled-message.entity';
import { ScheduledMessagesProcessor } from './scheduled-messages.processor';
import { of, map } from 'rxjs';
import { AxiosError } from 'axios';

describe('ScheduledMesssagesProcessor', () => {
  let m: Module; // module
  let processor: ScheduledMessagesProcessor;

  let now: Date;

  beforeEach(async () => {
    // clean module everytime
    m = await setupModule();
    processor = m.scheduled_messages_processor;

    now = new Date();
    jest.useFakeTimers().setSystemTime(now);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should be defined', () => {
    expect(processor).toBeDefined();
  });

  describe('process', () => {
    let find_by_pk_mock: jest.Mock;
    let user_find_by_pk_mock: jest.Mock;
    let update_mock: jest.Mock;
    let post_mock: jest.SpyInstance;

    let message: ScheduledMessages;
    let user: any;

    beforeEach(() => {
      update_mock = jest.fn();
      // @ts-ignore
      message = {
        id: 1,
        user_id: 1,
        recipient: faker.internet.email(),
        body: faker.lorem.paragraph(),
        scheduled_at: new Date(now.getTime() - 1000),
        update: update_mock,
      };

      user = {
        id: 1,
      };

      find_by_pk_mock = (m.scheduled_messages_model.findByPk as jest.Mock);
      user_find_by_pk_mock = (m.user_model.findByPk as jest.Mock);
      post_mock = jest.spyOn(m.http_service, 'post');
    });

    afterEach(() => {

    });

    describe('when message not found', () => {
      beforeEach(() => {
        find_by_pk_mock.mockResolvedValueOnce(null);
        user_find_by_pk_mock.mockResolvedValueOnce(user);
      });

      test('should not do anything', async () => {
        await processor.process({ data: { scheduled_message_id: 1, user_id: 1 } } as any);

        expect(post_mock).not.toHaveBeenCalled();
        expect(update_mock).not.toHaveBeenCalled();
      });
    });

    describe('when user not found', () => {
      beforeEach(() => {
        find_by_pk_mock.mockResolvedValueOnce(message);
        user_find_by_pk_mock.mockResolvedValueOnce(null);
      });

      test('should not do anything', async () => {
        await processor.process({ data: { scheduled_message_id: 1, user_id: 1 } } as any);

        expect(post_mock).not.toHaveBeenCalled();
        expect(update_mock).not.toHaveBeenCalled();
      });
    });

    describe('when message is not yet due', () => {
      beforeEach(() => {
        find_by_pk_mock.mockResolvedValueOnce({
          ...message,
          scheduled_at: new Date(now.getTime() + 1000),
        });
        user_find_by_pk_mock.mockResolvedValueOnce(user);
      });

      test('should not do anything', async () => {
        await processor.process({ data: { scheduled_message_id: 1, user_id: 1 } } as any);

        expect(post_mock).not.toHaveBeenCalled();
        expect(update_mock).not.toHaveBeenCalled();
      });
    });

    describe('when the message is due', () => {
      beforeEach(() => {
        find_by_pk_mock.mockResolvedValueOnce(message);
        user_find_by_pk_mock.mockResolvedValueOnce(user);
        post_mock.mockReturnValue(of({ data: { status: 'success' } }));
      });

      test('should send the message', async () => {
        const response = { data: { status: 'success' } };

        await processor.process({ data: { scheduled_message_id: 1, user_id: 1 } } as any);

        expect(post_mock).toHaveBeenCalledWith(
          `https://email-service.digitalenvision.com.au/send-email`,
          {
            email: message.recipient,
            message: message.body,
          },
        );

        expect(update_mock).toHaveBeenCalledWith(
          { scheduled_at: expect.any(Date) },
          { transaction: m.transaction },
        );
      });
    });

    describe('when the message is due but failed to send', () => {
      beforeEach(() => {
        find_by_pk_mock.mockResolvedValueOnce(message);
        user_find_by_pk_mock.mockResolvedValueOnce(user);
        post_mock.mockImplementation(() => {
          // throw new AxiosError('error');
          return of(1).pipe(map(n => {
            throw new AxiosError('error', 'code', null, null, { data: { status: 'failed' } } as any);
          }));
        });
      });

      test('should update the message status to failed', async () => {
        try {

          await processor.process({ data: { scheduled_message_id: 1, user_id: 1 } } as any);
        } catch (error) {

        }

        expect(update_mock).not.toHaveBeenCalled();
      });
    });

  });
});
