import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import { FOLDER_PERMISSIONS } from 'src/roles/permission.enum';
import { JwtAuthGuard } from '../auth/auth.guard';
import { Permissions } from './../roles/permission.decorator';
import { PermissionsGuard } from './../roles/permission.guard';
import CreateFolderDto from './dto/create-folder.dto';
import UploadFileDto from './dto/upload-file.dto';
import { FileService } from './file.service';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
@Controller('file')
export class FileController {
  constructor(
    private readonly fileService: FileService,
    private readonly configService: ConfigService,
  ) {}
  @ApiBearerAuth() // This indicates that the endpoint requires a bearer token
  @ApiOperation({ summary: 'Create a new folder' }) // This provides a brief description of what the endpoint does
  @ApiOkResponse({ description: 'The folder was created successfully' }) // This describes the response when the folder is created successfully
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
  @ApiOperation({ summary: 'Uploads a file to a folder' })
  @ApiParam({ name: 'folderId', description: 'ID of the folder to upload to' })
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
  @ApiOperation({
    summary: 'Get folder by ID',
    description: 'Retrieves a folder by its unique identifier',
  })
  @ApiResponse({
    status: 200,
    description: 'Folder data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden',
  })
  @ApiResponse({
    status: 404,
    description: 'Folder not found',
  })
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
  @ApiOperation({
    summary: 'Get folder files by ID',
    description: 'Retrieves a folder by its unique identifier',
  })
  @ApiResponse({
    status: 200,
    description: 'Folder`s files data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden',
  })
  @ApiResponse({
    status: 404,
    description: 'Folder not found',
  })
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
  @ApiOkResponse({
    description:
      'Returns the file with the specified ID in the specified folder.',
  })
  @ApiNotFoundResponse({
    description: 'The file with the specified ID could not be found.',
  })
  public async getFile(@Param('fileId') fileId: string, @Res() res: any) {
    const file = await this.fileService.getFilePathById(fileId);
    const host = await this.configService.get('hostUrl');
    console.log(`${host}/${file}`);

    return res.redirect(`${host}/${file}`);
  }

  @Delete('folder/:folderId')
  @UseGuards(PermissionsGuard)
  @Permissions(FOLDER_PERMISSIONS.OWNER)
  @ApiOkResponse({
    description: 'The folder with the specified ID was deleted successfully.',
  })
  @ApiNotFoundResponse({
    description: 'The folder with the specified ID could not be found.',
  })
  @ApiOperation({ summary: 'Delete a folder' })
  public async deleteFolder(@Param('folderId') folderId: string) {
    return this.fileService.deleteFolder(folderId);
  }

  @Delete('files/:folderId/:fileId')
  @UseGuards(PermissionsGuard)
  @Permissions(FOLDER_PERMISSIONS.OWNER)
  public async deleteFile(@Param('fileId') fileId: string) {
    return this.fileService.deleteFile(fileId);
  }

  @Put('move/:folderId/:destinationFolderId')
  @UseGuards(PermissionsGuard)
  @Permissions(FOLDER_PERMISSIONS.OWNER)
  public async moveFolder(
    @Param('folderId') folderId: string,
    @Param('destinationFolderId') destinationFolderId: string,
  ) {
    return this.fileService.moveFolder(folderId, destinationFolderId);
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
