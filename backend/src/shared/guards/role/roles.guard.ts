import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

import { IAccessTokenPayload } from '@/model/auth/domain';
import { ROLES_KEY } from '@/shared/decorators';
import { UserRole } from '@/shared/guards/role/user-role';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) return true;

    const request = context.switchToHttp().getRequest<{
      user: IAccessTokenPayload;
    }>();

    if (!request.user) return false;

    return requiredRoles.includes(request.user.role);
  }
}
