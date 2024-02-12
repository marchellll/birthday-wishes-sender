import { faker } from '@faker-js/faker';

import { setupModule, Module } from './user.module.setup.spec';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { ScheduledMessages } from './entities/scheduled-message.entity';


describe('UserService', () => {
  let m: Module; // module

  beforeEach(async () => {
    // clean module everytime
    m = await setupModule();
  });

  it('should be defined', () => {
    expect(m.user_service).toBeDefined();
  });

  describe('create', () => {
    let created_user;
    let upsert_mock;
    let create_mock;

    beforeEach(() => {
      created_user = {
        id: 1,
      };

      create_mock = (m.user_model.create as jest.Mock).mockResolvedValue(created_user);
      upsert_mock = jest.spyOn(m.user_service, 'upsertBirthdayMessage').mockResolvedValue(null);
    });

    test('should create data in DB', async () => {
      const data = {
        firstname: 'marchell',
        lastname: 'imanuel',
        email: 'imanuel.marchell@gmail.com',
        timezone: 'Asia/Jakarta',
        birthdate: '1990-01-01',
      };
      await m.user_service.create(data);

      expect(create_mock).toHaveBeenCalledTimes(1);
      expect(create_mock).toHaveBeenCalledWith({
        ...data,
      });
      expect(upsert_mock).toHaveBeenCalledTimes(1);
      expect(upsert_mock).toHaveBeenCalledWith(created_user, m.transaction);
    });
  });

  describe('findAll', () => {
    let find_all_mock: jest.Mock;
    let find_all_result: { id: number }[];

    beforeEach(() => {
      find_all_result = Array.from({ length: faker.number.int({ max: 5 }) }, (_, i) => ({ id: 1 }));
      find_all_mock = (m.user_model.findAll as jest.Mock).mockResolvedValue(
        find_all_result,
      );
    });

    test('should find all', async () => {
      const result = await m.user_service.findAll();

      expect(result).toEqual(find_all_result);
    });
  });

  describe('findOne', () => {
    let id: number;
    let expected_result: {id: number};

    let find_one_mock: jest.Mock;

    beforeEach(() => {
      id = faker.number.int();
      expected_result = { id };

      find_one_mock = (m.user_model.findOne as jest.Mock).mockResolvedValue(expected_result);
    });

    test('should found one', async () => {
      const result = await m.user_service.findOne(id);

      expect(result).toEqual(expected_result);
    });
  });

  describe('update', () => {
    let id: number;
    let update_dto: UpdateUserDto;

    let found_user: User;

    let find_one_mock: jest.SpyInstance;
    let update_mock: jest.Mock;
    let upsert_message_mock: jest.SpyInstance;

    beforeEach(() => {
      id = faker.number.int();
      update_dto = {
        firstname: faker.person.firstName(),
      };

      update_mock = jest.fn();

      // @ts-ignore
      found_user = {
        id,
        update: update_mock,
      };

      find_one_mock = jest.spyOn(m.user_service, 'findOne').mockResolvedValue(found_user);
      update_mock.mockResolvedValue(found_user);
      upsert_message_mock = jest.spyOn(m.user_service, 'upsertBirthdayMessage').mockResolvedValue(null);
    });

    test('should update', async () => {
      const result = await m.user_service.update(id, update_dto);

      expect(result).toEqual(found_user);
    });
  });

  describe('remove', () => {
    let id: number;
    let find_one_mock: jest.SpyInstance;
    let destroy_mock: jest.Mock;

    let found_user: User;

    beforeEach(() => {
      id = faker.number.int();

      destroy_mock = jest.fn();

      // @ts-ignore
      found_user = {
        id,
        destroy: destroy_mock,
      };
      find_one_mock = jest.spyOn(m.user_service, 'findOne').mockResolvedValue(found_user);
      destroy_mock.mockResolvedValue(null);
    });

    test('should destroy user', async () => {
      const result = await m.user_service.remove(id);

      expect(destroy_mock).toHaveBeenCalledTimes(1);
      expect(result).toEqual(found_user);
    });
  });

  describe('calculateNextBirthday', () => {
    describe('when birthday has not passed this year', () => {
      test('should calculate next birthday this year', () => {
        jest.useFakeTimers().setSystemTime(new Date('2020-06-01'));;

        const date = new Date('1990-06-03');
        const timezone = 'Asia/Jakarta';
        const result = m.user_service.calculateNextBirthday(date, timezone);

        expect(result).toEqual(new Date('2020-06-03T01:59:59.000Z'));

        jest.useRealTimers();
      });
    });

    describe('when birthday has passed this year', () => {
      test('should calculate next birthday next year', () => {
        jest.useFakeTimers().setSystemTime(new Date('2020-06-01'));;

        const date = new Date('1990-05-03');
        const timezone = 'Asia/Jakarta';
        const result = m.user_service.calculateNextBirthday(date, timezone);

        expect(result).toEqual(new Date('2021-05-03T01:59:59.000Z'));

        jest.useRealTimers();
      });
    });
  });

  describe('upsertBirthdayMessage', () => {
    let user: User;
    let transaction: any;

    let found_message: ScheduledMessages;

    let find_one_mock: jest.Mock;
    let upsert_mock: jest.Mock;

    beforeEach(() => {
      // @ts-ignore
      user = {
        id: faker.number.int(),
        email: faker.internet.email(),
        firstname: faker.person.firstName(),
        lastname: faker.person.lastName(),
        birthdate: new Date('1990-01-01'),
      };
      transaction = {
        LOCK: { UPDATE: 'update' },
      };

      // @ts-ignore
      found_message = {
        id: faker.number.int(),
      };

      find_one_mock = m.scheduled_messages_model.findOne as jest.Mock;
      upsert_mock = (m.scheduled_messages_model.upsert as jest.Mock).mockResolvedValue(null);
    });

    describe('when scheduled message is not found', () => {
      beforeEach(() => {
        find_one_mock.mockResolvedValue(null);
      });

      test('should upsert birthday message', async () => {
        await m.user_service.upsertBirthdayMessage(user, transaction);

        expect(upsert_mock).toHaveBeenCalledTimes(1);
        expect(upsert_mock).toHaveBeenCalledWith({
          id: undefined,
          title: expect.any(String),
          body: expect.any(String),
          user_id: user.id,
          recipient: user.email,
          recipient_type: 'email',
          scheduled_at: expect.any(Date),
        }, {
          transaction,
        });
      });
    });

    describe('when scheduled message is found', () => {
      beforeEach(() => {
        find_one_mock.mockResolvedValue(found_message);
      });

      test('should upsert birthday message', async () => {
        await m.user_service.upsertBirthdayMessage(user, transaction);

        expect(upsert_mock).toHaveBeenCalledTimes(1);
        expect(upsert_mock).toHaveBeenCalledWith({
          id: found_message.id,
          title: expect.any(String),
          body: expect.any(String),
          user_id: user.id,
          recipient: user.email,
          recipient_type: 'email',
          scheduled_at: expect.any(Date),
        }, {
          transaction,
        });
      });
    });
  });
});
