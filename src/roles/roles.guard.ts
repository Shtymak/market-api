import {
  CanActivate,
  Injectable,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector, private jwtService: JwtService) {}
  private logger = new Logger(RolesGuard.name);

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const requiredRoles = this.reflector.getAllAndOverride<string[]>(
        ROLES_KEY,
        [context.getHandler(), context.getClass()],
      );
      if (!requiredRoles) {
        return true;
      }
      const request = context.switchToHttp().getRequest();
      const authHeader = request.headers.authorization;
      const bearer = authHeader.split(' ')[0];
      const token = authHeader.split(' ')[1];
      if (bearer !== 'Bearer' || !token) {
        throw new UnauthorizedException({
          message: 'User is not authorized',
        });
      }
      const user = this.jwtService.verify(token);
      request.user = user;
      return user.roles.some((role) => requiredRoles.includes(role.value));
    } catch (error) {
      this.logger.error(`RolesGuard error: ${error.message}`);
      throw new HttpException(error.message, error.status);
    }
  }
}
