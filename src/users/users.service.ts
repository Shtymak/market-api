import { GetUserDto } from './dto/get-user.dto';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './user.model';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}
  private logger = new Logger(UsersService.name);
  async create(createUserDto: CreateUserDto): Promise<GetUserDto> {
    try {
      const createdUser = await this.userModel.create(createUserDto);
      this.logger.debug(`User created: `, createdUser);
      return new GetUserDto(createdUser);
    } catch (e: any) {
      this.logger.error(e.message);
      throw e;
    }
  }

  findAll() {
    return `This action returns all users`;
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

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
