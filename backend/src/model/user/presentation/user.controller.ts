import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';

import { UserResponseDto, UserService } from '@/model/user/application';
import {
  ChangePasswordDto,
  UpdateUserDto,
  UserQueryDto,
} from '@/model/user/application/dto/user.dto';
import { CurrentUser, JWTAuthGuard } from '@/shared';

@Controller('user')
@UseGuards(JWTAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  getMe(
    @Query() query: UserQueryDto,
    @CurrentUser('sub') id: string,
  ): Promise<UserResponseDto> {
    return this.userService.findById(id);
  }

  @Patch('me')
  update(
    @CurrentUser('sub') id: string,
    @Body() dto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.userService.update(id, dto);
  }

  @Patch('me/changePassword')
  changePassword(
    @CurrentUser('sub') id: string,
    @Body() dto: ChangePasswordDto,
  ): Promise<void> {
    return this.userService.changePassword(id, dto);
  }

  @Delete('me')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@CurrentUser('sub') id: string) {
    return this.userService.delete(id);
  }
}
