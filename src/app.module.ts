import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';

const MUST_BE_FALSE_IN_PRODUCTION = false;

@Module({
  imports: [
    UserModule,
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
    })
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
