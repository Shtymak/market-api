import { User } from '../user.model';
import { CreateUserDto } from './create-user.dto';
import { FullUserDto } from './full-user.dto';
export class GetUserDto extends CreateUserDto {
  constructor(partial: User | FullUserDto) {
    super(partial);
    delete this.password;
  }
}
