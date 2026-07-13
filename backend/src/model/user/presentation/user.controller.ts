import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  UseGuards,
} from '@nestjs/common';

import {
  ChangePasswordDto,
  UpdateUserDto,
  UserService,
} from '@/model/user/application';
import { CurrentUser, JWTAuthGuard } from '@/shared';


@Controller('user')
@UseGuards(JWTAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  getMe(@CurrentUser('sub') id: string) {
    return this.userService.findById(id);
  }

  @Patch('me')
  update(@CurrentUser('sub') id: string, @Body() dto: UpdateUserDto) {
    return this.userService.update(id, dto);
  }

  @Patch('me/password')
  changePassword(
    @CurrentUser('sub') id: string,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.userService.changePassword(id, dto);
  }

  @Delete('me')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@CurrentUser('sub') id: string) {
    return this.userService.delete(id);
  }
}
