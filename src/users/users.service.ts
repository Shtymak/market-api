import { FullUserDto } from 'src/users/dto/full-user.dto';
import { faker } from '@faker-js/faker';
import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import * as path from 'path';
import { Roles } from 'src/types/Roles.enum';
import { CloudinaryUpload } from 'src/uploads/cloudnary.upload';
import * as uuid from 'uuid';
import { PaginationDto } from './../types/pagination.dto';
import { TransformFileDto } from './../uploads/dto/transformFile.dto';
import { UploadsService } from './../uploads/uploads.service';
import { CreateUserDto } from './dto/create-user.dto';
import { GetUserDto } from './dto/get-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './user.model';
@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly uploadsService: UploadsService,
  ) {}
  private logger = new Logger(UsersService.name);
  public comparePassword(password: string, password1: string) {
    return bcrypt.compare(password, password1);
  }
  async create(createUserDto: CreateUserDto): Promise<GetUserDto> {
    try {
      const alredyExist = await this.userModel.findOne({
        $or: [
          { email: createUserDto.email },
          { name: createUserDto.name },
          { phone: createUserDto.phone },
        ],
      });
      if (alredyExist) {
        const duplicate =
          alredyExist.email === createUserDto.email
            ? 'email'
            : alredyExist.name === createUserDto.name
            ? 'name'
            : 'phone';
        throw new HttpException(
          `User with this ${duplicate} already exist`,
          HttpStatus.BAD_REQUEST,
        );
      }
      const password = await bcrypt.hash(createUserDto.password, 10);
      const createdUser = await this.userModel.create({
        ...createUserDto,
        password,
      });
      this.logger.debug(`User created: `, createdUser);
      return new GetUserDto(createdUser);
    } catch (e: any) {
      this.logger.error(e.message);
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findAll({ page, limit }: PaginationDto) {
    try {
      const offset = (page - 1) * limit;
      const users = await this.userModel.find().skip(offset).limit(limit);
      return users.map((user) => new GetUserDto(user));
    } catch (e: any) {
      this.logger.error(e.message);
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findOne(id: string): Promise<GetUserDto> {
    try {
      const user = await this.userModel.findById(id);
      this.logger.debug(`User found: `, user);
      return new GetUserDto(user);
    } catch (e: any) {
      this.logger.error(e.message);
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  public async updatePassword(
    userId: string,
    password: string,
  ): Promise<GetUserDto> {
    try {
      const hash = await bcrypt.hash(password, 10);
      const updated = await this.userModel.findByIdAndUpdate(userId, {
        password: hash,
      });
      if (!updated) {
        throw new NotFoundException('User not found');
      }
      return new GetUserDto(updated);
    } catch (e: any) {
      this.logger.error(e.message);
      throw new HttpException(e.message, e.status);
    }
  }

  async findByEmail(email: string): Promise<GetUserDto> {
    try {
      const user = await this.userModel
        .findOne({ email })
        .select('+password')
        .exec();
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const returnUser = new GetUserDto(user);
      return returnUser;
    } catch (e: any) {
      this.logger.error(e.message);
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findByEmailWithPassword(email: string): Promise<FullUserDto> {
    const user = await this.userModel.findOne({ email });
    return new FullUserDto(user);
  }

  async createRandomUsers(count: number): Promise<GetUserDto[]> {
    const users = [];
    for (let i = 0; i < count; i++) {
      const hashedPassword = await bcrypt.hash(faker.internet.password(), 10);
      const user: CreateUserDto = {
        email: faker.internet.email(),
        password: hashedPassword,
        name: faker.name.firstName(),
        dateOfBirth: faker.date.past(),
        avatar: faker.image.avatar(),
        roles: [Roles.USER],
        banned: false,
        phone: faker.phone.phoneNumber(),
        googleId: '',
      };
      users.push(user);
    }
    const createdUsers = await this.userModel.insertMany(users);
    return createdUsers.map((user) => new GetUserDto(user));
  }

  public async update(
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<GetUserDto> {
    try {
      const updatedUser = await this.userModel.findByIdAndUpdate(
        id,
        updateUserDto,
        { new: true },
      );
      return new GetUserDto(updatedUser);
    } catch (e: any) {
      this.logger.error(e.message);
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  public async remove(id: string) {
    try {
      const deletedUser = await this.userModel.findByIdAndRemove(id);
      return new GetUserDto(deletedUser);
    } catch (e: any) {
      this.logger.error(e.message);
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  public async findByPhone(phone: string): Promise<GetUserDto> {
    try {
      const user = await this.userModel.findOne({ phone: phone });
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      this.logger.debug(user);
      const returnUser = new GetUserDto(user);
      return returnUser;
    } catch (e: any) {
      this.logger.error(e);
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  public async uploadAvatar(id: string, dto: TransformFileDto) {
    try {
      const { file } = dto;
      const fileName = `${uuid.v4()}${path.extname(file.originalname)}`;
      const avatarUrl = await this.uploadsService.uploadFile(
        fileName,
        file.buffer,
        new CloudinaryUpload(),
      );
      const updatedUser = await this.userModel.findOneAndUpdate(
        { _id: id },
        { avatar: avatarUrl },
        { new: true },
      );
      return new GetUserDto(updatedUser);
    } catch (e: any) {
      this.logger.error(e.message);
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
