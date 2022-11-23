import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validationSchema } from 'config/validation';
import { config } from '../config/configuration';
import { AppController } from './app.controller';
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.${process.env.NODE_ENV || 'development'}.env`,
      isGlobal: true,
      load: [config],
      validationSchema: validationSchema,
    }),
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
