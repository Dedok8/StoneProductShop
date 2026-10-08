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
import { USER_ROLE } from '@stone-shop/shared';

import {
  PaginatedUsersResponseDto,
  UserResponseDto,
  UserService,
} from '@/model/user/application';
import {
  CreateUserDto,
  SearchUserDto,
  UpdateUserDto,
  UpdateUserRoleDto,
  UserQueryDto,
} from '@/model/user/application/dto/user.dto';
import { JWTAuthGuard, Roles, RolesGuard } from '@/shared';

@Controller('admin/user')
@Roles(USER_ROLE.ADMIN)
@UseGuards(JWTAuthGuard, RolesGuard)
export class AdminController {
  constructor(private readonly userService: UserService) {}

  @Get()
  getAll(@Query() query: UserQueryDto): Promise<PaginatedUsersResponseDto> {
    return this.userService.findAll(query);
  }

  @Get('search')
  search(@Query() query: SearchUserDto): Promise<UserResponseDto[]> {
    return this.userService.search(query.query);
  }

  // @Get('search/email')
  // findByEmail(@Query() query: FindByEmailQueryDto): Promise<UserResponseDto> {
  //   return this.userService.findByEmail(query.email);
  // }

  @Get(':id')
  findUserById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<UserResponseDto> {
    return this.userService.findById(id);
  }

  @Patch(':id')
  updateUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.userService.update(id, dto);
  }

  @Patch(':id/role')
  updateRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserRoleDto,
  ): Promise<UserResponseDto> {
    return this.userService.updateRole(id, dto);
  }

  @Post()
  createUser(@Body() dto: CreateUserDto): Promise<UserResponseDto> {
    return this.userService.create(dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteUser(@Param('id', ParseUUIDPipe) id: string) {
    return this.userService.delete(id);
  }
}
