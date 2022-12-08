import { Injectable, Logger } from '@nestjs/common';
import TelegramBot, { SendMessageOptions } from 'node-telegram-bot-api';
import * as mongo from 'mongoose';
import { User, UserSchema } from 'src/users/user.model';

@Injectable()
export class TelegramClient {
  private logger = new Logger(TelegramClient.name);

  async loginHandler(
    bot: TelegramBot,
    message: TelegramBot.Message,
  ): Promise<void> {
    const chatId = message.chat.id;
    this.logger.debug(message);
    if (message.text === '/start') {
      bot.sendMessage(chatId, 'Hello, I am a bot!');
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
      bot.sendMessage(chatId, 'Please share your contact', option);
    }
  }
  async contactHandler(
    bot: TelegramBot,
    message: TelegramBot.Message,
  ): Promise<void> {
    const chatId = message.chat.id;
    this.logger.debug(message);
    if (message.contact) {
      bot.sendMessage(chatId, 'Thank you for sharing your contact');
      const user = await mongo.model(User.name, UserSchema).findOne({
        phone: '0683730414',
      });
      if (user) {
        bot.sendMessage(chatId, 'You are logged in');
      } else {
        bot.sendMessage(chatId, 'You are not registered');
      }
    }
  }
}
