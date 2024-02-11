import { Module } from '@nestjs/common';

// root module
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';

// db module
import { SequelizeModule } from '@nestjs/sequelize';
// user module

import { UserModule } from './user/user.module';

// scheduler module
import { ScheduleModule } from '@nestjs/schedule';

const MUST_BE_FALSE_IN_PRODUCTION = false;

@Module({
  imports: [
    ConfigModule.forRoot(),
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        dialect: configService.get('DB_DIALECT'),
        host: configService.get('DB_HOST'),
        port: +configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        autoLoadModels: true,
        // MUST be false in production
        synchronize: MUST_BE_FALSE_IN_PRODUCTION,
      }),
      inject: [ConfigService],
    }),
    UserModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
