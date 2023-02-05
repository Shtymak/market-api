import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as fs from 'fs';
import { Model, Types, Document, Query } from 'mongoose';
import * as path from 'path';
import { FOLDER_PERMISSIONS } from './../roles/permission.enum';
import { UsersService } from './../users/users.service';
import CreateFolderDto from './dto/create-folder.dto';
import UploadFileDto from './dto/upload-file.dto';
import { FILE_ICON, FILE_TYPE, FileInfo } from './file-info.type';
import { File, FileDocument } from './file.model';
import { Folder, FolderDocument } from './folder.model';
import { FolderUser, FolderUserDocument } from './folder.user.model';

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
      const folder = await this.folderModel.findOne({
        $or: [{ _id: folderId }, { id: folderId }],
      });
      const folderUser = await this.folderUserModel.findOne({
        user: id,
        folder: folder.id,
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
      const staticFolderPath = path.join(
        __dirname,
        '..',
        '..',
        '..',
        'uploads',
      );
      if (!parentFolderId) {
        const folder = await this.folderModel.create({
          name,
        });
        fs.mkdirSync(`${staticFolderPath}/${folder._id}`);

        await this.folderUserModel.create({
          user: ownerId,
          role: role,
          folder: folder.id,
        });

        return folder;
      }

      const parentFolder = await this.folderModel.findOne({
        id: parentFolderId,
      });
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

      const logicPath = await this.getPathWithParentFolder(parentFolder);

      const folderPath = path.join(
        __dirname,
        '..',
        '..',
        '..',
        'uploads',
        logicPath,
      );

      await this.folderUserModel.create({
        user: ownerId,
        role: role,
        folder: folder.id,
      });
      fs.mkdirSync(`${folderPath}/${folder._id}`);
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
      const folder = await this.folderModel.findOne({ id });
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

  public async getFilesByFolderId(id: string) {
    try {
      const { files } = await this.getFolderById(id);
      const filesInfo = await this.fileModel.find({ _id: { $in: files } });
      return filesInfo;
    } catch (e) {
      this.logger.error(e);
      throw new HttpException(
        'Error getting files',
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
        FILE_TYPE[file.mimetype.split('/')[1].toUpperCase()] ||
        FILE_TYPE.UNKNOWN;
      const fileIcon = FILE_ICON[fileType];
      const fileInfo: FileInfo = {
        lastUpdate: new Date(),
        size: file.size,
        type: fileType,
        icon: fileIcon,
      };

      const logicPath = await this.getPathWithParentFolder(folder);

      const staticFolderPath = path.join(
        __dirname,
        '..',
        '..',
        '..',
        'uploads',
        logicPath,
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

  public async getFileById(id: string) {
    try {
      const file = await this.fileModel.findOne({ $or: [{ id }, { _id: id }] });
      const { path: filePath, name, info } = file;

      const staticPathRegex = /.*\/uploads\/(.*)/;
      const staticPath = path.join(
        'uploads',
        staticPathRegex.exec(filePath)[1],
        `${file.id.toString()}.${info.type}`,
      );

      return staticPath;
    } catch (e) {
      this.logger.error(e);
      throw new HttpException(
        'Error getting file',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async getPathWithParentFolder(folder: Folder | any) {
    if (!folder.parentFolderId) {
      return folder._id.toString();
    }
    const parentFolder = await this.folderModel.findOne({
      id: folder.parentFolderId,
    });
    return `${await this.getPathWithParentFolder(
      parentFolder,
    )}/${folder._id.toString()}`;
  }
}
