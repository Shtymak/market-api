import { JwtAuthGuard } from './../auth/auth.guard';
import { RolesGuard } from './../roles/roles.guard';
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
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Req,
  NotFoundException,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  ApiBody,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Response } from 'express';
import { Roles } from '../roles/roles.decorator';
import { Roles as PermissionRoles } from '../types/Roles.enum';
import { FileInterceptor } from '@nestjs/platform-express';
import { SharpPipe } from 'pipes/sharp.pipe';
import { TransformFileDto } from '../uploads/dto/transformFile.dto';
import { PaginationDto } from '../types/pagination.dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ type: GetUserDto, status: HttpStatus.CREATED })
  @UseGuards(RolesGuard)
  @Roles(PermissionRoles.ADMIN, PermissionRoles.MODERATOR)
  async create(
    @Body() createUserDto: CreateUserDto,
    @Res() response: Response,
  ) {
    console.log('Create user dto', createUserDto);

    const user = await this.usersService.create(createUserDto);
    response.status(HttpStatus.CREATED).json(user);
  }

  @Post('/create/random')
  @ApiOperation({ summary: 'Create a random user' })
  @ApiResponse({ type: [GetUserDto], status: HttpStatus.CREATED })
  // @UseGuards(RolesGuard)
  // @Roles(PermissionRoles.ADMIN)
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
  @UseGuards(RolesGuard)
  @Roles(PermissionRoles.ADMIN, PermissionRoles.MODERATOR)
  findAll(@Query() query: PaginationDto) {
    return this.usersService.findAll(query);
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
  @UseGuards(RolesGuard)
  @Roles(PermissionRoles.ADMIN, PermissionRoles.MODERATOR)
  @ApiOperation({ summary: 'Delete a user' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({ status: HttpStatus.OK })
  async remove(@Param('id') id: string, @Res() response: Response) {
    await this.usersService.remove(id);
    response.status(HttpStatus.OK).send();
  }

  @Post('upload/avatar')
  @UseInterceptors(FileInterceptor('avatar'))
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Add avatar to user' })
  @ApiResponse({
    type: GetUserDto,
    status: HttpStatus.OK,
    description: 'File name',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiNotFoundResponse({ description: 'File not found' })
  async uploadFile(
    @UploadedFile(SharpPipe) file: TransformFileDto,
    @Req() request,
  ) {
    console.log(file);

    if (!file) {
      // this.logger.error('No file received');
      throw new NotFoundException('No file found');
    }
    const user = await this.usersService.uploadAvatar(request.user.id, file);
    return user;
  }
}
