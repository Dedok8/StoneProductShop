import { SetMetadata } from '@nestjs/common';
import type { USER_ROLE } from '@stone-shop/shared';

export const ROLES_KEY = 'roles';

export const Roles = (...roles: USER_ROLE[]) => {
  return SetMetadata(ROLES_KEY, roles);
};
