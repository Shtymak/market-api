import { FileService } from './../file/file.service';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  HttpException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { PERMISSIONS_KEY } from './permission.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
    private fileService: FileService,
  ) {}
  private logger = new Logger(PermissionsGuard.name);

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
        PERMISSIONS_KEY,
        [context.getHandler(), context.getClass()],
      );
      if (!requiredPermissions) {
        return true;
      }
      const request = context.switchToHttp().getRequest();
      const authHeader = request.headers.authorization;
      if (!authHeader) {
        throw new UnauthorizedException({
          message: 'User is not authorized',
        });
      }
      const bearer = authHeader.split(' ')[0];
      const token = authHeader.split(' ')[1];
      if (bearer !== 'Bearer' || !token) {
        throw new UnauthorizedException({
          message: 'User is not authorized',
        });
      }
      const folderId = request.params.folderId;
      if (!folderId) {
        throw new ForbiddenException({
          message: 'Folder id is not provided',
        });
      }
      const user = this.jwtService.verify(token);

      const folderPermissionsForUser =
        await this.fileService.getPermissionForUser(user.id, folderId);

      const hasPermission = requiredPermissions.some((permission) => {
        return folderPermissionsForUser === permission;
      });

      if (!hasPermission) {
        throw new ForbiddenException({
          message:
            'User does not have permission to do this action for this folder',
        });
      }
      request.user = user;
      return true;
    } catch (error) {
      this.logger.error(`Permission Guard error: ${error}`);
      throw new HttpException(error.message, error.status);
    }
  }
}
