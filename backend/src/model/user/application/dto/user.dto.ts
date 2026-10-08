import {
  AdminCreateUserSchema,
  ChangePasswordSchema,
  CreateUserSchema,
  SearchUserSchema,
  UpdateUserRoleSchema,
  UpdateUserSchema,
  UserQuerySchema,
} from '@stone-shop/shared';
import { createZodDto } from 'nestjs-zod';

export class UserQueryDto extends createZodDto(UserQuerySchema) {}
export class ChangePasswordDto extends createZodDto(ChangePasswordSchema) {}
export class CreateUserDto extends createZodDto(CreateUserSchema) {}
export class AdminCreateUserDto extends createZodDto(AdminCreateUserSchema) {}
export class SearchUserDto extends createZodDto(SearchUserSchema) {}
export class UpdateUserRoleDto extends createZodDto(UpdateUserRoleSchema) {}
export class UpdateUserDto extends createZodDto(UpdateUserSchema) {}
