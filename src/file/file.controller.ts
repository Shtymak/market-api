import { Request } from 'express';
import { ReqUser } from './../decorators/ReqUser';
import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { FileService } from './file.service';
import CreateFolderDto from './dto/create-folder.dto';
import { JwtAuthGuard } from '../auth/auth.guard';

@Controller('file')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post('folder/create')
  @UseGuards(JwtAuthGuard)
  public async createFolder(@Req() req: any, @Body() body: CreateFolderDto) {
    console.log('req.user', req.user);

    return this.fileService.createFolder(body, req.user.id);
  }
}
