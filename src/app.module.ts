import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { validationSchema } from 'config/validation';
import { config } from '../config/configuration';
import { AppController } from './app.controller';
import { MongooseModule } from '@nestjs/mongoose';

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
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
