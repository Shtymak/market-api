import { LoginWithPasswordDto } from './dto/password-login.dto';
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
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import * as uuid from 'uuid';
import { GetUserDto } from './../users/dto/get-user.dto';
import { UsersService } from './../users/users.service';
import { GetAuthDto } from './dto/get-auth.dto';
import { MagicLinkDto } from './dto/magic-link.dto';
import { PayloadDto } from './dto/payload.dto';
import { LoginLink, LoginLinkDocument } from './login-link.model';
import { FullUserDto } from 'src/users/dto/full-user.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(LoginLink.name)
    private readonly linkModel: Model<LoginLinkDocument>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly mailService: MailService,
  ) {}
  private logger = new Logger(AuthService.name);

  private generateAccessCode(): string {
    const mask = '000000';
    const code = Math.floor(Math.random() * 999999).toString();
    return mask.substring(0, mask.length - code.length) + code;
  }

  public async saveAccessCode(user: GetUserDto): Promise<string> {
    try {
      const code = this.generateAccessCode();
      await this.linkModel.create({
        link: code,
        user: user.id,
        isActived: false,
      });
      return code;
    } catch (e) {
      throw new HttpException(e.message, e.status);
    }
  }

  public async registration(user: CreateUserDto): Promise<GetAuthDto> {
    try {
      const newUser = await this.usersService.create(user);
      const accessToken = this.generateToken(newUser);
      return {
        token: accessToken,
        user: newUser,
      };
    } catch (e) {
      throw new HttpException(e.message, e.status);
    }
  }

  public async loginWithPassword(
    input: LoginWithPasswordDto,
  ): Promise<GetAuthDto> {
    try {
      const user = await this.usersService.findByEmailWithPassword(input.email);
      if (!user) {
        throw new NotFoundException('User not found');
      }
      this.logger.debug(user);
      this.logger.debug({ inp: input.password, user: user.password });
      const isPasswordValid = await this.usersService.comparePassword(
        input.password,
        user.password,
      );
      if (!isPasswordValid) {
        throw new HttpException('Invalid password', HttpStatus.BAD_REQUEST);
      }
      const accessToken = this.generateToken(new GetUserDto(user));
      return {
        token: accessToken,
        user: new GetUserDto(user),
      };
    } catch (e) {
      console.log(e);

      throw new HttpException(
        e.message,
        e.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  public async magicLogin(dto: MagicLinkDto): Promise<GetAuthDto> {
    try {
      const candidate = await this.usersService.findByEmail(dto.email);
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
      const user = await this.usersService.findByEmail(email);
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
  public async sendResetPasswordLink(email: string) {
    try {
      const user = await this.usersService.findByEmail(email);
      const uui = uuid.v4();
      await this.linkModel.create({
        link: `${uui}`,
        user: user.id,
        isActived: false,
      });
      const data: CreateMailDto = {
        to: email,
        subject: `Reset password for ${user.email}`,
        content: `<h1>Reset Link: ${this.configService.get(
          'baseUrl',
        )}/auth/reset/password/${uui}
        }</h1>`,
      };
      await this.mailService.sendResetLink(data);
    } catch (error) {}
  }

  public async resetPassword(uud: string) {
    try {
      const link = await this.linkModel.findOne({ link: uud });
      if (!link) {
        throw new NotFoundException('Failed to reset password');
      }
      if (link.isActived) {
        throw new HttpException(
          'Failed to reset password',
          HttpStatus.FORBIDDEN,
        );
      }
      const user = await this.usersService.findOne(link.user);
      if (!user) {
        throw new NotFoundException('Failed to reset password! User not found');
      }
      const password = uuid.v4().slice(0, 30);
      const update = await this.usersService.updatePassword(user.id, password);
      if (!update) {
        throw new HttpException(
          'Failed to reset password',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      await this.linkModel.updateOne(
        { _id: link._id },
        { isActived: true },
        { new: true },
      );
      const data: CreateMailDto = {
        to: user.email,
        subject: `Reset password for ${user.email}`,
        content: `<h1>New password: ${password}</h1>`,
      };

      await this.mailService.sendPasswordChanged(data);
      return true;
    } catch (error) {
      this.logger.error(`Error on reset password: ${error}`);
      throw new HttpException(error.message, error.status);
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
