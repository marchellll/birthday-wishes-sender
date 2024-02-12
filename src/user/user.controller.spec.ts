import { UserController } from './user.controller';
import { setupModule, Module } from './user.module.setup.spec';


describe('UserController', () => {
  let controller: UserController;

  beforeEach(async () => {
    const m = await setupModule();

    controller = m.user_controller;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
