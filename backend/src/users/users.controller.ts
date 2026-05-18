import { Controller, Post, Body } from '@nestjs/common';
import { UsersService } from './users.service';

export class CreateUserDto {
  username: string;
  password: string;
}

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  async register(@Body() body: CreateUserDto) {
    return this.usersService.createUser(body.username, body.password);
  }
}