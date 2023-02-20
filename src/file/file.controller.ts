import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FOLDER_PERMISSIONS } from 'src/roles/permission.enum';
import { JwtAuthGuard } from '../auth/auth.guard';
import { Permissions } from './../roles/permission.decorator';
import { PermissionsGuard } from './../roles/permission.guard';
import CreateFolderDto from './dto/create-folder.dto';
import UploadFileDto from './dto/upload-file.dto';
import { FileService } from './file.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
@Controller('file')
export class FileController {
  constructor(
    private readonly fileService: FileService,
    private readonly configService: ConfigService,
  ) {}

  @Post('create/folder')
  @UseGuards(JwtAuthGuard)
  public async createFolder(@Req() req: any, @Body() body: CreateFolderDto) {
    console.log('req.user', req.user);

    return this.fileService.createFolder(body, req.user.id);
  }

  @Post('folder/upload/:folderId')
  @UseGuards(PermissionsGuard)
  @Permissions(FOLDER_PERMISSIONS.OWNER)
  @UseInterceptors(FileInterceptor('file'))
  public async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Param('folderId') folderId: string,
    @Req() req: any,
  ) {
    const fileDto: UploadFileDto = {
      // name: file.originalname,
      file: file,
      creatorId: req.user.id,
      folderId,
    };
    return this.fileService.uploadFile(fileDto);
  }

  @Get('folder/get/:folderId')
  @UseGuards(PermissionsGuard)
  @Permissions(
    FOLDER_PERMISSIONS.OWNER,
    FOLDER_PERMISSIONS.ADMIN,
    FOLDER_PERMISSIONS.USER,
  )
  public async getFolder(@Param('folderId') folderId: string) {
    return this.fileService.getFolderById(folderId);
  }

  @Get('folder/:folderId/files')
  @UseGuards(PermissionsGuard)
  @Permissions(
    FOLDER_PERMISSIONS.OWNER,
    FOLDER_PERMISSIONS.ADMIN,
    FOLDER_PERMISSIONS.USER,
  )
  public async getFolderFiles(@Param('folderId') folderId: string) {
    return this.fileService.getFilesByFolderId(folderId);
  }

  @Get('folder/files/:fileId/:folderId')
  @UseGuards(PermissionsGuard)
  @Permissions(
    FOLDER_PERMISSIONS.OWNER,
    FOLDER_PERMISSIONS.ADMIN,
    FOLDER_PERMISSIONS.USER,
  )
  public async getFile(@Param('fileId') fileId: string, @Res() res: any) {
    const file = await this.fileService.getFilePathById(fileId);
    const host = await this.configService.get('hostUrl');
    console.log(`${host}/${file}`);

    return res.redirect(`${host}/${file}`);
  }

  @Get('folder/entries/:folderId')
  @UseGuards(PermissionsGuard)
  @Permissions(
    FOLDER_PERMISSIONS.OWNER,
    FOLDER_PERMISSIONS.ADMIN,
    FOLDER_PERMISSIONS.USER,
  )
  public async getFolderEntries(@Param('folderId') folderId: string) {
    return this.fileService.getFilesListByFolderId(folderId);
  }
}
