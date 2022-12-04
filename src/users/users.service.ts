import { GetUserDto } from './dto/get-user.dto';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './user.model';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcrypt';
import { Roles } from 'src/types/Roles.enum';
@Injectable()
export class UsersService {
  comparePassword(password: string, password1: string) {
    return bcrypt.compare(password, password1);
  }
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}
  private logger = new Logger(UsersService.name);
  async create(createUserDto: CreateUserDto): Promise<GetUserDto> {
    try {
      const password = await bcrypt.hash(createUserDto.password, 10);
      const createdUser = await this.userModel.create({
        ...createUserDto,
        password,
      });
      this.logger.debug(`User created: `, createdUser);
      return new GetUserDto(createdUser);
    } catch (e: any) {
      this.logger.error(e.message);
      throw e;
    }
  }

  async findAll() {
    try {
      const users = await this.userModel.find();
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

  async findByEmail(email: string): Promise<GetUserDto> {
    try {
      const user = await this.userModel
        .findOne({ email })
        .select('+password')
        .exec();

      this.logger.debug(`User found: ${user}`);
      const returnUser = new GetUserDto(user);
      this.logger.debug(`User found: ${returnUser}`);
      return returnUser;
    } catch (e: any) {
      this.logger.error(e.message);
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async createRandomUsers(count: number): Promise<GetUserDto[]> {
    const users = [];
    for (let i = 0; i < count; i++) {
      const hashedPassword = await bcrypt.hash(faker.internet.password(), 10);
      const user: User = {
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

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
