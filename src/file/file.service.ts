import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as fs from 'fs';
import mongoose, { Model, Types } from 'mongoose';
import * as path from 'path';
import { CacheService } from 'src/redis/cache.facade';
import { FOLDER_PERMISSIONS } from './../roles/permission.enum';
import FolderEntriesDto from './dto/folder-entries.dto';
import UploadFileDto from './dto/upload-file.dto';
import { FILE_ICON, FILE_TYPE, FileInfo } from './file-info.type';
import { File, FileDocument } from './file.model';
import { Folder, FolderDocument } from './folder.model';
import { FodlerService } from './folder.service';
import { FolderUser, FolderUserDocument } from './folder.user.model';
import * as util from 'util';

@Injectable()
export class FileService {
  constructor(
    @InjectModel(FolderUser.name)
    private readonly folderUserModel: Model<FolderUserDocument>,
    @InjectModel(Folder.name)
    private readonly folderModel: Model<FolderDocument>,
    @InjectModel(File.name)
    private readonly fileModel: Model<FileDocument>,
    private readonly folderService: FodlerService,
    private readonly redisService: CacheService,
  ) {}
  private logger = new Logger(FileService.name);

  public async getPermissionForUser(
    userId: string,
    folderId: string,
  ): Promise<string> {
    try {
      const folder = await this.folderModel.findOne({
        $or: [
          { _id: new Types.ObjectId(folderId) },
          { id: new Types.ObjectId(folderId) },
        ],
      });

      if (!folder) {
        throw new HttpException('Folder not found', HttpStatus.NOT_FOUND);
      }

      if (folder.id.toString() === userId) {
        return FOLDER_PERMISSIONS.OWNER;
      }
      const folderUser = await this.folderUserModel.findOne({
        user: userId,
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

  public async getFilesByFolderId(id: string): Promise<File[]> {
    try {
      const { files } = await this.folderService.getFolderById(id);
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
    const { folderId, file, creatorId } = uploadFile;
    const MAX_FILE_SIZE = 1024 * 1024 * 10; // 10MB

    // валідація вхідних параметрів
    if (!folderId || !file || file.size > MAX_FILE_SIZE) {
      if (file.size > MAX_FILE_SIZE) {
        throw new HttpException('File size is too big', HttpStatus.BAD_REQUEST);
      }
      throw new HttpException('Invalid file or folder', HttpStatus.BAD_REQUEST);
    }

    try {
      // знайти папку
      const folder = await this.folderModel.findOne({
        $or: [{ _id: folderId }, { id: folderId }],
      });

      if (!folder) {
        throw new HttpException('Folder not found', HttpStatus.NOT_FOUND);
      }
      // отримати інформацію про файл
      console.log(file.mimetype);

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

      // отримати шлях до папки

      const logicPath = await this.folderService.getPathWithParentFolder(
        folder,
      );
      console.log(logicPath);

      const staticFolderPath = path.join(
        __dirname,
        '..',
        '..',
        '..',
        'uploads',
        logicPath,
      );

      // зберегти файл
      const fileId = new mongoose.Types.ObjectId();
      const fileExtension = file.mimetype.split('/')[1];
      // доповнюємо шлях до файлу інформацією про розширення файлу
      const filePath = `${staticFolderPath}/${fileId}.${fileExtension}`;

      // створюємо новий файл
      const newFile = await this.fileModel.create({
        name: file.originalname,
        info: fileInfo,
        folder: folder,
        createdBy: creatorId,
        path: filePath,
      });

      // додаємо створений файл до списку файлів в папці
      folder.files.push(newFile);
      await folder.save();

      // зберігаємо файл на сервер
      await new Promise<void>((resolve, reject) => {
        fs.writeFile(filePath, file.buffer, (error) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        });
      });
      // Створіть новий об'єкт з потрібними властивостями без циклічних посилань
      const sanitizedFile = {
        id: newFile.id,
        createdAt: newFile.createdAt,
        updatedAt: newFile.updatedAt,
        name: newFile.name,
        path: newFile.path,
        createdBy: newFile.createdBy,
        info: newFile.info,
        folder: null,
      };

      // повертаємо створений файл
      await this.redisService.delete(`folder:${folderId}`);
      console.log(util.inspect(sanitizedFile, false, null, true));

      return sanitizedFile;
    } catch (e) {
      this.logger.error(e);
      throw new HttpException(
        'Error uploading file',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  public removeCircularReference(file) {
    const { folder, ...fileWithoutFolder } = file;
    return fileWithoutFolder;
  }

  public async deleteFile(fileId: string): Promise<void> {
    try {
      const fileToDelete = await this.fileModel.findOne({
        $or: [{ _id: fileId }, { id: fileId }],
      });
      if (!fileToDelete) {
        throw new HttpException('File not found', HttpStatus.NOT_FOUND);
      }

      // Remove file from the file system
      const filePath = fileToDelete.path;
      await fs.promises.unlink(filePath);

      // Delete file and its associated data from the database
      await this.fileModel.deleteOne({ _id: fileId });
      const folder = await this.folderModel.findOne({
        $or: [{ _id: fileToDelete.folder }, { id: fileToDelete.folder }],
      });
      if (folder) {
        folder.files = folder.files.filter((f) => f.toString() !== fileId);
        await folder.save();
      }
      await this.redisService.delete(`folder:${folder._id}`);
    } catch (e) {
      this.logger.error(e);
      throw new HttpException(
        'Error deleting file',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  public async downloadFile(fileId: string): Promise<Buffer> {
    try {
      // знайти файл

      this.logger.debug(`fileId: ${fileId}`);
      const file = await this.fileModel.findOne({
        $or: [{ _id: fileId }, { id: fileId }],
      });
      if (!file) {
        throw new HttpException('File not found', HttpStatus.NOT_FOUND);
      }

      // отримати шлях до файлу
      const folder = await this.folderModel.findOne({
        $or: [{ _id: file.folder }, { id: file.folder }],
      });
      if (!folder) {
        throw new HttpException('Folder not found', HttpStatus.NOT_FOUND);
      }
      const filePath = file.path;
      const maskKey = 'uploads';
      const maskIndex = filePath.indexOf(maskKey);
      const staticPath = filePath.slice(maskIndex + maskKey.length + 1);

      // повернути файл
      const finalPath = path.join(
        __dirname,
        '..',
        '..',
        '..',
        'uploads',
        staticPath,
      );
      this.logger.debug(`finalPath: ${finalPath}`);

      const fileBuffer = fs.readFileSync(finalPath);
      return fileBuffer;
    } catch (e) {
      this.logger.error(e);
      throw new HttpException(
        'Error downloading file',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  public async getFilePathById(id: string): Promise<string> {
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

  public async getFilesListByFolderId(id: string): Promise<FolderEntriesDto> {
    try {
      const candidateFolder = await this.folderModel.findOne({
        $or: [{ _id: id }, { id }],
      });
      if (!candidateFolder) {
        throw new HttpException('Folder not found', HttpStatus.NOT_FOUND);
      }
      const childrenFolders = await this.folderModel.find({
        $or: [
          { parentFolderId: candidateFolder.id },
          { parentFolderId: candidateFolder._id },
        ],
      });
      const childrenFiles = await this.fileModel.find({
        folder: id,
      });

      const users = await this.folderUserModel.find({
        $or: [{ folder: candidateFolder.id }, { folder: candidateFolder._id }],
      });

      return {
        folders: childrenFolders,
        files: childrenFiles,
        users,
      };
    } catch (e) {
      this.logger.error(e);
      throw new HttpException(
        'Error getting files list',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
