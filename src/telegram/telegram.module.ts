import { AuthModule } from './../auth/auth.module';
import { UsersModule } from './../users/users.module';
import { Module } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { TelegramController } from './telegram.controller';

@Module({
  controllers: [TelegramController],
  providers: [TelegramService],
  exports: [TelegramService],
  imports: [UsersModule, AuthModule],
})
export class TelegramModule {}
