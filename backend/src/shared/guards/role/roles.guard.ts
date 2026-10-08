import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { USER_ROLE } from '@stone-shop/shared';
import { Observable } from 'rxjs';

import { IAccessTokenPayload } from '@/model/auth/domain';
import { ROLES_KEY } from '@/shared/decorators';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<USER_ROLE[]>(
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
