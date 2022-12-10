import { RedisService } from './../redis/redis.service';
import { logger } from '@azure/storage-blob';
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
import { TokenValidationDto } from 'src/auth/dto/token-validation.dto';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
    private redisService: RedisService,
  ) {}
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
      const validationData = await this.redisService.get(user.id);
      if (!validationData) {
        throw new UnauthorizedException({
          message: 'User is not authorized',
        });
      }
      const { tokens }: TokenValidationDto = JSON.parse(validationData);
      const thisToken = tokens.find((t) => t.token === token);

      if (!thisToken || !thisToken.isValid) {
        throw new UnauthorizedException({
          message: 'User is not authorized',
        });
      }
      request.user = user;
      const permission = user.roles.some((role) =>
        requiredRoles.includes(role),
      );
      return permission;
    } catch (error) {
      this.logger.error(`RolesGuard error: ${error.message}`);
      throw new HttpException(error.message, error.status);
    }
  }
}
