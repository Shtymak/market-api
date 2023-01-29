import { FolderUser, FolderUserDocument } from './folder.user.model';
import { FOLDER_PERMISSIONS } from './../roles/permission.enum';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import CreateFolderDto from './dto/create-folder.dto';
import { Folder, FolderDocument } from './folder.model';
import UploadFileDto from './dto/upload-file.dto';
import { FileDocument, File } from './file.model';
import { FILE_ICON, FILE_TYPE, FileInfo } from './file-info.type';

@Injectable()
export class FileService {
  constructor(
    @InjectModel(FolderUser.name)
    private readonly folderUserModel: Model<FolderUserDocument>,
    @InjectModel(Folder.name)
    private readonly folderModel: Model<FolderDocument>,
    @InjectModel(File.name)
    private readonly fileModel: Model<FileDocument>,
  ) {}
  private logger = new Logger(FileService.name);
  public async getPermissionForUser(id: string): Promise<string> {
    try {
      const folderUser = await this.folderUserModel.findOne({ user: id });
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

  public async createFolder(folderDto: CreateFolderDto): Promise<Folder> {
    try {
      const { name, parentFolderId } = folderDto;
      if (!parentFolderId) {
        const folder = await this.folderModel.create({
          name,
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
      const { folderId, file, name } = uploadFile;
      const folder = await this.folderModel.findById(folderId);
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
      const newFile = await this.fileModel.create({
        name,
        info: fileInfo,
        folder: folderId,
        createdBy: uploadFile.creatorId,
        path: file.path,
      });

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
