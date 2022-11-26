import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateMailDto } from 'src/mail/dto/create-mail.dto';
import { MailService } from 'src/mail/mail.service';
import * as uuid from 'uuid';
import { GetUserDto } from './../users/dto/get-user.dto';
import { UsersService } from './../users/users.service';
import { GetAuthDto } from './dto/get-auth.dto';
import { MagicLinkDto } from './dto/magic-link.dto';
import { PayloadDto } from './dto/payload.dto';
import { LoginLink, LoginLinkDocument } from './login-link.model';

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

  private generateAccessCode(): string {
    const mask = '000000';
    const code = Math.floor(Math.random() * 999999).toString();
    return mask.substring(0, mask.length - code.length) + code;
  }

  public async magicLogin(dto: MagicLinkDto): Promise<GetAuthDto> {
    try {
      const candidate = await this.UsersService.findByEmail(dto.email);
      if (!candidate) {
        throw new NotFoundException('User not found');
      }
      const link = await this.linkModel.findOne({
        link: dto.code,
        user: candidate.id,
      });
      if (!link) {
        throw new NotFoundException('Code not found');
      }
      if (link.isActived) {
        throw new HttpException('Code is already used', HttpStatus.FORBIDDEN);
      }
      if (link.link !== dto.code) {
        throw new HttpException('Code is not valid', HttpStatus.BAD_REQUEST);
      }
      //code live is 15 minutes
      const now = new Date();
      const diff = now.getTime() - link.createdAt.getTime();
      const minutes = Math.floor(diff / 1000 / 60);

      this.logger.debug(`Minutes: ${minutes}`);
      if (minutes > 15) {
        throw new HttpException('Code is expired', HttpStatus.FORBIDDEN);
      }
      await this.linkModel.updateOne(
        { _id: link._id },
        { isActived: true },
        { new: true },
      );
      const accessToken = this.generateToken(candidate);
      return {
        token: accessToken,
        user: candidate,
      };
    } catch (e) {
      throw new HttpException(e.message, e.status);
    }
  }
  public async sendLoginMagicLink(email: string): Promise<boolean> {
    try {
      const user = await this.UsersService.findByEmail(email);
      this.logger.debug(`User: ${JSON.stringify(user)}`);
      const accessCode = this.generateAccessCode();
      const data: CreateMailDto = {
        to: email,
        subject: `Login ${this.configService.get<string>('appName')}`,
        content: `<h1>Access code: ${accessCode}</h1>`,
      };
      await this.linkModel.create({
        link: accessCode,
        user: user.id,
        isActived: false,
      });
      const result = await this.mailService.sendMagicLink(data);
      return result;
    } catch (error) {
      this.logger.error(`Error on send magic link: ${error}`);
      throw new NotFoundException();
    }
  }

  public validateAccessToken(token: string): string {
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

  public generateToken(user: GetUserDto): string {
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
