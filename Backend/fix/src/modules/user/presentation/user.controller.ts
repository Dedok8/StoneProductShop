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
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '@shared/decorators';
import { JwtAuthGuard } from '@shared/guards';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  getMe(@CurrentUser('sub') id: string) {
    return this.userService.findById(id);
  }

  @Patch('me')
  updateMe(@CurrentUser('sub') id: string, @Body() data: UpdateUserDto) {
    return this.userService.update(id, data);
  }

  @Delete('me')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteMe(@CurrentUser('sub') id: string) {
    return this.userService.delete(id);
  }
}
