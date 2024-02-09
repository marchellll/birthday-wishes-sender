import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './entities/user.entity';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User)
    private user_model: typeof User,
  ) {}

  async create(createUserDto: CreateUserDto) {
    return this.user_model.create({
      ...createUserDto,
    });
  }

  async findAll() {
    return this.user_model.findAll();
  }

  async findOne(id: number) {
    return await this.user_model.findOne({
      where: {
        id,
      },
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(id);
    const updated = await user.update(updateUserDto);

    return updated;
  }

  async remove(id: number) {
    const user = await this.findOne(id);
    await user.destroy();

    return user;
  }
}
