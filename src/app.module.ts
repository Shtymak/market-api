import { JwtModule, JwtService } from '@nestjs/jwt';
import { UsersModule } from './users/users.module';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { validationSchema } from 'config/validation';
import { config } from '../config/configuration';
import { AppController } from './app.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './users/users.controller';
import { RolesModule } from './roles/roles.module';
import { AuthModule } from './auth/auth.module';
import { MailModule } from './mail/mail.module';
import { UploadsModule } from './uploads/uploads.module';

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
  ],
  controllers: [AppController, UsersController],
  providers: [],
})
export class AppModule {}
