import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { DateTime } from 'luxon';

import { User } from './entities/user.entity';
import { ScheduledMessages } from './entities/scheduled-message.entity';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User)
    private user_model: typeof User,

    @InjectModel(ScheduledMessages)
    private scheduled_message_model: typeof ScheduledMessages,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const user = await this.user_model.create({
      ...createUserDto,
    });

    await this.upsertBirthdayMessage(user)

    return user;
  }

  async findAll() {
    return await this.user_model.findAll();
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

  /**
   * Calculate the next birthday
   *
   * @param date
   * @param timezone
   * @returns DateTime
   */
  calculateNextBirthday(date: Date, timezone: string): Date {
    const luxon_date = DateTime.fromJSDate(date, { zone: timezone });
    const birthdate_this_year = luxon_date.set({ year: DateTime.now().year });
    const today = DateTime.now().setZone(timezone);

    let next_birthday = birthdate_this_year;

    if (birthdate_this_year < today) {
      // set the correct year if the birthday has passed
      next_birthday = birthdate_this_year.plus({ years: 1 });
    }

    // set the time to 9am
    next_birthday = next_birthday.set({ hour: 9 });

    return next_birthday.toJSDate();
  };

  async upsertBirthdayMessage(user: User) {
    // need to find the primary key for scheduled_messages
    // so we can update the record if it exists
    const scheduled_birthday_email = await this.scheduled_message_model.findOne({
      where: {
        user_id: user.id,
        recipient_type: 'email',
      },
    });

    await this.scheduled_message_model.upsert({
    // if id is null, it will insert a new record
      id: scheduled_birthday_email?.id,
      user_id: user.id,
      recipient: user.email,
      recipient_type: 'email',
      scheduled_at: this.calculateNextBirthday(user.birthdate, user.timezone),
      title: `Hey, ${user.firstname} ${user.lastname} it's your birthday`,
      body: `Hey, ${user.firstname} ${user.lastname} it's your birthday`,
    });
  }
}
