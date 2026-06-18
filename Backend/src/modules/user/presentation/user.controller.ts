import { UserService } from '@modules/user/application';
import { UpdateUserDto } from '@modules/user/presentation/dto';
import {
  Controller,
  Get,
  Patch,
  Delete,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CurrentUser } from '@shared/decorators';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  getMe(@CurrentUser('id') id: string) {
    return this.userService.getUser(id);
  }

  @Patch('me')
  updateMe(@CurrentUser('id') id: string, @Body() data: UpdateUserDto) {
    return this.userService.updateUser(id, data);
  }

  @Delete('me')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteMe(@CurrentUser('id') id: string) {
    return this.userService.deleteUser(id);
  }
}
