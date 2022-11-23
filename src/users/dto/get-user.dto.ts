import { CreateUserDto } from './create-user.dto';
export class GetUserDto extends CreateUserDto {
  constructor(partial: Partial<GetUserDto>) {
    super(partial);
  }
}
