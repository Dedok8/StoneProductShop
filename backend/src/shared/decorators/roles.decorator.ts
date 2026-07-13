import { SetMetadata } from '@nestjs/common';

import type { UserRole } from '@/shared/guards/role/user-role';

export const ROLES_KEY = 'roles';

export const Roles = (...roles: UserRole[]) => {
  return SetMetadata(ROLES_KEY, roles);
};
