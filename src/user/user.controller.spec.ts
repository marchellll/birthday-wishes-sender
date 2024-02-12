import { faker } from '@faker-js/faker';
import { UserController } from './user.controller';
import { setupModule, Module } from './user.module.setup.spec';
import { UserService } from './user.service';


describe('UserController', () => {
  let controller: UserController;
  let service: UserService;

  let a_user: any;

  let create_mock,
  find_all_mock,
  find_one_mock,
  update_mock,
  remove_mock: jest.SpyInstance;

  beforeEach(async () => {
    const m = await setupModule();

    a_user = {
      id: faker.number.int(),
    };

    controller = m.user_controller;
    service = m.user_service;

    create_mock = jest.spyOn(service, 'create').mockResolvedValueOnce(a_user);
    find_all_mock = jest.spyOn(service, 'findAll').mockResolvedValueOnce([a_user]);
    find_one_mock = jest.spyOn(service, 'findOne').mockResolvedValueOnce(a_user);
    update_mock = jest.spyOn(service, 'update').mockResolvedValueOnce(a_user);
    remove_mock = jest.spyOn(service, 'remove').mockResolvedValueOnce(a_user);


  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a user', async () => {
      await controller.create({});

      expect(create_mock).toHaveBeenCalledTimes(1);
    });
  });

  describe('findAll', () => {
    it('should find all user', async () => {
      await controller.findAll();

      expect(find_all_mock).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne', () => {
    it('should find a user', async () => {
      await controller.findOne(a_user.id);

      expect(find_one_mock).toHaveBeenCalledTimes(1);
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      await controller.update(a_user.id, {});

      expect(update_mock).toHaveBeenCalledTimes(1);
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      await controller.remove(a_user.id);

      expect(remove_mock).toHaveBeenCalledTimes(1);
    });
  });
});
