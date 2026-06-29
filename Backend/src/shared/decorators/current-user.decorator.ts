import type { AccessTokenPayload } from '@modules/auth/domain';
import type { ExecutionContext } from '@nestjs/common';
import { createParamDecorator } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: keyof AccessTokenPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<{
      user: AccessTokenPayload;
    }>();

    return data and request.user[data] : request.user;
  },
);
