import { UsersService } from './../users/users.service';
import { FolderUser, FolderUserDocument } from './folder.user.model';
import { FOLDER_PERMISSIONS } from './../roles/permission.enum';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import CreateFolderDto from './dto/create-folder.dto';
import { Folder, FolderDocument } from './folder.model';
import { Document, SchemaTypes } from 'mongoose';
import UploadFileDto from './dto/upload-file.dto';
import { FileDocument, File } from './file.model';
import { FILE_ICON, FILE_TYPE, FileInfo } from './file-info.type';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FileService {
  constructor(
    @InjectModel(FolderUser.name)
    private readonly folderUserModel: Model<FolderUserDocument>,
    @InjectModel(Folder.name)
    private readonly folderModel: Model<FolderDocument>,
    @InjectModel(File.name)
    private readonly fileModel: Model<FileDocument>,
    private readonly userSrvice: UsersService,
  ) {}
  private logger = new Logger(FileService.name);
  public async getPermissionForUser(
    id: string,
    folderId: string,
  ): Promise<string> {
    try {
      const folderUser = await this.folderUserModel.findOne({
        user: id,
        folder: folderId,
      });

      if (!folderUser) {
        return FOLDER_PERMISSIONS.GUEST;
      }
      return folderUser.role;
    } catch (e) {
      this.logger.error(e);
      throw new HttpException(
        'Error getting permissions for user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  public async createFolder(
    folderDto: CreateFolderDto,
    ownerId: string,
  ): Promise<Folder> {
    try {
      const { name, parentFolderId, role } = folderDto;
      if (!parentFolderId) {
        const folder = await this.folderModel.create({
          name,
        });
        const staticFolderPath = path.join(
          __dirname,
          '..',
          '..',
          '..',
          'uploads',
        );
        fs.mkdirSync(`${staticFolderPath}/${folder._id}`);

        await this.folderUserModel.create({
          user: ownerId,
          role: role,
          folder: folder.id,
        });

        return folder;
      }

      const parentFolder = await this.folderModel.findById(parentFolderId);
      if (!parentFolder) {
        throw new HttpException(
          'Parent folder not found',
          HttpStatus.NOT_FOUND,
        );
      }
      const folder = await this.folderModel.create({
        name,
        parentFolderId,
      });

      await this.folderUserModel.create({
        user: ownerId,
        role: role,
        folder: folder.id,
      });

      const staticFolderPath = path.join(
        __dirname,
        '..',
        '..',
        '..',
        'uploads',
      );
      fs.mkdirSync(` ${staticFolderPath}/${folder._id}`);

      return folder;
    } catch (e) {
      this.logger.error(e);
      throw new HttpException(
        'Error creating folder',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  public async getFolderById(id: string) {
    try {
      const folder = await this.folderModel.findById(id);
      if (!folder) {
        throw new HttpException('Folder not found', HttpStatus.NOT_FOUND);
      }
      return folder;
    } catch (e) {
      this.logger.error(e);
      throw new HttpException(
        'Error getting folder',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  public async uploadFile(uploadFile: UploadFileDto): Promise<File> {
    try {
      const { folderId, file } = uploadFile;
      const folder = await this.folderModel.findOne({
        id: folderId,
      });

      if (!folder) {
        throw new HttpException('Folder not found', HttpStatus.NOT_FOUND);
      }
      const fileType =
        FILE_TYPE[file.mimetype.toUpperCase()] || FILE_TYPE.UNKNOWN;
      const fileIcon = FILE_ICON[fileType];
      const fileInfo: FileInfo = {
        lastUpdate: new Date(),
        size: file.size,
        type: fileType,
        icon: fileIcon,
      };
      const staticFolderPath = path.join(
        __dirname,
        '..',
        '..',
        '..',
        'uploads',
        folder._id.toString(),
      );
      const newFile = await this.fileModel.create({
        name: file.originalname,
        info: fileInfo,
        folder: folder,
        createdBy: uploadFile.creatorId,
        path: `${staticFolderPath}`,
      });

      await this.folderModel.updateOne(
        { _id: folder._id },
        { $push: { files: newFile } },
      );

      fs.writeFileSync(
        `${staticFolderPath}/${newFile.id}.${file.mimetype.split('/')[1]}`,
        file.buffer,
        {
          flag: 'a+',
        },
      );

      return newFile;
    } catch (e) {
      this.logger.error(e);
      throw new HttpException(
        'Error uploading file',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
