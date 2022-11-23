import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { CreateMailDto } from './dto/create-mail.dto';

@Injectable()
export class MailService {
  transporter: string;
  constructor(
    private mailService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  async sendMagicLink(data: CreateMailDto): Promise<boolean> {
    const send = await this.mailService.sendMail({
      to: data.to,
      subject: data.subject,
      text: '',
      html: data.content,
    });
    return send ? true : false;
  }
}
