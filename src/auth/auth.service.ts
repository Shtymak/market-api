import { GetAuthDto } from './dto/get-auth.dto';
import { LoginLink, LoginLinkDocument } from './login-link.model';
import { UsersService } from './../users/users.service';
import { MagicLinkDto } from './dto/magic-link.dto';
import { PayloadDto } from './dto/payload.dto';
import { GetUserDto } from './../users/dto/get-user.dto';
import { UserDocument } from './../users/user.model';
import {
  Injectable,
  Logger,
  HttpException,
  NotFoundException,
  HttpStatus,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/users/user.model';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as uuid from 'uuid';
import { CreateMailDto } from 'src/mail/dto/create-mail.dto';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(LoginLink.name)
    private readonly linkModel: Model<LoginLinkDocument>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly UsersService: UsersService,
    private readonly mailService: MailService,
  ) {}
  private logger = new Logger(AuthService.name);

  async magicLogin(dto: MagicLinkDto): Promise<GetAuthDto> {
    try {
      const link = await this.linkModel.findOne({ link: dto.link });
      if (!link) {
        throw new NotFoundException('Link not found');
      }
      if (link.isActived) {
        throw new HttpException('Link is already used', HttpStatus.BAD_REQUEST);
      }
      const user = await this.UsersService.findOne(link.user);
      if (!user) {
        throw new NotFoundException('User not found');
      }
      link.isActived = true;
      await link.save();
      const accessToken = this.generateToken(user);
      return {
        token: accessToken,
        user,
      };
    } catch (e) {
      throw new HttpException(e.message, e.status);
    }
  }
  async sendLoginMagicLink(email: string): Promise<boolean> {
    try {
      const user = await this.UsersService.findByEmail(email);
      const uuidLink = uuid.v4();
      const magicLink = `${this.configService.get<string>(
        'hostUrl',
      )}/auth/login/${uuidLink}`;
      await this.linkModel.create({
        link: magicLink,
        user: user.id,
        isActived: false,
      });
      const data: CreateMailDto = {
        to: email,
        subject: `Login ${this.configService.get<string>('appName')}`,
        content: `<a href="${magicLink}">Login</a>`,
      };
      const result = await this.mailService.sendMagicLink(data);
      return result;
    } catch (error) {
      this.logger.error(`Error on send magic link: ${error}`);
      throw new NotFoundException();
    }
  }

  validateAccessToken(token: string): string {
    try {
      const userData = this.jwtService.verify(token, {
        secret: this.configService.get<string>('jwt.secret'),
      });
      return userData;
    } catch (e) {
      this.logger.error(e.message);
      return null;
    }
  }

  generateToken(user: GetUserDto): string {
    const payload: PayloadDto = {
      id: user.id,
      email: user.email,
      name: user.name,
      roles: user.roles,
      banned: user.banned,
      avatar: user.avatar,
    };
    const accessToken = this.jwtService.sign(payload);
    return accessToken;
  }
}
