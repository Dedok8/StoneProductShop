import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import {
  CreateUserDto,
  FindByEmailQueryDto,
  UpdateUserDto,
  UpdateUserRoleDto,
  UserQueryDto,
  UserService,
} from '@/model/user/application';
import { JWTAuthGuard, Roles, RolesGuard } from '@/shared';
import { UserRole } from '@/shared/guards/role/user-role';

@Controller('admin/user')
@Roles(UserRole.ADMIN)
@UseGuards(JWTAuthGuard, RolesGuard)
export class AdminController {
  constructor(private readonly userService: UserService) {}

  @Get()
  getAll(@Query() query: UserQueryDto) {
    return this.userService.findAll(query);
  }

  @Get('search')
  findByEmail(@Query() query: FindByEmailQueryDto) {
    return this.userService.findByEmail(query.email);
  }

  @Get(':id')
  findUserById(@Param('id', ParseUUIDPipe) id: string) {
    return this.userService.findById(id);
  }

  @Patch(':id')
  updateUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.userService.update(id, dto);
  }

  @Patch(':id/role')
  updateRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserRoleDto,
  ) {
    return this.userService.updateRole(id, dto);
  }

  @Post()
  createUser(@Body() dto: CreateUserDto) {
    return this.userService.create(dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteUser(@Param('id', ParseUUIDPipe) id: string) {
    return this.userService.delete(id);
  }
}
