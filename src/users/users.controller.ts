import { GetUserDto } from './dto/get-user.dto';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  Res,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ type: GetUserDto, status: HttpStatus.CREATED })
  async create(
    @Body() createUserDto: CreateUserDto,
    @Res() response: Response,
  ) {
    const user = await this.usersService.create(createUserDto);
    response.status(HttpStatus.CREATED).json(user);
  }

  @Post('/create/random')
  @ApiOperation({ summary: 'Create a random user' })
  @ApiResponse({ type: [GetUserDto], status: HttpStatus.CREATED })
  async createRandomUsers(
    @Body() body: { count: number },
    @Res() response: Response,
  ) {
    const user = await this.usersService.createRandomUsers(body.count);
    response.status(HttpStatus.CREATED).json(user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ type: [GetUserDto], status: HttpStatus.OK })
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by id' })
  @ApiResponse({ type: GetUserDto, status: HttpStatus.OK })
  @ApiParam({ name: 'id', type: 'string' })
  async findOne(@Param('id') id: string): Promise<GetUserDto> {
    const user = await this.usersService.findOne(id);
    return user;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a user' })
  @ApiBody({ type: UpdateUserDto })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({ type: GetUserDto, status: HttpStatus.OK })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({ status: HttpStatus.OK })
  async remove(@Param('id') id: string, @Res() response: Response) {
    await this.usersService.remove(id);
    response.status(HttpStatus.OK).send();
  }
}
