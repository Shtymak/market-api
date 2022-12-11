import { Request } from 'express';
import { GetUserDto } from './../users/dto/get-user.dto';

export abstract class RequestWithUser extends Request {
  user: GetUserDto;
}
