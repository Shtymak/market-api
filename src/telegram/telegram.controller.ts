import { Controller, Get } from '@nestjs/common';
import { TelegramService } from './telegram.service';

@Controller('telegram')
export class TelegramController {
  constructor(private readonly telegramService: TelegramService) {}

  @Get('subscribe')
  subscribe() {
    console.log('subscribe');

    // this.telegramService.subscribe();
  }
}
