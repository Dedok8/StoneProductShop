import { UserService } from '@modules/user/application';
import { UserRole } from '@modules/user/domain';
import { UpdateUserDto } from '@modules/user/presentation/dto';
import {
  Controller,
  Get,
  Param,
  Patch,
  Delete,
  Body,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '@shared/decorators';
import { RolesGuard } from '@shared/guards';

@Controller('admin/users')
@Roles(UserRole.ADMIN)
@UseGuards(RolesGuard)
export class AdminUserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  getAllUsers() {
    return this.userService.getAllUsers();
  }

  @Get(':id')
  getUser(@Param('id') id: string) {
    return this.userService.getUser(id);
  }

  @Patch(':id')
  updateUser(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.userService.updateUser(id, dto);
  }

  @Delete(':id')
  deleteUser(@Param('id') id: string) {
    return this.userService.deleteUser(id);
  }
}
