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
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';
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
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    // return this.usersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
