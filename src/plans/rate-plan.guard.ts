import { FodlerService } from './../file/folder.service';
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';
import { StoragePlans } from './rate-plan.model';

@Injectable()
export class FolderStorageLimitGuard implements CanActivate {
  constructor(
    private readonly folderService: FodlerService,
    private jwtService: JwtService,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
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
    const user = this.jwtService.verify(token);
    const { storagePlan } = user;
    const currentPlan = StoragePlans.find((plan) => plan.name === storagePlan);
    const storageLimitGB = currentPlan.storageLimit;
    return this.folderService.getFolderSize(user.id).then((sizeMB) => {
      const sizeGB = sizeMB / 1024 / 1024;

      if (sizeGB <= storageLimitGB) {
        return true;
      } else {
        return false;
      }
    });
  }
}
