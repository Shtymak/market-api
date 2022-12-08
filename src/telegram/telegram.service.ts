import { AuthService } from './../auth/auth.service';
import { ConfigService } from '@nestjs/config';
import { UsersService } from './../users/users.service';
import { Injectable, Logger } from '@nestjs/common';
import { SendMessageOptions } from 'node-telegram-bot-api';
import * as TelegramBot from 'node-telegram-bot-api';
@Injectable()
export class TelegramService {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    this.bot.on('message', (message) => {
      this.loginHandler(message);
    });
    this.bot.on('contact', (message) => {
      this.contactHandler(message);
    });
  }
  private logger = new Logger(TelegramService.name);
  private bot = new TelegramBot(this.configService.get('telegram.token'), {
    polling: true,
  });
  async loginHandler(message: TelegramBot.Message): Promise<void> {
    const chatId = message.chat.id;
    this.logger.debug(message);
    if (message.text === '/start') {
      this.bot.sendMessage(chatId, 'Hello, I am a bot!');
    }
    if (message.text === '/login') {
      const option: SendMessageOptions = {
        parse_mode: 'Markdown',
        reply_markup: {
          one_time_keyboard: true,
          keyboard: [
            [
              {
                text: 'Share my contact',
                request_contact: true,
              },
            ],
            [
              {
                text: 'Cancel',
              },
            ],
          ],
        },
      };
      this.bot.sendMessage(chatId, 'Please share your contact', option);
    }
  }
  async contactHandler(message: TelegramBot.Message): Promise<void> {
    const chatId = message.chat.id;
    this.logger.debug(message);
    if (message.contact) {
      this.bot.sendMessage(chatId, 'Thank you for sharing your contact');
      try {
        const user = await this.usersService.findByPhone(
          message.contact.phone_number,
        );

        if (user) {
          const code = await this.authService.saveAccessCode(user);
          this.bot.sendMessage(chatId, `Your access code is ${code}`);
        } else {
          this.bot.sendMessage(chatId, 'You are not registered');
        }
      } catch (e) {
        this.logger.error(e);
        this.bot.sendMessage(chatId, 'You are not registered');
      }
    }
  }
}
