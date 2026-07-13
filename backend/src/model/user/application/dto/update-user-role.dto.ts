import { IsEnum } from 'class-validator';

import { UserRole } from '@/shared';

export class UpdateUserRoleDto {
  @IsEnum(UserRole)
  role: UserRole;
}
