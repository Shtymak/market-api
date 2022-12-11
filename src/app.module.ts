import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { validationSchema } from '../config/validation';
import { config } from '../config/configuration';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { MailModule } from './mail/mail.module';
import { RedisModule } from './redis/redis.module';
import { RolesModule } from './roles/roles.module';
import { TelegramModule } from './telegram/telegram.module';
import { UploadsModule } from './uploads/uploads.module';
import { UsersController } from './users/users.controller';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('database.uri'),
      }),
    }),
    ConfigModule.forRoot({
      envFilePath: `.${process.env.NODE_ENV || '.dev'}.env`,
      isGlobal: true,
      load: [config],
      validationSchema: validationSchema,
    }),
    RolesModule,
    AuthModule,
    MailModule,
    UsersModule,
    UploadsModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret'),
        signOptions: {
          expiresIn: configService.get<string>('jwt.expiresIn'),
        },
      }),
    }),
    TelegramModule,
    RedisModule,
  ],
  controllers: [AppController, UsersController],
  providers: [],
})
export class AppModule {}
