import { FolderUser, FolderUserDocument } from './folder.user.model';
import { FOLDER_PERMISSIONS } from './../roles/permission.enum';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class FileService {
  constructor(
    @InjectModel(FolderUser.name)
    private readonly folderUserModel: Model<FolderUserDocument>,
  ) {}
  private logger = new Logger(FileService.name);
  async getPermissionForUser(id: string) {
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
}
